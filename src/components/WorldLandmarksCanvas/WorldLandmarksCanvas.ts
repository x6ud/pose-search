import {vec3} from 'gl-matrix';
import {defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch} from 'vue';
import DraggableCamera from '../../utils/DraggableCamera';
import Input from '../../utils/input/Input';
import Renderer from '../../utils/render/Renderer';
import Shader from '../../utils/render/Shader';
import LandmarksGeometry from './LandmarksGeometry';
import lineFrag from './shaders/line.frag';
import lineVert from './shaders/line.vert';

export default defineComponent({
    props: {
        landmarks: Array as PropType<{ point: [number, number, number], visibility: number }[]>
    },
    setup(props) {
        const container = ref<HTMLDivElement>();
        const canvas = ref<HTMLCanvasElement>();

        let renderer: Renderer;
        let lineShader: Shader;
        const camera = new DraggableCamera();
        const input = new Input();
        input.callback = function (input) {
            camera.onInput(input);
            redraw();
        };
        const poseGeometry = new LandmarksGeometry();

        onMounted(function () {
            input.setup(canvas.value!);
            renderer = new Renderer(canvas.value!);
            lineShader = renderer.createShader(lineVert, lineFrag);
            redraw();
        });

        onBeforeUnmount(function () {
            input.unload(canvas.value!);
            renderer.deleteShader(lineShader);
            poseGeometry.dispose(renderer);
        });

        watch(() => props.landmarks, function () {
            camera.zoom = 1;
            camera.rotateX = 0;
            camera.rotateY = 0;
            vec3.set(camera.target, 0, 0, 0);
            camera.update();
            redraw();
        });

        function redraw() {
            const rect = container.value!.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            renderer.resizeCanvas(width, height);
            camera.fitViewport(width, height);
            renderer.clearColor(0xf2 / 0xff, 0xf2 / 0xff, 0xf2 / 0xff, 1.0);
            renderer.clear(true, true, false);
            renderer.blendMode(renderer.BLEND_MODE_PIGMENT);
            if (props.landmarks?.length) {
                renderer.depthTest(false);
                renderer.useShader(lineShader);
                renderer.uniform('u_color', [1, 1, 1, 1]);
                renderer.uniform('u_pvMatrix', camera.pvMatrix);
                poseGeometry.setLandmarks(renderer, props.landmarks);
                poseGeometry.render(renderer);
            }
        }

        return {
            container,
            canvas,
        };
    }
});