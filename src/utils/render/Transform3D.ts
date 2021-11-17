import {mat4, quat, ReadonlyMat4, ReadonlyQuat, ReadonlyVec3, vec3} from 'gl-matrix';

const DEFAULT_UP: ReadonlyVec3 = [0, 1, 0];

export default class Transform3D {

    private _matrix: Float32Array = new Float32Array(16);
    private _position: Float32Array = new Float32Array([0, 0, 0]);
    private _quaternion: Float32Array = quat.fromEuler(new Float32Array(4), 0, 0, 0) as Float32Array;
    private _scale: Float32Array = new Float32Array([1, 1, 1]);

    private matrixNeedsUpdate: boolean = true;

    private updateMatrix() {
        mat4.fromRotationTranslationScale(
            this._matrix,
            this._quaternion,
            this._position,
            this._scale
        );
        this.matrixNeedsUpdate = false;
    }

    get matrix(): ReadonlyMat4 {
        if (this.matrixNeedsUpdate) {
            this.updateMatrix();
        }
        return this._matrix;
    }

    set matrix(value: ReadonlyMat4) {
        this._matrix.set(value);
        mat4.getTranslation(this._position, this._matrix);
        mat4.getRotation(this._quaternion, this._matrix);
        mat4.getScaling(this._scale, this._matrix);
        this.matrixNeedsUpdate = false;
    }

    get x(): number {
        return this._position[0];
    }

    set x(x: number) {
        if (x === this._position[0]) {
            return;
        }
        this._position[0] = x;
        this.matrixNeedsUpdate = true;
    }

    get y(): number {
        return this._position[1];
    }

    set y(y: number) {
        if (y === this._position[1]) {
            return;
        }
        this._position[1] = y;
        this.matrixNeedsUpdate = true;
    }


    get z(): number {
        return this._position[2];
    }

    set z(z: number) {
        if (z === this._position[2]) {
            return;
        }
        this._position[2] = z;
        this.matrixNeedsUpdate = true;
    }

    get position(): ReadonlyVec3 {
        return this._position;
    }

    set position(value: ReadonlyVec3) {
        if (vec3.exactEquals(value, this._position)) {
            return;
        }
        this._position.set(value);
        this.matrixNeedsUpdate = true;
    }

    get scaleX(): number {
        return this._scale[0];
    }

    set scaleX(x: number) {
        if (x === this._scale[0]) {
            return;
        }
        this._scale[0] = x;
        this.matrixNeedsUpdate = true;
    }

    get scaleY(): number {
        return this._scale[1];
    }

    set scaleY(y: number) {
        if (y === this._scale[1]) {
            return;
        }
        this._scale[1] = y;
        this.matrixNeedsUpdate = true;
    }

    get scaleZ(): number {
        return this._scale[2];
    }

    set scaleZ(z: number) {
        if (z === this._scale[2]) {
            return;
        }
        this._scale[2] = z;
        this.matrixNeedsUpdate = true;
    }

    get scale(): ReadonlyVec3 {
        return this._scale;
    }

    set scale(value: ReadonlyVec3) {
        if (vec3.exactEquals(value, this._scale)) {
            return;
        }
        this._scale.set(value);
        this.matrixNeedsUpdate = true;
    }

    get quaternion(): ReadonlyQuat {
        return this._quaternion;
    }

    set quaternion(value: ReadonlyQuat) {
        if (quat.exactEquals(value, this._quaternion)) {
            return;
        }
        this._quaternion.set(value);
        this.matrixNeedsUpdate = true;
    }

    setRotationDegrees(xDegrees: number, yDegrees: number, zDegrees: number) {
        quat.fromEuler(this._quaternion, xDegrees, yDegrees, zDegrees);
        this.matrixNeedsUpdate = true;
    }

    rotateX(rad: number) {
        quat.rotateX(this._quaternion, this._quaternion, rad);
        this.matrixNeedsUpdate = true;
    }

    rotateY(rad: number) {
        quat.rotateY(this._quaternion, this._quaternion, rad);
        this.matrixNeedsUpdate = true;
    }

    rotateZ(rad: number) {
        quat.rotateZ(this._quaternion, this._quaternion, rad);
        this.matrixNeedsUpdate = true;
    }

    lookAt(eye: ReadonlyVec3, center: ReadonlyVec3, up: ReadonlyVec3 = DEFAULT_UP) {
        mat4.lookAt(this._matrix, eye, center, up);
        mat4.getTranslation(this._position, this._matrix);
        mat4.getRotation(this._quaternion, this._matrix);
        mat4.getScaling(this._scale, this._matrix);
        this.matrixNeedsUpdate = true;
    }

    targetTo(eye: ReadonlyVec3, target: ReadonlyVec3, up: ReadonlyVec3 = DEFAULT_UP) {
        mat4.targetTo(this._matrix, eye, target, up);
        mat4.getTranslation(this._position, this._matrix);
        mat4.getRotation(this._quaternion, this._matrix);
        mat4.getScaling(this._scale, this._matrix);
        this.matrixNeedsUpdate = true;
    }

}
