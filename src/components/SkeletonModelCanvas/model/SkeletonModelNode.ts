import {mat4, quat, vec3} from 'gl-matrix';
import Geometry from '../../../utils/render/Geometry';
import Renderer from '../../../utils/render/Renderer';

const ACTIVE_COLOR = [1, 1, 1, 1];
const INACTIVE_COLOR = [1, 1, 1, 0.1];

export default class SkeletonModelNode {

    translation: [number, number, number] = [0, 0, 0];
    forward: [number, number, number] = [0, 0, 1];
    up: [number, number, number] = [0, 1, 0];
    controlPoint?: [number, number, number];
    landmarks: [number, number, number][] = [];

    parent?: SkeletonModelNode;
    children: SkeletonModelNode[] = [];

    active: boolean = true;

    localRotation = quat.create();
    localMatrix = mat4.create();
    worldMatrix = mat4.create();

    originWorldPosition = vec3.create();
    originViewPosition = vec3.create();
    controlPointWorldPosition = vec3.create();
    controlPointViewPosition = vec3.create();
    controlPointScreenPosition = vec3.create();
    landmarksWorldPositions: [number, number, number][] = [];
    landmarksViewPosition: [number, number, number][] = [];

    geometry = new Geometry();

    render(renderer: Renderer) {
        renderer.uniform('u_mMatrix', this.worldMatrix);
        renderer.uniform('u_color', this.active ? ACTIVE_COLOR : INACTIVE_COLOR);
        renderer.drawGeometry(this.geometry);
    }

    dispose(renderer: Renderer) {
        renderer.drawGeometry(this.geometry);
    }

}