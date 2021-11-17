import {mat4, ReadonlyMat4, ReadonlyVec3, vec3} from 'gl-matrix';
import Camera3D from './Camera3D';

export default class PerspectiveCamera implements Camera3D {

    readonly perspective = true;

    private _pvMatrix: Float32Array = new Float32Array(16);
    private _invPvMatrix: Float32Array = new Float32Array(16);
    private _projectionMatrix: Float32Array = new Float32Array(16);
    private _viewMatrix: Float32Array = new Float32Array(16);

    private _position: Float32Array = new Float32Array(3);
    private _target: Float32Array = new Float32Array(3);
    private _up: Float32Array = new Float32Array([0, 1, 0]);

    private _fovYRad: number;
    private _aspect: number;
    private _near: number;
    private _far: number;

    private matrixNeedsUpdate: boolean = true;

    constructor(fovYRad: number, aspect: number, near: number, far: number) {
        this._fovYRad = fovYRad;
        this._aspect = aspect;
        this._near = near;
        this._far = far;
    }

    fitViewport(width: number, height: number) {
        this.aspect = width / height;
    }

    screenToView(out: vec3, point: ReadonlyVec3) {
        vec3.transformMat4(out, point, this._invPvMatrix);
    }

    private updateMatrix() {
        mat4.perspective(this._projectionMatrix, this._fovYRad, this._aspect, this._near, this._far);
        mat4.lookAt(this._viewMatrix, this._position, this._target, this._up);
        mat4.mul(this._pvMatrix, this._projectionMatrix, this._viewMatrix);
        mat4.invert(this._invPvMatrix, this._pvMatrix);
        this.matrixNeedsUpdate = false;
    }

    get pvMatrix(): ReadonlyMat4 {
        if (this.matrixNeedsUpdate) {
            this.updateMatrix();
        }
        return this._pvMatrix;
    }

    get invPvMatrix(): ReadonlyMat4 {
        if (this.matrixNeedsUpdate) {
            this.updateMatrix();
        }
        return this._invPvMatrix;
    }

    get projectionMatrix(): ReadonlyMat4 {
        if (this.matrixNeedsUpdate) {
            this.updateMatrix();
        }
        return this._projectionMatrix;
    }

    get viewMatrix(): ReadonlyMat4 {
        if (this.matrixNeedsUpdate) {
            this.updateMatrix();
        }
        return this._viewMatrix;
    }

    get position(): ReadonlyVec3 {
        return this._position;
    }

    set position(value: ReadonlyVec3) {
        if (vec3.exactEquals(value, this._position)) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._position.set(value);
    }

    get target(): ReadonlyVec3 {
        return this._target;
    }

    set target(value: ReadonlyVec3) {
        if (vec3.exactEquals(value, this._target)) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._target.set(value);
    }

    get up(): ReadonlyVec3 {
        return this._up;
    }

    set up(value: ReadonlyVec3) {
        if (vec3.exactEquals(value, this._up)) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._up.set(value);
    }

    get fovYRad(): number {
        return this._fovYRad;
    }

    set fovYRad(value: number) {
        if (this._fovYRad === value) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._fovYRad = value;
    }

    get aspect(): number {
        return this._aspect;
    }

    set aspect(value: number) {
        if (this._aspect === value) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._aspect = value;
    }

    get near(): number {
        return this._near;
    }

    set near(value: number) {
        if (this._near === value) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._near = value;
    }

    get far(): number {
        return this._far;
    }

    set far(value: number) {
        if (this._far === value) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._far = value;
    }

}
