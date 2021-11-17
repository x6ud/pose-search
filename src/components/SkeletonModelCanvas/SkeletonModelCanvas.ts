import {InfoCircleOutlined, UndoOutlined} from '@vicons/antd';
import {quat, vec3} from 'gl-matrix';
import {NIcon, NPopconfirm, NSpin} from 'naive-ui';
import {defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch} from 'vue';
import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../config';
import DraggableCamera from '../../utils/DraggableCamera';
import Input from '../../utils/input/Input';
import {MouseDragContext3D, raycastSphereDragMove, raycastSphereDragStart} from '../../utils/input/mouse-drag';
import {isPointInCircle} from '../../utils/math/intersect';
import {quatFromTwoVec, transformInvMat4} from '../../utils/math/math';
import FrameBuffer from '../../utils/render/FrameBuffer';
import Renderer from '../../utils/render/Renderer';
import Shader from '../../utils/render/Shader';
import image2dVert from '../../utils/render/shaders/image-2d.vert';
import Texture from '../../utils/render/Texture';
import {drawCircle} from './draw-shape';
import {landmarksToTransforms} from './landmarks-to-transforms';
import {BodyPart} from './model/BodyPart';
import SkeletonModel from './model/SkeletonModel';
import SkeletonModelNode from './model/SkeletonModelNode';
import lightFrag from './shaders/light.frag';
import lightVert from './shaders/light.vert';
import outlineFrag from './shaders/outline.frag';

const CONTROL_POINT_RADIUS = 8;

export default defineComponent({
    components: {
        NSpin,
        NIcon,
        NPopconfirm,
        InfoCircleOutlined,
        UndoOutlined,
    },
    props: {
        model: SkeletonModel,
        camera: DraggableCamera,
        landmarks: Array as PropType<{ point: [number, number, number], visibility: number }[]>,
        readonly: Boolean,
        highlights: Array as PropType<BodyPart[]>,
    },
    setup(props) {
        const container = ref<HTMLDivElement>();
        const canvas = ref<HTMLCanvasElement>();
        const loading = ref(false);

        let width = 0;
        let height = 0;

        let renderer: Renderer;
        let lightShader: Shader;
        let outlineShader: Shader;
        let modelTexture: Texture;
        let deepTexture: Texture;
        let modelFrameBuffer: FrameBuffer;

        const lightDirection = [0, -1, 0];
        const camera = props.camera || new DraggableCamera();
        camera.far = 5;
        const input = new Input();
        input.callback = onInput;

        const model = props.model || new SkeletonModel();
        let hoveredControlPointNode: SkeletonModelNode | null = null;
        let dragging = false;
        let shiftPressedLastFrame = false;
        const dragContext = new MouseDragContext3D();
        const dragOrigin = vec3.create();
        const dragStartVec = vec3.create();
        const dragEndVec = vec3.create();
        const dragRotation = quat.create();
        const dragStartForward = vec3.create();
        const dragStartUp = vec3.create();

        onMounted(async function () {
            try {
                loading.value = true;
                await model.init();
            } finally {
                loading.value = false;
            }

            renderer = new Renderer(canvas.value!);

            lightShader = renderer.createShader(lightVert, lightFrag);
            outlineShader = renderer.createShader(image2dVert, outlineFrag);

            modelTexture = renderer.createEmptyTexture();
            modelTexture.flipY = true;
            deepTexture = renderer.createDepthTexture();
            deepTexture.flipY = true;
            modelFrameBuffer = renderer.createFrameBuffer();
            renderer.attachColorTexture(modelFrameBuffer, modelTexture);
            renderer.attachDepthTexture(modelFrameBuffer, deepTexture);

            resizeCanvas();
            input.setup(canvas.value!);

            setLandmarks(props.landmarks);
        });

        onBeforeUnmount(function () {
            renderer.deleteShader(lightShader);
            renderer.deleteShader(outlineShader);

            renderer.deleteFrameBuffer(modelFrameBuffer, true);

            input.unload(canvas.value!);
        });

        watch(() => props.landmarks, setLandmarks);

        watch(() => props.highlights, function (highlights) {
            Object.keys(BodyPart).forEach(name => {
                const node = model[name as BodyPart];
                if (highlights?.length) {
                    node.active = !!highlights.includes(name as BodyPart);
                } else {
                    node.active = true;
                }
            });
            render();
        });

        function reset() {
            Object.keys(BodyPart).forEach(name => {
                const node = model[name as BodyPart];
                node.forward = [0, 0, 1];
                node.up = [0, 1, 0];
            });
            camera.zoom = 1;
            camera.rotateX = 0;
            camera.rotateY = 0;
            vec3.set(camera.target, 0, 0, 0);
            camera.update();
            model.update(camera.camera);
            render();
        }

        function setLandmarks(landmarks?: { point: [number, number, number], visibility: number }[]) {
            if (landmarks?.length) {
                const transforms = landmarksToTransforms(landmarks);
                Object.keys(BodyPart).forEach(name => {
                    const node = model[name as BodyPart];
                    const transform = transforms[name as keyof typeof transforms];
                    node.forward = transform.forward;
                    node.up = transform.up;
                    node.active = transform.visibility > LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD;
                });
            } else {
                Object.keys(BodyPart).forEach(name => {
                    const node = model[name as BodyPart];
                    node.forward = [0, 0, 1];
                    node.up = [0, 1, 0];
                    node.active = true;
                });
            }
            camera.zoom = 1;
            camera.rotateX = 0;
            camera.rotateY = 0;
            vec3.set(camera.target, 0, 0, 0);
            camera.update();
            model.update(camera.camera);
            render();
        }

        function resizeCanvas() {
            const rect = container.value!.getBoundingClientRect();
            width = rect.width;
            height = rect.height;

            renderer.resizeCanvas(width, height);
            renderer.resizeFrameBuffer(modelFrameBuffer);

            camera.fitViewport(width, height);
        }

        function onInput(input: Input) {
            camera.onInput(input);
            model.update(camera.camera);

            if (!props.readonly) {
                if (!input.mouseLeft) {
                    dragging = false;
                }
                if (shiftPressedLastFrame && !input.isKeyPressed('Shift')) {
                    shiftPressedLastFrame = false;
                    dragging = false;
                }

                // find hovered
                if (!dragging) {
                    hoveredControlPointNode = null;
                    let hoveredControlPointZ = Infinity;
                    if (model.root) {
                        const stack: SkeletonModelNode[] = [model.root];
                        for (; ;) {
                            const node = stack.pop();
                            if (!node) {
                                break;
                            }
                            stack.push(...node.children);
                            if (!node.controlPoint) {
                                continue;
                            }
                            const cx = (node.controlPointScreenPosition[0] + 1) / 2 * width;
                            const cy = (node.controlPointScreenPosition[1] + 1) / 2 * height;
                            if (isPointInCircle(input.mouseX, height - input.mouseY, cx, cy, CONTROL_POINT_RADIUS)
                                && node.controlPointScreenPosition[2] < hoveredControlPointZ
                            ) {
                                hoveredControlPointNode = node;
                                hoveredControlPointZ = node.controlPointScreenPosition[2];
                            }
                        }
                    }
                }

                const projectedMX = (input.mouseX / width - 0.5) * 2;
                const projectedMY = (-input.mouseY / height + 0.5) * 2;

                if (
                    (input.mouseLeft && !dragging
                        || input.isKeyPressedThisFrame('Shift') && dragging)
                    && hoveredControlPointNode
                ) {
                    // drag start
                    dragging = true;
                    const node = hoveredControlPointNode;
                    raycastSphereDragStart(
                        dragContext,
                        projectedMX, projectedMY,
                        node.originWorldPosition[0], node.originWorldPosition[1], node.originWorldPosition[2],
                        node.controlPointWorldPosition[0], node.controlPointWorldPosition[1], node.controlPointWorldPosition[2],
                        camera.camera
                    );
                    vec3.copy(dragOrigin, node.originWorldPosition);
                    vec3.copy(dragStartVec, node.controlPointWorldPosition);
                    if (node.parent) {
                        transformInvMat4(dragStartVec, dragStartVec, node.parent.worldMatrix);
                        transformInvMat4(dragOrigin, dragOrigin, node.parent.worldMatrix);
                    }
                    vec3.sub(dragStartVec, dragStartVec, dragOrigin);
                    vec3.normalize(dragStartVec, dragStartVec);
                    vec3.copy(dragStartForward, node.forward);
                    vec3.copy(dragStartUp, node.up);
                } else if (input.mouseLeft && dragging && hoveredControlPointNode) {
                    // drag move
                    if (input.isKeyPressed('Shift')) {
                        shiftPressedLastFrame = true;
                        const dx = projectedMX - dragContext.dragStartMousePosition[0];
                        const dy = projectedMY - dragContext.dragStartMousePosition[1];
                        const offset = dx + dy;
                        quat.setAxisAngle(dragRotation, dragStartVec, offset * Math.PI * 2);
                        const node = hoveredControlPointNode;
                        vec3.transformQuat(node.forward, dragStartForward, dragRotation);
                        vec3.normalize(node.forward, node.forward);
                        vec3.transformQuat(node.up, dragStartUp, dragRotation);
                        vec3.normalize(node.up, node.up);
                        model.update(camera.camera, node);
                    } else {
                        if (raycastSphereDragMove(dragContext, projectedMX, projectedMY, camera.camera)) {
                            const node = hoveredControlPointNode;
                            vec3.copy(dragEndVec, dragContext.rayResult1);
                            if (node.parent) {
                                transformInvMat4(dragEndVec, dragEndVec, node.parent.worldMatrix);
                            }
                            vec3.sub(dragEndVec, dragEndVec, dragOrigin);
                            quatFromTwoVec(dragRotation, dragStartVec, dragEndVec);
                            vec3.transformQuat(node.forward, dragStartForward, dragRotation);
                            vec3.normalize(node.forward, node.forward);
                            vec3.transformQuat(node.up, dragStartUp, dragRotation);
                            vec3.normalize(node.up, node.up);
                            model.update(camera.camera, node);
                        }
                    }
                }
            }

            render();
        }

        function render() {
            renderer.blendMode(renderer.BLEND_MODE_PIGMENT);

            // model
            renderer.depthTest(true);
            renderer.cullFace(renderer.SIDE_BACK);
            renderer.startCapture(modelFrameBuffer);
            renderer.clearColor(0, 0, 0, 0);
            renderer.clear(true, true, false);
            renderer.useShader(lightShader);
            renderer.uniform('u_directionalLightDirection', lightDirection);
            renderer.uniform('u_pvMatrix', camera.pvMatrix);
            model.render(renderer);
            renderer.endCapture();

            renderer.save();
            renderer.depthTest(false);
            renderer.clearColor(0xf2 / 0xff, 0xf2 / 0xff, 0xf2 / 0xff, 1.0);
            renderer.clear(true, false, false);
            renderer.centerCamera();
            // begin
            renderer.begin2D();
            // model
            renderer.setColor(1, 1, 1, 1);
            renderer.useShader();
            renderer.draw(modelTexture);
            // outline
            renderer.setColor(0, 0, 0, 0.5);
            renderer.useShader(outlineShader);
            renderer.uniform('u_threshold', 1 / 1000 / (camera.far / 2));
            renderer.uniform('u_deep', deepTexture);
            renderer.draw(modelTexture);
            // end
            renderer.end2D();
            renderer.restore();

            // control points
            if (!props.readonly) {
                renderer.depthTest(false);
                renderer.useShader();
                renderer.begin2D();
                const stack: SkeletonModelNode[] = [model.root];
                for (; ;) {
                    const node = stack.pop();
                    if (!node) {
                        break;
                    }
                    stack.push(...node.children);

                    if (node.controlPoint) {
                        if (node.active) {
                            renderer.setColor(1, 0, 0, node === hoveredControlPointNode ? 1 : 0.25);
                        } else {
                            renderer.setColor(0, 0, 0, node === hoveredControlPointNode ? 1 : 0.25);
                        }
                        const position = node.controlPointScreenPosition;
                        drawCircle(renderer,
                            CONTROL_POINT_RADIUS,
                            position[0] * width / 2,
                            position[1] * height / 2,
                        );
                        drawCircle(renderer,
                            CONTROL_POINT_RADIUS - 2,
                            position[0] * width / 2,
                            position[1] * height / 2,
                        );
                    }
                }
                renderer.end2D();
            }
        }

        return {
            container,
            canvas,
            loading,
            reset,
        };
    }
});