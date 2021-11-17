import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../config';
import {angleBetweenVec3} from '../../utils/math/math';
import Photo from '../../utils/Photo';
import {flipX, getNormal, mid, normalizedLandmarkToViewSpace} from './math';
import {MatchResult, PoseMatcher} from './search';

const MAX_VIEW_SPACE_ANGLE_ERROR = Math.PI / 180 * 45;

export default class MatchChest implements PoseMatcher {

    private targetUp: [number, number, number] = [0, 0, 0];
    private targetRight: [number, number, number] = [0, 0, 0];
    private targetUpMirror: [number, number, number] = [0, 0, 0];
    private targetRightMirror: [number, number, number] = [0, 0, 0];

    prepare(model: SkeletonModel) {
        this.targetUp = getNormal(
            mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition),
            mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition)
        );
        this.targetRight = getNormal(model.rightUpperArm.originViewPosition, model.leftUpperArm.originViewPosition);
        this.targetUpMirror = getNormal(
            flipX(mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition)),
            flipX(mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition))
        );
        this.targetRightMirror = getNormal(flipX(model.leftUpperArm.originViewPosition), flipX(model.rightUpperArm.originViewPosition));
    }

    match(photo: Photo): MatchResult | null {
        const landmarks = photo.normalizedLandmarks;

        const conf = Math.min(
            landmarks[12].visibility,
            landmarks[11].visibility,
            landmarks[24].visibility,
            landmarks[23].visibility
        );
        if (conf < LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            return null;
        }

        const aspect = photo.width / photo.height;

        const leftShoulder = normalizedLandmarkToViewSpace(landmarks[11].point, aspect);
        const rightShoulder = normalizedLandmarkToViewSpace(landmarks[12].point, aspect);
        const leftHip = normalizedLandmarkToViewSpace(landmarks[23].point, aspect);
        const rightHip = normalizedLandmarkToViewSpace(landmarks[24].point, aspect);
        const trunkUp = getNormal(mid(leftHip, rightHip), mid(leftShoulder, rightShoulder));
        const trunkRight = getNormal(rightShoulder, leftShoulder);

        const angleError1 = angleBetweenVec3(this.targetUp, trunkUp);
        const angleError2 = angleBetweenVec3(this.targetRight, trunkRight);
        const score = (Math.PI - angleError1) * (Math.PI - angleError2);

        const angleError1F = angleBetweenVec3(this.targetUpMirror, trunkUp);
        const angleError2F = angleBetweenVec3(this.targetRightMirror, trunkRight);
        const scoreF = (Math.PI - angleError1F) * (Math.PI - angleError2F);

        let bestScore = 0;
        let flip = false;

        if (angleError1 <= MAX_VIEW_SPACE_ANGLE_ERROR && angleError2 <= MAX_VIEW_SPACE_ANGLE_ERROR && score > scoreF) {
            bestScore = score;
        } else if (angleError1F <= MAX_VIEW_SPACE_ANGLE_ERROR && angleError2F <= MAX_VIEW_SPACE_ANGLE_ERROR) {
            bestScore = scoreF;
            flip = true;
        } else {
            return null;
        }

        return {
            score: bestScore,
            center: mid(landmarks[11].point, landmarks[12].point),
            related: [
                landmarks[11].point,
                landmarks[12].point,
                landmarks[13].point,
                landmarks[14].point,
                mid(
                    landmarks[24].point,
                    landmarks[23].point,
                    landmarks[12].point,
                    landmarks[11].point
                )
            ],
            flip
        };
    }

}