import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../config';
import {angleBetweenVec3} from '../../utils/math/math';
import Photo from '../../utils/Photo';
import {avg, flipX, getNormal, getNormalInLocalSpace, mid, normalizedLandmarkToViewSpace} from './math';
import {MatchResult, PoseMatcher} from './search';

const MAX_WORLD_SPACE_ANGLE_ERROR = Math.PI / 180 * 30;
const MAX_VIEW_SPACE_ANGLE_ERROR = Math.PI / 180 * 60;

export default class MatchHip implements PoseMatcher {

    private isLeft: boolean;

    private thighLocalDir: [number, number, number] = [0, 0, 0];
    private thighLocalDirMirror: [number, number, number] = [0, 0, 0];

    private trunkViewUp: [number, number, number] = [0, 0, 0];
    private trunkViewRight: [number, number, number] = [0, 0, 0];
    private trunkViewUpMirror: [number, number, number] = [0, 0, 0];
    private trunkViewRightMirror: [number, number, number] = [0, 0, 0];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel): void {
        this.trunkViewUp = getNormal(
            mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition),
            mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition)
        );
        this.trunkViewUpMirror = getNormal(
            flipX(mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition)),
            flipX(mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition))
        );
        this.trunkViewRight = getNormal(model.rightThigh.originViewPosition, model.leftThigh.originViewPosition);
        this.trunkViewRightMirror = getNormal(flipX(model.leftThigh.originViewPosition), flipX(model.rightThigh.originViewPosition));
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
            avg(world[11].visibility, world[23].visibility, world[24].visibility),
            avg(world[23].visibility, world[25].visibility)
        );
        let errorL = Infinity;
        let viewError1L = Infinity;
        let viewError2L = Infinity;
        if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const dirL = getNormalInLocalSpace(
                world[24].point,
                world[23].point,
                world[23].point,
                world[11].point,
                world[23].point,
                world[25].point,
            );
            errorL = angleBetweenVec3(dirL, this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);
            viewError1L = angleBetweenVec3(trunkUpView, this.isLeft ? this.trunkViewUp : this.trunkViewUpMirror);
            viewError2L = angleBetweenVec3(trunkRightView, this.isLeft ? this.trunkViewRight : this.trunkViewRightMirror);
        }

        const confR = Math.min(
            avg(world[12].visibility, world[24].visibility, world[23].visibility),
            avg(world[24].visibility, world[26].visibility)
        );
        let errorR = Infinity;
        let viewError1R = Infinity;
        let viewError2R = Infinity;
        if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const dirR = getNormalInLocalSpace(
                world[23].point,
                world[24].point,
                world[24].point,
                world[12].point,
                world[24].point,
                world[26].point,
            );
            errorR = angleBetweenVec3(dirR, !this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);
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
                center: normalized[23].point,
                related: [normalized[24].point, normalized[25].point, mid(normalized[23].point, normalized[11].point)],
                flip: !this.isLeft
            };
        } else if (
            errorR <= MAX_WORLD_SPACE_ANGLE_ERROR
            && viewError1R <= MAX_VIEW_SPACE_ANGLE_ERROR
            && viewError2R <= MAX_VIEW_SPACE_ANGLE_ERROR
        ) {
            return {
                score: (Math.PI - errorR) * (Math.PI - viewError1R) * (Math.PI - viewError2R),
                center: normalized[24].point,
                related: [normalized[23].point, normalized[26].point, mid(normalized[24].point, normalized[12].point)],
                flip: this.isLeft
            };
        }

        return null;
    }

}