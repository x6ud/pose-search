import {mat4, ReadonlyMat4, ReadonlyVec3, vec3} from 'gl-matrix';
import Camera3D from './Camera3D';

export default class OrthographicCamera implements Camera3D {

    readonly perspective = false;

    private _pvMatrix: Float32Array = new Float32Array(16);
    private _invPvMatrix: Float32Array = new Float32Array(16);
    private _projectionMatrix: Float32Array = new Float32Array(16);
    private _viewMatrix: Float32Array = new Float32Array(16);

    private _position: Float32Array = new Float32Array(3);
    private _target: Float32Array = new Float32Array(3);
    private _up: Float32Array = new Float32Array([0, 1, 0]);

    private _left: number;
    private _right: number;
    private _bottom: number;
    private _top: number;
    private _near: number;
    private _far: number;

    private matrixNeedsUpdate: boolean = true;

    constructor(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        this._left = left;
        this._right = right;
        this._bottom = bottom;
        this._top = top;
        this._near = near;
        this._far = far;
    }

    fitViewport(width: number, height: number) {
        this.left = -width / 2;
        this.right = width / 2;
        this.bottom = -height / 2;
        this.top = height / 2;
    }

    screenToView(out: vec3, point: ReadonlyVec3) {
        vec3.transformMat4(out, point, this._invPvMatrix);
    }

    private updateMatrix() {
        mat4.ortho(this._projectionMatrix, this._left, this._right, this._bottom, this._top, this._near, this._far);
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

    get left(): number {
        return this._left;
    }

    set left(value: number) {
        if (value === this._left) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._left = value;
    }

    get right(): number {
        return this._right;
    }

    set right(value: number) {
        if (value === this._right) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._right = value;
    }

    get bottom(): number {
        return this._bottom;
    }

    set bottom(value: number) {
        if (value === this._bottom) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._bottom = value;
    }

    get top(): number {
        return this._top;
    }

    set top(value: number) {
        if (value === this._top) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._top = value;
    }

    get near(): number {
        return this._near;
    }

    set near(value: number) {
        if (value === this._near) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._near = value;
    }

    get far(): number {
        return this._far;
    }

    set far(value: number) {
        if (value === this._far) {
            return;
        }
        this.matrixNeedsUpdate = true;
        this._far = value;
    }
}
