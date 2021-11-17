import {ReadonlyMat4, ReadonlyVec3, vec3} from 'gl-matrix';

export default interface Camera3D {

    perspective: boolean;
    pvMatrix: ReadonlyMat4;
    invPvMatrix: ReadonlyMat4;
    projectionMatrix: ReadonlyMat4;
    viewMatrix: ReadonlyMat4;
    position: ReadonlyVec3;
    target: ReadonlyVec3;
    up: ReadonlyVec3;

    screenToView(out: vec3, point: ReadonlyVec3): void;

    fitViewport(width: number, height: number): void;

}
