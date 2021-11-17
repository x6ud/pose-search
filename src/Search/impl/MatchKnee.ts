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

export default class MatchKnee implements PoseMatcher {

    private isLeft: boolean;

    private thighZAxisAngle: number = 0;
    private calfZAxisAngle: number = 0;
    private kneeAngle: number = 0;
    private kneeViewAngle: number = 0;

    private thighLocalDir: [number, number, number] = [0, 0, 0];
    private thighLocalDirMirror: [number, number, number] = [0, 0, 0];
    private trunkForward: [number, number, number] = [0, 0, 0];
    private trunkForwardMirror: [number, number, number] = [0, 0, 0];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel): void {
        let hip = model.rightThigh.originViewPosition;
        let knee = model.rightThigh.controlPointViewPosition;
        let ankle = model.rightCalf.controlPointViewPosition;
        if (this.isLeft) {
            hip = model.leftThigh.originViewPosition;
            knee = model.leftThigh.controlPointViewPosition;
            ankle = model.leftCalf.controlPointViewPosition;
        }
        const thighNormal = getNormal(hip, knee);
        const calfNormal = getNormal(knee, ankle);
        this.thighZAxisAngle = angleBetweenVec3(Z_AXIS, thighNormal);
        this.calfZAxisAngle = angleBetweenVec3(Z_AXIS, calfNormal);
        this.kneeAngle = angleBetweenVec3(thighNormal, calfNormal);
        this.kneeViewAngle = simplifyAngle(getAngle2D(knee, hip, knee, ankle)) - Math.PI;

        if (this.isLeft) {
            this.thighLocalDir = getNormalInLocalSpace(
                model.rightThigh.originWorldPosition,
                model.leftThigh.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftThigh.originWorldPosition,
                model.leftThigh.controlPointWorldPosition,
            );
            this.thighLocalDirMirror = getNormalInLocalSpace(
                model.rightThigh.originWorldPosition,
                model.leftThigh.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftThigh.originWorldPosition,
                model.leftThigh.controlPointWorldPosition,
                true,
            );
        } else {
            this.thighLocalDir = getNormalInLocalSpace(
                model.leftThigh.originWorldPosition,
                model.rightThigh.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightThigh.originWorldPosition,
                model.rightThigh.controlPointWorldPosition,
            );
            this.thighLocalDirMirror = getNormalInLocalSpace(
                model.leftThigh.originWorldPosition,
                model.rightThigh.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightThigh.originWorldPosition,
                model.rightThigh.controlPointWorldPosition,
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
        const trunkViewRight = getNormal(model.rightThigh.originViewPosition, model.leftThigh.originViewPosition);
        const trunkViewRightMirror = getNormal(flipX(model.leftThigh.originViewPosition), flipX(model.rightThigh.originViewPosition));
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
            avg(normalized[23].visibility, normalized[25].visibility),
            avg(normalized[25].visibility, normalized[27].visibility)
        );
        let thighZAngleErrorL = Infinity;
        let calfZAngleErrorL = Infinity;
        let kneeAngleErrorL = Infinity;
        let kneeViewAngleErrorL = Infinity;
        let thighLocalAngleErrorL = Infinity;
        let forwardErrorL = Infinity;
        if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const hipView = leftHipView;
            const kneeView = normalizedLandmarkToViewSpace(normalized[25].point, aspect);
            const ankleView = normalizedLandmarkToViewSpace(normalized[27].point, aspect);
            const thighViewNormal = getNormal(hipView, kneeView);
            const calfViewNormal = getNormal(kneeView, ankleView);
            const thighZAxisAngle = angleBetweenVec3(Z_AXIS, thighViewNormal);
            const calfZAxisAngle = angleBetweenVec3(Z_AXIS, calfViewNormal);
            thighZAngleErrorL = Math.abs(this.thighZAxisAngle - thighZAxisAngle);
            calfZAngleErrorL = Math.abs(this.calfZAxisAngle - calfZAxisAngle);

            const hip = world[23].point;
            const knee = world[25].point;
            const ankle = world[27].point;
            const kneeAngle = getAngle(hip, knee, knee, ankle);
            kneeAngleErrorL = Math.abs(this.kneeAngle - kneeAngle);

            const kneeViewAngle = simplifyAngle(getAngle2D(kneeView, hipView, kneeView, ankleView)) - Math.PI;
            kneeViewAngleErrorL = Math.abs(this.kneeViewAngle - kneeViewAngle * (this.isLeft ? 1 : -1));

            const thighLocalDir = getNormalInLocalSpace(
                world[24].point,
                world[23].point,
                world[23].point,
                world[11].point,
                world[23].point,
                world[25].point,
            );
            thighLocalAngleErrorL = angleBetweenVec3(thighLocalDir, this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);

            forwardErrorL = angleBetweenVec3(trunkForwardView, this.isLeft ? this.trunkForward : this.trunkForwardMirror);
        }
        const scoreL = (Math.PI - thighZAngleErrorL)
            * (Math.PI - calfZAngleErrorL)
            * (Math.PI - kneeAngleErrorL)
            * (Math.PI * 2 - kneeViewAngleErrorL)
            * (Math.PI - thighLocalAngleErrorL)
            * (Math.PI - forwardErrorL)
        ;


        const confR = Math.min(
            avg(normalized[24].visibility, normalized[26].visibility),
            avg(normalized[26].visibility, normalized[28].visibility)
        );
        let thighZAngleErrorR = Infinity;
        let calfZAngleErrorR = Infinity;
        let kneeAngleErrorR = Infinity;
        let kneeViewAngleErrorR = Infinity;
        let thighLocalAngleErrorR = Infinity;
        let forwardErrorR = Infinity;
        if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const hipView = rightHipView;
            const kneeView = normalizedLandmarkToViewSpace(normalized[26].point, aspect);
            const ankleView = normalizedLandmarkToViewSpace(normalized[28].point, aspect);
            const thighViewNormal = getNormal(hipView, kneeView);
            const calfViewNormal = getNormal(kneeView, ankleView);
            const thighZAxisAngle = angleBetweenVec3(Z_AXIS, thighViewNormal);
            const calfZAxisAngle = angleBetweenVec3(Z_AXIS, calfViewNormal);
            thighZAngleErrorR = Math.abs(this.thighZAxisAngle - thighZAxisAngle);
            calfZAngleErrorR = Math.abs(this.calfZAxisAngle - calfZAxisAngle);

            const hip = world[24].point;
            const knee = world[26].point;
            const ankle = world[28].point;
            const kneeAngle = getAngle(hip, knee, knee, ankle);
            kneeAngleErrorR = Math.abs(this.kneeAngle - kneeAngle);

            const kneeViewAngle = simplifyAngle(getAngle2D(kneeView, hipView, kneeView, ankleView)) - Math.PI;
            kneeViewAngleErrorR = Math.abs(this.kneeViewAngle - kneeViewAngle * (this.isLeft ? -1 : 1));

            const thighLocalDir = getNormalInLocalSpace(
                world[23].point,
                world[24].point,
                world[24].point,
                world[12].point,
                world[24].point,
                world[26].point,
            );
            thighLocalAngleErrorR = angleBetweenVec3(thighLocalDir, !this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);

            forwardErrorR = angleBetweenVec3(trunkForwardView, !this.isLeft ? this.trunkForward : this.trunkForwardMirror);
        }
        const scoreR = (Math.PI - thighZAngleErrorR)
            * (Math.PI - calfZAngleErrorR)
            * (Math.PI - kneeAngleErrorR)
            * (Math.PI * 2 - kneeViewAngleErrorR)
            * (Math.PI - thighLocalAngleErrorR)
            * (Math.PI - forwardErrorR)
        ;

        if (scoreL >= scoreR
            && thighZAngleErrorL <= MAX_VIEW_ANGLE_ERROR
            && calfZAngleErrorL <= MAX_VIEW_ANGLE_ERROR
            && kneeAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
            && kneeViewAngleErrorL <= MAX_VIEW_ANGLE_ERROR
            && thighLocalAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            return {
                score: scoreL,
                center: normalized[25].point,
                related: [normalized[23].point, normalized[27].point],
                flip: !this.isLeft
            };
        } else if (
            thighZAngleErrorR <= MAX_VIEW_ANGLE_ERROR
            && calfZAngleErrorR <= MAX_VIEW_ANGLE_ERROR
            && kneeAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
            && kneeViewAngleErrorR <= MAX_VIEW_ANGLE_ERROR
            && thighLocalAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            return {
                score: scoreR,
                center: normalized[26].point,
                related: [normalized[24].point, normalized[28].point],
                flip: this.isLeft
            };
        }

        return null;
    }

}