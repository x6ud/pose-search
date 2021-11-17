import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../config';
import {angleBetweenVec3} from '../../utils/math/math';
import Photo from '../../utils/Photo';
import {avg, getAngle, getNormal, getNormalInLocalSpace} from './math';
import {MatchResult, PoseMatcher} from './search';

const MAX_WORLD_SPACE_ANGLE_ERROR = Math.PI / 180 * 45;

export default class MatchKneeCameraUnrelated implements PoseMatcher {

    private isLeft: boolean;

    private kneeAngle: number = 0;
    private thighLocalDir: [number, number, number] = [0, 0, 0];
    private thighLocalDirMirror: [number, number, number] = [0, 0, 0];
    private calfLocalDir: [number, number, number] = [0, 0, 0];
    private calfLocalDirMirror: [number, number, number] = [0, 0, 0];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel): void {
        let hip = model.rightThigh.originWorldPosition;
        let knee = model.rightThigh.controlPointWorldPosition;
        let ankle = model.rightCalf.controlPointWorldPosition;
        if (this.isLeft) {
            hip = model.leftThigh.originWorldPosition;
            knee = model.leftThigh.controlPointWorldPosition;
            ankle = model.leftCalf.controlPointWorldPosition;
        }
        const thighNormal = getNormal(hip, knee);
        const calfNormal = getNormal(knee, ankle);
        this.kneeAngle = angleBetweenVec3(thighNormal, calfNormal);

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

            this.calfLocalDir = getNormalInLocalSpace(
                model.rightThigh.originWorldPosition,
                model.leftThigh.originWorldPosition,
                model.leftThigh.controlPointWorldPosition,
                model.leftThigh.originWorldPosition,
                model.leftCalf.originWorldPosition,
                model.leftCalf.controlPointWorldPosition,
            );
            this.calfLocalDirMirror = getNormalInLocalSpace(
                model.rightThigh.originWorldPosition,
                model.leftThigh.originWorldPosition,
                model.leftThigh.controlPointWorldPosition,
                model.leftThigh.originWorldPosition,
                model.leftCalf.originWorldPosition,
                model.leftCalf.controlPointWorldPosition,
                true
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

            this.calfLocalDir = getNormalInLocalSpace(
                model.leftThigh.originWorldPosition,
                model.rightThigh.originWorldPosition,
                model.rightThigh.controlPointWorldPosition,
                model.rightThigh.originWorldPosition,
                model.rightCalf.originWorldPosition,
                model.rightCalf.controlPointWorldPosition,
            );
            this.calfLocalDirMirror = getNormalInLocalSpace(
                model.leftThigh.originWorldPosition,
                model.rightThigh.originWorldPosition,
                model.rightThigh.controlPointWorldPosition,
                model.rightThigh.originWorldPosition,
                model.rightCalf.originWorldPosition,
                model.rightCalf.controlPointWorldPosition,
                true
            );
        }
    }

    match(photo: Photo): MatchResult | null {
        const world = photo.worldLandmarks;
        const normalized = photo.normalizedLandmarks;

        const confL = Math.min(
            avg(world[23].visibility, world[25].visibility),
            avg(world[25].visibility, world[27].visibility)
        );
        let kneeAngleErrorL = Infinity;
        let thighLocalAngleErrorL = Infinity;
        let calfLocalAngleErrorL = Infinity;
        if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const hip = world[23].point;
            const knee = world[25].point;
            const ankle = world[27].point;
            const kneeAngle = getAngle(hip, knee, knee, ankle);
            kneeAngleErrorL = Math.abs(this.kneeAngle - kneeAngle);

            const thighLocalDir = getNormalInLocalSpace(
                world[24].point,
                world[23].point,
                world[23].point,
                world[11].point,
                world[23].point,
                world[25].point,
            );
            thighLocalAngleErrorL = angleBetweenVec3(thighLocalDir, this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);

            const calfLocalDir = getNormalInLocalSpace(
                world[24].point,
                world[23].point,
                world[25].point,
                world[23].point,
                world[25].point,
                world[27].point,
            );
            calfLocalAngleErrorL = angleBetweenVec3(calfLocalDir, this.isLeft ? this.calfLocalDir : this.calfLocalDirMirror);
        }
        const scoreL = (Math.PI - kneeAngleErrorL) * (Math.PI - thighLocalAngleErrorL) * (Math.PI - calfLocalAngleErrorL);

        const confR = Math.min(
            avg(world[24].visibility, world[26].visibility),
            avg(world[26].visibility, world[28].visibility)
        );
        let kneeAngleErrorR = Infinity;
        let thighLocalAngleErrorR = Infinity;
        let calfLocalAngleErrorR = Infinity;
        if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const hip = world[24].point;
            const knee = world[26].point;
            const ankle = world[28].point;
            const kneeAngle = getAngle(hip, knee, knee, ankle);
            kneeAngleErrorR = Math.abs(this.kneeAngle - kneeAngle);

            const thighLocalDir = getNormalInLocalSpace(
                world[23].point,
                world[24].point,
                world[24].point,
                world[12].point,
                world[24].point,
                world[26].point,
            );
            thighLocalAngleErrorR = angleBetweenVec3(thighLocalDir, !this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);

            const calfLocalDir = getNormalInLocalSpace(
                world[23].point,
                world[24].point,
                world[26].point,
                world[24].point,
                world[26].point,
                world[28].point,
            );
            calfLocalAngleErrorR = angleBetweenVec3(calfLocalDir, !this.isLeft ? this.calfLocalDir : this.calfLocalDirMirror);
        }
        const scoreR = (Math.PI - kneeAngleErrorR) * (Math.PI - thighLocalAngleErrorR) * (Math.PI - calfLocalAngleErrorR);

        if (scoreL >= scoreR
            && kneeAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
            && thighLocalAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
            && calfLocalAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            return {
                score: scoreL,
                center: normalized[25].point,
                related: [normalized[23].point, normalized[27].point],
                flip: !this.isLeft
            };
        } else if (
            kneeAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
            && thighLocalAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
            && calfLocalAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
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