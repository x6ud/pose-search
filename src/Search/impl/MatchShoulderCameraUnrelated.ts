import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../config';
import {angleBetweenVec3} from '../../utils/math/math';
import Photo from '../../utils/Photo';
import {avg, getNormal, getNormalInLocalSpace, mid, normalizedLandmarkToViewSpace} from './math';
import {MatchResult, PoseMatcher} from './search';

const MAX_WORLD_SPACE_ANGLE_ERROR = Math.PI / 180 * 30;

export default class MatchShoulderCameraUnrelated implements PoseMatcher {

    private isLeft: boolean;

    private shoulderLocalDir: [number, number, number] = [0, 0, 0];
    private shoulderLocalDirMirror: [number, number, number] = [0, 0, 0];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel) {
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
        }

        const confR = Math.min(
            avg(world[11].visibility, world[12].visibility, world[24].visibility),
            avg(world[12].visibility, world[14].visibility)
        );
        let errorR = Infinity;
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
        }

        if (
            errorL < errorR
            && errorL <= MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            return {
                score: Math.PI - errorL,
                center: normalized[11].point,
                related: [normalized[12].point, normalized[13].point, mid(normalized[23].point, normalized[11].point)],
                flip: !this.isLeft
            };
        } else if (
            errorR <= MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            return {
                score: Math.PI - errorR,
                center: normalized[12].point,
                related: [normalized[11].point, normalized[14].point, mid(normalized[24].point, normalized[12].point)],
                flip: this.isLeft
            };
        }

        return null;
    }

}