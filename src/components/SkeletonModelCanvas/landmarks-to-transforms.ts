import {quat, vec3} from 'gl-matrix';
import {getVerticalInDir, quatLookRotation} from '../../utils/math/math';
import {BodyPart} from './model/BodyPart';

type Vec = [number, number, number];

type Quat = [number, number, number, number];

function mid(p1: Vec, p2: Vec): Vec {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, (p1[2] + p2[2]) / 2];
}

function sub(p1: Vec, p2: Vec): Vec {
    return [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];
}

function normalize(vec: Vec): Vec {
    const invLen = 1 / Math.sqrt(vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2);
    return [vec[0] * invLen, vec[1] * invLen, vec[2] * invLen];
}

function vert(right: Vec, up: Vec): Vec {
    let forward: Vec = [0, 0, 0];
    vec3.cross(forward, right, up);
    return normalize(forward);
}

function vertInDir(v: Vec, dir: Vec): Vec {
    return getVerticalInDir([0, 0, 0], v, dir) as Vec;
}

function quatLook(forward: Vec, up: Vec): Quat {
    return quatLookRotation([0, 0, 0, 1], forward, up) as Quat;
}

function invQuat(q: Quat): Quat {
    return quat.invert([0, 0, 0, 1], q) as Quat;
}

function invQuatLook(forward: Vec, up: Vec): Quat {
    return invQuat(quatLook(forward, up));
}

export function landmarksToTransforms(landmarks: { point: [number, number, number], visibility: number }[]): {
    [name in BodyPart]: {
        up: [number, number, number],
        forward: [number, number, number],
        visibility: number
    }
} {
    const points: Vec[] = landmarks.map(item => item.point);

    function avgVisibility(...indices: number[]) {
        return indices.reduce((visibility, index) => visibility + landmarks[index].visibility, 0) / indices.length;
    }

    // =============== trunk ===============
    const trunkUp = normalize(
        sub(
            mid(points[11], points[12]),
            mid(points[24], points[23])
        )
    );
    const trunkRight = normalize(sub(
        mid(points[11], points[23]),
        mid(points[12], points[24])
    ));
    const trunkForward = vert(trunkRight, trunkUp);
    const invTrunkQuat = invQuatLook(trunkForward, trunkUp);
    const trunkVisibility = avgVisibility(11, 12, 23, 24);

    // =============== head ===============
    const headUp = sub(
        mid(points[3], points[6]),
        mid(points[9], points[10])
    );
    const headForward = vert(
        sub(points[7], points[8]),
        headUp
    );
    vec3.transformQuat(headUp, headUp, invTrunkQuat);
    vec3.transformQuat(headForward, headForward, invTrunkQuat);
    const headVisibility = avgVisibility(8, 6, 5, 4, 1, 2, 3, 7, 0, 9, 10);

    // =============== upper arms ===============
    const leftUpperArmUp = normalize(sub(points[11], points[13]));
    const leftUpperArmForward = vert(trunkRight, leftUpperArmUp);
    const invLeftUpperArmQuat = invQuatLook(leftUpperArmForward, leftUpperArmUp);
    vec3.transformQuat(leftUpperArmUp, leftUpperArmUp, invTrunkQuat);
    vec3.transformQuat(leftUpperArmForward, leftUpperArmForward, invTrunkQuat);
    const leftUpperArmVisibility = avgVisibility(11, 13);

    const rightUpperArmUp = normalize(sub(points[12], points[14]));
    const rightUpperArmForward = vert(trunkRight, rightUpperArmUp);
    const invRightUpperArmQuat = invQuatLook(rightUpperArmForward, rightUpperArmUp);
    vec3.transformQuat(rightUpperArmUp, rightUpperArmUp, invTrunkQuat);
    vec3.transformQuat(rightUpperArmForward, rightUpperArmForward, invTrunkQuat);
    const rightUpperArmVisibility = avgVisibility(12, 14);

    // =============== lower arms ===============
    const leftLowerArmUp = normalize(sub(points[13], points[15]));
    const leftLowerArmForward = vert(trunkRight, leftLowerArmUp);
    const invLeftLowerArmQuat = invQuatLook(leftLowerArmForward, leftLowerArmUp);
    vec3.transformQuat(leftLowerArmUp, leftLowerArmUp, invLeftUpperArmQuat);
    vec3.transformQuat(leftLowerArmForward, leftLowerArmForward, invLeftUpperArmQuat);
    const leftLowerArmVisibility = avgVisibility(13, 15);

    const rightLowerArmUp = normalize(sub(points[14], points[16]));
    const rightLowerArmForward = vert(trunkRight, rightLowerArmUp);
    const invRightLowerArmQuat = invQuatLook(rightLowerArmForward, rightLowerArmUp);
    vec3.transformQuat(rightLowerArmUp, rightLowerArmUp, invRightUpperArmQuat);
    vec3.transformQuat(rightLowerArmForward, rightLowerArmForward, invRightUpperArmQuat);
    const rightLowerArmVisibility = avgVisibility(14, 16);

    // =============== hands ===============
    const leftHandUp = normalize(sub(
        points[15],
        mid(points[17], points[19])
    ));
    const leftHandForward = vertInDir(leftHandUp, sub(points[21], points[15]));
    vec3.transformQuat(leftHandUp, leftHandUp, invLeftLowerArmQuat);
    vec3.transformQuat(leftHandForward, leftHandForward, invLeftLowerArmQuat);
    const leftHandVisibility = avgVisibility(15, 17, 19, 21);

    const rightHandUp = normalize(sub(
        points[16],
        mid(points[18], points[20])
    ));
    const rightHandForward = vertInDir(rightHandUp, sub(points[22], points[16]));
    vec3.transformQuat(rightHandUp, rightHandUp, invRightLowerArmQuat);
    vec3.transformQuat(rightHandForward, rightHandForward, invRightLowerArmQuat);
    const rightHandVisibility = avgVisibility(16, 18, 20, 22);

    // =============== thighs ===============
    const leftThighUp = normalize(sub(points[23], points[25]));
    const leftThighForward = vert(trunkRight, leftThighUp);
    const invLeftThighQuat = invQuatLook(leftThighForward, leftThighUp);
    vec3.transformQuat(leftThighUp, leftThighUp, invTrunkQuat);
    vec3.transformQuat(leftThighForward, leftThighForward, invTrunkQuat);
    const leftThighVisibility = avgVisibility(23, 25);

    const rightThighUp = normalize(sub(points[24], points[26]));
    const rightThighForward = vert(trunkRight, rightThighUp);
    const invRightThighQuat = invQuatLook(rightThighForward, rightThighUp);
    vec3.transformQuat(rightThighUp, rightThighUp, invTrunkQuat);
    vec3.transformQuat(rightThighForward, rightThighForward, invTrunkQuat);
    const rightThighVisibility = avgVisibility(24, 26);

    // =============== calves ===============
    const leftCalfUp = normalize(sub(points[25], points[27]));
    const leftCalfForward = vert(trunkRight, leftCalfUp);
    const invLeftCalfQuat = invQuatLook(leftCalfForward, leftCalfUp);
    vec3.transformQuat(leftCalfUp, leftCalfUp, invLeftThighQuat);
    vec3.transformQuat(leftCalfForward, leftCalfForward, invLeftThighQuat);
    const leftCalfVisibility = avgVisibility(25, 27);

    const rightCalfUp = normalize(sub(points[26], points[28]));
    const rightCalfForward = vert(trunkRight, rightCalfUp);
    const invRightCalfQuat = invQuatLook(rightCalfForward, rightCalfUp);
    vec3.transformQuat(rightCalfUp, rightCalfUp, invRightThighQuat);
    vec3.transformQuat(rightCalfForward, rightCalfForward, invRightThighQuat);
    const rightCalfVisibility = avgVisibility(26, 28);

    // =============== feet ===============
    const leftFootForward = normalize(sub(points[31], points[29]));
    const leftFootUp = vertInDir(leftFootForward, sub(points[27], points[31]));
    vec3.transformQuat(leftFootForward, leftFootForward, invLeftCalfQuat);
    vec3.transformQuat(leftFootUp, leftFootUp, invLeftCalfQuat);
    const leftFootVisibility = avgVisibility(27, 29, 31);

    const rightFootForward = normalize(sub(points[32], points[30]));
    const rightFootUp = vertInDir(rightFootForward, sub(points[28], points[32]));
    vec3.transformQuat(rightFootForward, rightFootForward, invRightCalfQuat);
    vec3.transformQuat(rightFootUp, rightFootUp, invRightCalfQuat);
    const rightFootVisibility = avgVisibility(28, 30, 32);

    return {
        trunk: {
            up: trunkUp,
            forward: trunkForward,
            visibility: trunkVisibility,
        },
        head: {
            up: headUp,
            forward: headForward,
            visibility: headVisibility,
        },
        leftUpperArm: {
            up: leftUpperArmUp,
            forward: leftUpperArmForward,
            visibility: leftUpperArmVisibility,
        },
        leftLowerArm: {
            up: leftLowerArmUp,
            forward: leftLowerArmForward,
            visibility: leftLowerArmVisibility,
        },
        leftHand: {
            up: leftHandUp,
            forward: leftHandForward,
            visibility: leftHandVisibility,
        },
        leftThigh: {
            up: leftThighUp,
            forward: leftThighForward,
            visibility: leftThighVisibility,
        },
        leftCalf: {
            up: leftCalfUp,
            forward: leftCalfForward,
            visibility: leftCalfVisibility,
        },
        leftFoot: {
            up: leftFootUp,
            forward: leftFootForward,
            visibility: leftFootVisibility,
        },
        rightUpperArm: {
            up: rightUpperArmUp,
            forward: rightUpperArmForward,
            visibility: rightUpperArmVisibility,
        },
        rightLowerArm: {
            up: rightLowerArmUp,
            forward: rightLowerArmForward,
            visibility: rightLowerArmVisibility,
        },
        rightHand: {
            up: rightHandUp,
            forward: rightHandForward,
            visibility: rightHandVisibility,
        },
        rightThigh: {
            up: rightThighUp,
            forward: rightThighForward,
            visibility: rightThighVisibility,
        },
        rightCalf: {
            up: rightCalfUp,
            forward: rightCalfForward,
            visibility: rightCalfVisibility,
        },
        rightFoot: {
            up: rightFootUp,
            forward: rightFootForward,
            visibility: rightFootVisibility,
        },
    };
}