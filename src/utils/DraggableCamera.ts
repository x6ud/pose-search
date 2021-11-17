import {quat, ReadonlyMat4, ReadonlyVec3, vec3} from 'gl-matrix';
import Input from './input/Input';
import {MouseDragContext3D, raycastViewPlaneDragMove, raycastViewPlaneDragStart} from './input/mouse-drag';
import Camera3D from './render/camera/Camera3D';
import OrthographicCamera from './render/camera/OrthographicCamera';
import PerspectiveCamera from './render/camera/PerspectiveCamera';

const CAMERA_ZOOM_IN_STEP = 0.9;
const CAMERA_ZOOM_MIN = -12;
const CAMERA_ZOOM_OUT_STEP = 1.2;
const CAMERA_ZOOM_MAX = 4;

export default class DraggableCamera {

    private viewportWidth: number = 1;
    private viewportHeight: number = 1;

    private readonly perspectiveCamera: PerspectiveCamera;
    private readonly orthographicCamera: OrthographicCamera;

    perspective: boolean = true;
    far: number = 2;
    target: vec3 = vec3.fromValues(0, 0, 0);
    rotateX: number = 0;
    rotateY: number = 0;
    zoom: number = 1;
    private position: vec3 = vec3.fromValues(0, 0, 0);
    private orthographicZoomRatio: number = 1.6;

    private defaultPosition = vec3.fromValues(0, 0, 1);
    private defaultUp = vec3.fromValues(0, 1, 0);
    private up = vec3.fromValues(0, 0, 0);
    private rotationQuat = quat.create();

    private draggingRotation: boolean = false;
    private draggingPosition: boolean = false;
    private dragStartProjectedMouseX: number = 0;
    private dragStartProjectedMouseY: number = 0;
    private dragStartRotateX = 0;
    private dragStartRotateY = 0;
    private positionDragContext = new MouseDragContext3D();

    constructor(fovYRad: number = 45 / 180 * Math.PI, near: number = 0.1, far: number = 1000) {
        this.perspectiveCamera = new PerspectiveCamera(fovYRad, 1, near, far);
        this.orthographicCamera = new OrthographicCamera(-1, 1, -1, 1, near, far);
    }

    screenToView(out: vec3, point: ReadonlyVec3) {
        const camera = this.perspective ? this.perspectiveCamera : this.orthographicCamera;
        camera.screenToView(out, point);
        return out;
    }

    get pvMatrix(): ReadonlyMat4 {
        const camera = this.perspective ? this.perspectiveCamera : this.orthographicCamera;
        return camera.pvMatrix;
    }

    get viewMatrix(): ReadonlyMat4 {
        const camera = this.perspective ? this.perspectiveCamera : this.orthographicCamera;
        return camera.viewMatrix;
    }

    get camera(): Camera3D {
        return this.perspective ? this.perspectiveCamera : this.orthographicCamera;
    }

    fitViewport(width: number, height: number) {
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.update();
    }

    update() {
        const camera = this.camera;
        const zoom = this.zoom <= 0 ? CAMERA_ZOOM_IN_STEP ** (-this.zoom) : CAMERA_ZOOM_OUT_STEP ** this.zoom;
        const viewPortZoom = zoom / 25 * (this.perspective ? 1 : this.orthographicZoomRatio);
        camera.fitViewport(this.viewportWidth * viewPortZoom, this.viewportHeight * viewPortZoom);
        vec3.scale(this.position, this.defaultPosition, this.far * zoom * 2);
        quat.fromEuler(this.rotationQuat, this.rotateX, this.rotateY, 0);
        vec3.transformQuat(this.position, this.position, this.rotationQuat);
        vec3.add(this.position, this.position, this.target);
        camera.position = this.position;
        if (this.rotateX === 90 || this.rotateX === -90) {
            vec3.transformQuat(this.up, this.defaultUp, this.rotationQuat);
            camera.up = this.up;
        } else {
            camera.up = this.defaultUp;
        }
        camera.target = this.target;
    }

    onInput(input: Input) {
        const projectedMouseX = (-this.viewportWidth / 2 + input.mouseX) / this.viewportWidth * 2;
        const projectedMouseY = (+this.viewportHeight / 2 - input.mouseY) / this.viewportHeight * 2;

        // rotation
        if (input.mouseMiddle) {
            if (this.draggingRotation) {
                const dx = projectedMouseX - this.dragStartProjectedMouseX;
                const dy = projectedMouseY - this.dragStartProjectedMouseY;
                this.rotateX = Math.max(-90, Math.min(90, this.dragStartRotateX + dy * 90));
                this.rotateY = (this.dragStartRotateY - dx * 90) % 360;
            } else {
                this.draggingRotation = true;
                this.dragStartProjectedMouseX = projectedMouseX;
                this.dragStartProjectedMouseY = projectedMouseY;
                this.dragStartRotateX = this.rotateX;
                this.dragStartRotateY = this.rotateY;
            }
        } else {
            this.draggingRotation = false;
        }

        // position
        if (input.mouseRight) {
            if (this.draggingPosition) {
                if (raycastViewPlaneDragMove(
                    this.positionDragContext,
                    projectedMouseX, projectedMouseY,
                    this.camera
                )) {
                    vec3.sub(this.target, this.positionDragContext.dragStartTargetPosition, this.positionDragContext.offset);
                }
            } else if (!this.draggingRotation) {
                this.draggingPosition = true;
                raycastViewPlaneDragStart(
                    this.positionDragContext,
                    projectedMouseX, projectedMouseY,
                    this.target[0], this.target[1], this.target[2],
                    this.camera
                );
            }
        } else {
            this.draggingPosition = false;
        }

        // zoom
        if (input.wheelDetY) {
            this.zoom = Math.max(CAMERA_ZOOM_MIN, Math.min(CAMERA_ZOOM_MAX, this.zoom + input.wheelDetY));
        }

        this.update();
    }

}