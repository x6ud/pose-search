import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../config';
import {angleBetweenVec3} from '../../utils/math/math';
import Photo from '../../utils/Photo';
import {avg, flipX, getNormal, getNormalInLocalSpace, mid, normalizedLandmarkToViewSpace} from './math';
import {MatchResult, PoseMatcher} from './search';

const MAX_WORLD_SPACE_ANGLE_ERROR = Math.PI / 180 * 45;
const MAX_VIEW_SPACE_ANGLE_ERROR = Math.PI / 180 * 45;

export default class MatchShoulder implements PoseMatcher {

    private isLeft: boolean;

    private shoulderLocalDir: [number, number, number] = [0, 0, 0];
    private shoulderLocalDirMirror: [number, number, number] = [0, 0, 0];

    private trunkViewUp: [number, number, number] = [0, 0, 0];
    private trunkViewRight: [number, number, number] = [0, 0, 0];
    private trunkViewUpMirror: [number, number, number] = [0, 0, 0];
    private trunkViewRightMirror: [number, number, number] = [0, 0, 0];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel) {
        this.trunkViewUp = getNormal(
            mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition),
            mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition)
        );
        this.trunkViewUpMirror = getNormal(
            flipX(mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition)),
            flipX(mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition))
        );
        this.trunkViewRight = getNormal(model.rightUpperArm.originViewPosition, model.leftUpperArm.originViewPosition);
        this.trunkViewRightMirror = getNormal(flipX(model.leftUpperArm.originViewPosition), flipX(model.rightUpperArm.originViewPosition));
        if (this.isLeft) {
            this.shoulderLocalDir = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
            );
            this.shoulderLocalDirMirror = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
                true,
            );
        } else {
            this.shoulderLocalDir = getNormalInLocalSpace(
                model.leftUpperArm.originWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightUpperArm.controlPointWorldPosition,
            );
            this.shoulderLocalDirMirror = getNormalInLocalSpace(
                model.leftUpperArm.originWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightUpperArm.controlPointWorldPosition,
                true,
            );
        }
    }

    match(photo: Photo): MatchResult | null {
        const world = photo.worldLandmarks;
        const normalized = photo.normalizedLandmarks;
        const aspect = photo.width / photo.height;

        const leftShoulderView = normalizedLandmarkToViewSpace(normalized[11].point, aspect);
        const rightShoulderView = normalizedLandmarkToViewSpace(normalized[12].point, aspect);
        const leftHipView = normalizedLandmarkToViewSpace(normalized[23].point, aspect);
        const rightHipView = normalizedLandmarkToViewSpace(normalized[24].point, aspect);
        const trunkUpView = getNormal(mid(leftHipView, rightHipView), mid(leftShoulderView, rightShoulderView));
        const trunkRightView = getNormal(rightShoulderView, leftShoulderView);

        const confL = Math.min(
            avg(world[12].visibility, world[11].visibility, world[23].visibility),
            avg(world[11].visibility, world[13].visibility)
        );
        let errorL = Infinity;
        let viewError1L = Infinity;
        let viewError2L = Infinity;
        if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const dirL = getNormalInLocalSpace(
                world[12].point,
                world[11].point,
                world[23].point,
                world[11].point,
                world[11].point,
                world[13].point,
            );
            errorL = angleBetweenVec3(dirL, this.isLeft ? this.shoulderLocalDir : this.shoulderLocalDirMirror);
            viewError1L = angleBetweenVec3(trunkUpView, this.isLeft ? this.trunkViewUp : this.trunkViewUpMirror);
            viewError2L = angleBetweenVec3(trunkRightView, this.isLeft ? this.trunkViewRight : this.trunkViewRightMirror);
        }

        const confR = Math.min(
            avg(world[11].visibility, world[12].visibility, world[24].visibility),
            avg(world[12].visibility, world[14].visibility)
        );
        let errorR = Infinity;
        let viewError1R = Infinity;
        let viewError2R = Infinity;
        if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const dirR = getNormalInLocalSpace(
                world[11].point,
                world[12].point,
                world[24].point,
                world[12].point,
                world[12].point,
                world[14].point,
            );
            errorR = angleBetweenVec3(dirR, !this.isLeft ? this.shoulderLocalDir : this.shoulderLocalDirMirror);
            viewError1R = angleBetweenVec3(trunkUpView, this.isLeft ? this.trunkViewUpMirror : this.trunkViewUp);
            viewError2R = angleBetweenVec3(trunkRightView, this.isLeft ? this.trunkViewRightMirror : this.trunkViewRight);
        }

        if (
            errorL < errorR
            && errorL <= MAX_WORLD_SPACE_ANGLE_ERROR
            && viewError1L <= MAX_VIEW_SPACE_ANGLE_ERROR
            && viewError2L <= MAX_VIEW_SPACE_ANGLE_ERROR
        ) {
            return {
                score: (Math.PI - errorL) * (Math.PI - viewError1L) * (Math.PI - viewError2L),
                center: normalized[11].point,
                related: [normalized[12].point, normalized[13].point, mid(normalized[23].point, normalized[11].point)],
                flip: !this.isLeft
            };
        } else if (
            errorR <= MAX_WORLD_SPACE_ANGLE_ERROR
            && viewError1R <= MAX_VIEW_SPACE_ANGLE_ERROR
            && viewError2R <= MAX_VIEW_SPACE_ANGLE_ERROR
        ) {
            return {
                score: (Math.PI - errorR) * (Math.PI - viewError1R) * (Math.PI - viewError2R),
                center: normalized[12].point,
                related: [normalized[11].point, normalized[14].point, mid(normalized[24].point, normalized[12].point)],
                flip: this.isLeft
            };
        }

        return null;
    }

}