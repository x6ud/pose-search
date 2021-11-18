import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../config';
import {angleBetweenVec3} from '../../utils/math/math';
import Photo from '../../utils/Photo';
import {avg, getAngle, getNormal, getNormalInLocalSpace} from './math';
import {MatchResult, PoseMatcher} from './search';

const MAX_WORLD_SPACE_ANGLE_ERROR = Math.PI / 180 * 60;

export default class MatchElbowCameraUnrelated implements PoseMatcher {

    private isLeft: boolean;

    private elbowAngle: number = 0;
    private upperArmLocalDir: [number, number, number] = [0, 0, 0];
    private upperArmLocalDirMirror: [number, number, number] = [0, 0, 0];
    private lowerArmLocalDir: [number, number, number] = [0, 0, 0];
    private lowerArmLocalDirMirror: [number, number, number] = [0, 0, 0];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel): void {
        let shoulder = model.rightUpperArm.originWorldPosition;
        let elbow = model.rightUpperArm.controlPointWorldPosition;
        let wrist = model.rightLowerArm.controlPointWorldPosition;
        if (this.isLeft) {
            shoulder = model.leftUpperArm.originWorldPosition;
            elbow = model.leftUpperArm.controlPointWorldPosition;
            wrist = model.leftLowerArm.controlPointWorldPosition;
        }
        const upperArmNormal = getNormal(shoulder, elbow);
        const lowerArmNormal = getNormal(elbow, wrist);
        this.elbowAngle = angleBetweenVec3(upperArmNormal, lowerArmNormal);

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

            this.lowerArmLocalDir = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftLowerArm.originWorldPosition,
                model.leftLowerArm.controlPointWorldPosition,
            );
            this.lowerArmLocalDirMirror = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftLowerArm.originWorldPosition,
                model.leftLowerArm.controlPointWorldPosition,
                true
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

            this.lowerArmLocalDir = getNormalInLocalSpace(
                model.leftUpperArm.originWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightUpperArm.controlPointWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightLowerArm.originWorldPosition,
                model.rightLowerArm.controlPointWorldPosition,
            );
            this.lowerArmLocalDirMirror = getNormalInLocalSpace(
                model.leftUpperArm.originWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightUpperArm.controlPointWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightLowerArm.originWorldPosition,
                model.rightLowerArm.controlPointWorldPosition,
                true
            );
        }
    }

    match(photo: Photo): MatchResult | null {
        const world = photo.worldLandmarks;
        const normalized = photo.normalizedLandmarks;

        const confL = Math.min(
            avg(world[11].visibility, world[13].visibility),
            avg(world[13].visibility, world[15].visibility)
        );
        let elbowAngleErrorL = Infinity;
        let upperArmLocalAngleErrorL = Infinity;
        let lowerArmLocalAngleErrorL = Infinity;
        if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const shoulder = world[11].point;
            const elbow = world[13].point;
            const wrist = world[15].point;
            const elbowAngle = getAngle(shoulder, elbow, elbow, wrist);
            elbowAngleErrorL = Math.abs(this.elbowAngle - elbowAngle);

            const upperArmLocalDir = getNormalInLocalSpace(
                world[12].point,
                world[11].point,
                world[23].point,
                world[11].point,
                world[11].point,
                world[13].point,
            );
            upperArmLocalAngleErrorL = angleBetweenVec3(upperArmLocalDir, this.isLeft ? this.upperArmLocalDir : this.upperArmLocalDirMirror);

            const lowerArmLocalDir = getNormalInLocalSpace(
                world[12].point,
                world[11].point,
                world[13].point,
                world[11].point,
                world[13].point,
                world[15].point,
            );
            lowerArmLocalAngleErrorL = angleBetweenVec3(lowerArmLocalDir, this.isLeft ? this.lowerArmLocalDir : this.lowerArmLocalDirMirror);
        }
        const scoreL = (Math.PI - elbowAngleErrorL) * (Math.PI - upperArmLocalAngleErrorL) * (Math.PI - lowerArmLocalAngleErrorL);

        const confR = Math.min(
            avg(world[12].visibility, world[14].visibility),
            avg(world[14].visibility, world[16].visibility)
        );
        let elbowAngleErrorR = Infinity;
        let upperArmLocalAngleErrorR = Infinity;
        let lowerArmLocalAngleErrorR = Infinity;
        if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            const shoulder = world[12].point;
            const elbow = world[14].point;
            const wrist = world[16].point;
            const elbowAngle = getAngle(shoulder, elbow, elbow, wrist);
            elbowAngleErrorR = Math.abs(this.elbowAngle - elbowAngle);

            const upperArmLocalDir = getNormalInLocalSpace(
                world[11].point,
                world[12].point,
                world[24].point,
                world[12].point,
                world[12].point,
                world[14].point,
            );
            upperArmLocalAngleErrorR = angleBetweenVec3(upperArmLocalDir, !this.isLeft ? this.upperArmLocalDir : this.upperArmLocalDirMirror);

            const lowerArmLocalDir = getNormalInLocalSpace(
                world[11].point,
                world[12].point,
                world[14].point,
                world[12].point,
                world[14].point,
                world[16].point,
            );
            lowerArmLocalAngleErrorR = angleBetweenVec3(lowerArmLocalDir, !this.isLeft ? this.lowerArmLocalDir : this.lowerArmLocalDirMirror);
        }
        const scoreR = (Math.PI - elbowAngleErrorR) * (Math.PI - upperArmLocalAngleErrorR) * (Math.PI - lowerArmLocalAngleErrorR);

        if (scoreL >= scoreR
            && elbowAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
            && upperArmLocalAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
            && lowerArmLocalAngleErrorL <= MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            return {
                score: scoreL,
                center: normalized[13].point,
                related: [normalized[11].point, normalized[15].point],
                flip: !this.isLeft
            };
        } else if (
            elbowAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
            && upperArmLocalAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
            && lowerArmLocalAngleErrorR <= MAX_WORLD_SPACE_ANGLE_ERROR
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