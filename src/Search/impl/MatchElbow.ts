import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../config';
import {angleBetweenVec3} from '../../utils/math/math';
import Photo from '../../utils/Photo';
import {
    avg,
    cross,
    flipX,
    getAngle,
    getAngle2D,
    getNormal,
    getNormalInLocalSpace,
    mid,
    normalizedLandmarkToViewSpace,
    simplifyAngle
} from './math';
import {MatchResult, PoseMatcher} from './search';

const MAX_VIEW_ANGLE_ERROR = Math.PI / 180 * 45;
const MAX_WORLD_SPACE_ANGLE_ERROR = Math.PI / 180 * 45;

const Z_AXIS: [number, number, number] = [0, 0, 1];

export default class MatchElbow implements PoseMatcher {

    private isLeft: boolean;

    private upperArmZAxisAngle: number = 0;
    private lowerArmZAxisAngle: number = 0;
    private elbowAngle: number = 0;
    private elbowViewAngle: number = 0;

    private upperArmLocalDir: [number, number, number] = [0, 0, 0];
    private upperArmLocalDirMirror: [number, number, number] = [0, 0, 0];
    private trunkForward: [number, number, number] = [0, 0, 0];
    private trunkForwardMirror: [number, number, number] = [0, 0, 0];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel): void {
        let shoulder = model.rightUpperArm.originViewPosition;
        let elbow = model.rightUpperArm.controlPointViewPosition;
        let wrist = model.rightLowerArm.controlPointViewPosition;
        if (this.isLeft) {
            shoulder = model.leftUpperArm.originViewPosition;
            elbow = model.leftUpperArm.controlPointViewPosition;
            wrist = model.leftLowerArm.controlPointViewPosition;
        }
        const upperArmNormal = getNormal(shoulder, elbow);
        const lowerArmNormal = getNormal(elbow, wrist);
        this.upperArmZAxisAngle = angleBetweenVec3(Z_AXIS, upperArmNormal);
        this.lowerArmZAxisAngle = angleBetweenVec3(Z_AXIS, lowerArmNormal);
        this.elbowAngle = angleBetweenVec3(upperArmNormal, lowerArmNormal);
        this.elbowViewAngle = simplifyAngle(getAngle2D(elbow, shoulder, elbow, wrist)) - Math.PI;

        if (this.isLeft) {
            this.upperArmLocalDir = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
            );
            this.upperArmLocalDirMirror = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
                true,
            );
        } else {
            this.upperArmLocalDir = getNormalInLocalSpace(
                model.leftUpperArm.originWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightUpperArm.controlPointWorldPosition,
            );
            this.upperArmLocalDirMirror = getNormalInLocalSpace(
                model.leftUpperArm.originWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightUpperArm.controlPointWorldPosition,
                true,
            );
        }

        const trunkViewUp = getNormal(
            mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition),
            mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition)
        );
        const trunkViewUpMirror = getNormal(
            flipX(mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition)),
            flipX(mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition))
        );
        const trunkViewRight = getNormal(model.rightUpperArm.originViewPosition, model.leftUpperArm.originViewPosition);
        const trunkViewRightMirror = getNormal(flipX(model.leftUpperArm.originViewPosition), flipX(model.rightUpperArm.originViewPosition));
        this.trunkForward = cross(trunkViewRight, trunkViewUp);
        this.trunkForwardMirror = cross(trunkViewRightMirror, trunkViewUpMirror);
    }

    match(photo: Photo): MatchResult | null {
        const aspect = photo.width / photo.height;
        const normalized = photo.normalizedLandmarks;
        const world = photo.worldLandmarks;

        const leftShoulderView = normalizedLandmarkToViewSpace(normalized[11].point, aspect);
        const rightShoulderView = normalizedLandmarkToViewSpace(normalized[12].point, aspect);
        const leftHipView = normalizedLandmarkToViewSpace(normalized[23].point, aspect);
        const rightHipView = normalizedLandmarkToViewSpace(normalized[24].point, aspect);
        const trunkUpView = getNormal(mid(leftHipView, rightHipView), mid(leftShoulderView, rightShoulderView));
        const trunkRightView = getNormal(rightShoulderView, leftShoulderView);
        const trunkForwardView = cross(trunkRightView, trunkUpView);

        const confL = Math.min(
            avg(normalized[11].visibility, normalized[13].visibility),
            avg(normalized[13].visibility, normalized[15].visibility)
        );
        let upperArmZAngleErrorL = Infinity;
        let lowerArmZAngleErrorL = Infinity;
        let elbowAngleErrorL = Infinity;
        let elbowViewAngleErrorL = Infinity;
        let upperArmLocalAngleErrorL = Infinity;
        let forwardErrorL = Infinity;
        if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const shoulderView = leftShoulderView;
            const elbowView = normalizedLandmarkToViewSpace(normalized[13].point, aspect);
            const wristView = normalizedLandmarkToViewSpace(normalized[15].point, aspect);
            const upperArmViewNormal = getNormal(shoulderView, elbowView);
            const lowerArmViewNormal = getNormal(elbowView, wristView);
            const upperArmZAxisAngle = angleBetweenVec3(Z_AXIS, upperArmViewNormal);
            const lowerArmZAxisAngle = angleBetweenVec3(Z_AXIS, lowerArmViewNormal);
            upperArmZAngleErrorL = Math.abs(this.upperArmZAxisAngle - upperArmZAxisAngle);
            lowerArmZAngleErrorL = Math.abs(this.lowerArmZAxisAngle - lowerArmZAxisAngle);

            const shoulder = world[11].point;
            const elbow = world[13].point;
            const wrist = world[15].point;
            const elbowAngle = getAngle(shoulder, elbow, elbow, wrist);
            elbowAngleErrorL = Math.abs(this.elbowAngle - elbowAngle);

            const elbowViewAngle = simplifyAngle(getAngle2D(elbowView, shoulderView, elbowView, wristView)) - Math.PI;
            elbowViewAngleErrorL = Math.abs(this.elbowViewAngle - elbowViewAngle * (this.isLeft ? 1 : -1));

            const upperArmLocalDir = getNormalInLocalSpace(
                world[12].point,
                world[11].point,
                world[23].point,
                world[11].point,
                world[11].point,
                world[13].point,
            );
            upperArmLocalAngleErrorL = angleBetweenVec3(upperArmLocalDir, this.isLeft ? this.upperArmLocalDir : this.upperArmLocalDirMirror);

            forwardErrorL = angleBetweenVec3(trunkForwardView, this.isLeft ? this.trunkForward : this.trunkForwardMirror);
        }
        const scoreL = (Math.PI - upperArmZAngleErrorL)
            * (Math.PI - lowerArmZAngleErrorL)
            * (Math.PI - elbowAngleErrorL)
            * (Math.PI * 2 - elbowViewAngleErrorL)
            * (Math.PI - upperArmLocalAngleErrorL)
            * (Math.PI - forwardErrorL)
        ;

        const confR = Math.min(
            avg(normalized[12].visibility, normalized[14].visibility),
            avg(normalized[14].visibility, normalized[16].visibility)
        );
        let upperArmZAngleErrorR = Infinity;
        let lowerArmZAngleErrorR = Infinity;
        let elbowAngleErrorR = Infinity;
        let elbowViewAngleErrorR = Infinity;
        let upperArmLocalAngleErrorR = Infinity;
        let forwardErrorR = Infinity;
        if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const shoulderView = rightShoulderView;
            const elbowView = normalizedLandmarkToViewSpace(normalized[14].point, aspect);
            const wristView = normalizedLandmarkToViewSpace(normalized[16].point, aspect);
            const upperArmViewNormal = getNormal(shoulderView, elbowView);
            const lowerArmViewNormal = getNormal(elbowView, wristView);
            const upperArmZAxisAngle = angleBetweenVec3(Z_AXIS, upperArmViewNormal);
            const lowerArmZAxisAngle = angleBetweenVec3(Z_AXIS, lowerArmViewNormal);
            upperArmZAngleErrorR = Math.abs(this.upperArmZAxisAngle - upperArmZAxisAngle);
            lowerArmZAngleErrorR = Math.abs(this.lowerArmZAxisAngle - lowerArmZAxisAngle);

            const shoulder = world[12].point;
            const elbow = world[14].point;
            const wrist = world[16].point;
            const elbowAngle = getAngle(shoulder, elbow, elbow, wrist);
            elbowAngleErrorR = Math.abs(this.elbowAngle - elbowAngle);

            const elbowViewAngle = simplifyAngle(getAngle2D(elbowView, shoulderView, elbowView, wristView)) - Math.PI;
            elbowViewAngleErrorR = Math.abs(this.elbowViewAngle - elbowViewAngle * (this.isLeft ? -1 : 1));

            const upperArmLocalDir = getNormalInLocalSpace(
                world[11].point,
                world[12].point,
                world[24].point,
                world[12].point,
                world[12].point,
                world[14].point,
            );
            upperArmLocalAngleErrorR = angleBetweenVec3(upperArmLocalDir, !this.isLeft ? this.upperArmLocalDir : this.upperArmLocalDirMirror);

            forwardErrorR = angleBetweenVec3(trunkForwardView, this.isLeft ? this.trunkForwardMirror : this.trunkForward);
        }
        const scoreR = (Math.PI - upperArmZAngleErrorR)
            * (Math.PI - lowerArmZAngleErrorR)
            * (Math.PI - elbowAngleErrorR)
            * (Math.PI * 2 - elbowViewAngleErrorR)
            * (Math.PI - upperArmLocalAngleErrorR)
            * (Math.PI - forwardErrorR)
        ;

        if (scoreL >= scoreR
            && upperArmZAngleErrorL <= MAX_VIEW_ANGLE_ERROR
            && lowerArmZAngleErrorL <= MAX_VIEW_ANGLE_ERROR
            && elbowAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
            && elbowViewAngleErrorL <= MAX_VIEW_ANGLE_ERROR
            && upperArmLocalAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            return {
                score: scoreL,
                center: normalized[13].point,
                related: [normalized[11].point, normalized[15].point],
                flip: !this.isLeft
            };
        } else if (
            upperArmZAngleErrorR <= MAX_VIEW_ANGLE_ERROR
            && lowerArmZAngleErrorR <= MAX_VIEW_ANGLE_ERROR
            && elbowAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
            && elbowViewAngleErrorR <= MAX_VIEW_ANGLE_ERROR
            && upperArmLocalAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            return {
                score: scoreR,
                center: normalized[14].point,
                related: [normalized[12].point, normalized[16].point],
                flip: this.isLeft
            };
        }

        return null;
    }

}