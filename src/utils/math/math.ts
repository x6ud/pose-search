import {mat3, mat4, quat, ReadonlyMat4, ReadonlyVec3, vec3} from 'gl-matrix';

export function getVertical(out: vec3, vec: ReadonlyVec3) {
    if (Math.abs(vec[0]) > Math.abs(vec[2])) {
        out[0] = -vec[1];
        out[1] = vec[0];
        out[2] = 0;
    } else {
        out[0] = 0;
        out[1] = -vec[2];
        out[2] = vec[1];
    }
}

export const getVerticalInDir = (function () {
    const tmp_vec = vec3.create();
    const ZERO = vec3.fromValues(0, 0, 0);
    return function (out: vec3, vec: ReadonlyVec3, dir: ReadonlyVec3) {
        vec3.cross(tmp_vec, vec, dir);
        vec3.normalize(tmp_vec, tmp_vec);
        if (vec3.exactEquals(tmp_vec, ZERO)) {
            getVertical(tmp_vec, vec);
        }
        vec3.cross(out, vec, dir);
        if (vec3.dot(out, dir) < 0) {
            vec3.negate(out, out);
        }
        vec3.normalize(out, out);
        return out;
    };
})();

export const quatFromTwoUnitVec = (function () {
    const tmp_vert = new Float32Array(3);
    return function (out: quat, from: ReadonlyVec3, to: ReadonlyVec3) {
        const r = vec3.dot(from, to) + 1;
        if (r < 1e-8) {
            if (Math.abs(from[0]) > Math.abs(from[2])) {
                out[0] = -from[1];
                out[1] = from[0];
                out[2] = 0;
                out[3] = 0;
            } else {
                out[0] = 0;
                out[1] = -from[2];
                out[2] = from[1];
                out[3] = 0;
            }
        } else {
            vec3.cross(tmp_vert, from, to);
            out[0] = tmp_vert[0];
            out[1] = tmp_vert[1];
            out[2] = tmp_vert[2];
            out[3] = r;
        }
        return quat.normalize(out, out);
    };
})();

export const quatFromTwoVec = (function () {
    const tmp_a = new Float32Array(3);
    const tmp_b = new Float32Array(3);
    return function (out: quat, from: ReadonlyVec3, to: ReadonlyVec3) {
        vec3.normalize(tmp_a, from);
        vec3.normalize(tmp_b, to);
        return quatFromTwoUnitVec(out, tmp_a, tmp_b);
    };
})();

export const quatLookRotation = (function () {
    const tmp_a = new Float32Array(3);
    const tmp_b = new Float32Array(3);
    const tmp_mat3 = mat3.create();
    return function (out: quat, forward: ReadonlyVec3, up: ReadonlyVec3) {
        vec3.cross(tmp_a, up, forward);
        vec3.normalize(tmp_a, tmp_a);
        vec3.cross(tmp_b, forward, tmp_a);

        tmp_mat3[0] = tmp_a[0];
        tmp_mat3[1] = tmp_a[1];
        tmp_mat3[2] = tmp_a[2];

        tmp_mat3[3] = tmp_b[0];
        tmp_mat3[4] = tmp_b[1];
        tmp_mat3[5] = tmp_b[2];

        tmp_mat3[6] = forward[0];
        tmp_mat3[7] = forward[1];
        tmp_mat3[8] = forward[2];

        return quat.fromMat3(out, tmp_mat3);
    };
})();

export const transformInvMat4 = (function () {
    const tmp_invMat = mat4.create();
    return function (out: vec3, vec: ReadonlyVec3, mat: ReadonlyMat4) {
        mat4.invert(tmp_invMat, mat);
        return vec3.transformMat4(out, vec, tmp_invMat);
    };
})();

export function angleBetweenVec3(a: ReadonlyVec3, b: ReadonlyVec3) {
    const dot = vec3.dot(a, b);
    const sqrLen = vec3.sqrLen(a) * vec3.sqrLen(b);
    const len = Math.sqrt(sqrLen);
    const cos = dot / len;
    if (!isFinite(cos)) {
        return 0;
    }
    return Math.acos(cos);
}