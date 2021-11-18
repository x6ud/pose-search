import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../config';
import {angleBetweenVec3} from '../../utils/math/math';
import Photo from '../../utils/Photo';
import {flipX, getNormal, isWithinBoundary2D, mid, normalizedLandmarkToViewSpace} from './math';
import {MatchResult, PoseMatcher} from './search';

const MAX_VIEW_SPACE_ANGLE_ERROR = Math.PI / 180 * 45;

export default class MatchFace implements PoseMatcher {

    private targetForward: [number, number, number] = [0, 0, 0];
    private targetRight: [number, number, number] = [0, 0, 0];
    private targetForwardMirror: [number, number, number] = [0, 0, 0];
    private targetRightMirror: [number, number, number] = [0, 0, 0];

    prepare(model: SkeletonModel): void {
        const leftEar = model.head.landmarksViewPosition[0];
        const rightEar = model.head.landmarksViewPosition[1];
        this.targetRight = getNormal(rightEar, leftEar);
        this.targetForward = getNormal(model.head.originViewPosition, model.head.controlPointViewPosition);
        this.targetRightMirror = getNormal(flipX(leftEar), flipX(rightEar));
        this.targetForwardMirror = getNormal(flipX(model.head.originViewPosition), flipX(model.head.controlPointViewPosition));
    }

    match(photo: Photo): MatchResult | null {
        const landmarks = photo.normalizedLandmarks;
        if (!isWithinBoundary2D(landmarks[8].point) || !isWithinBoundary2D(landmarks[7].point)) {
            return null;
        }
        const conf = Math.min(
            landmarks[8].visibility,
            landmarks[7].visibility,
            landmarks[10].visibility,
            landmarks[9].visibility
        );
        if (conf < LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
            return null;
        }
        const aspect = photo.width / photo.height;

        const leftEar = normalizedLandmarkToViewSpace(landmarks[7].point, aspect);
        const rightEar = normalizedLandmarkToViewSpace(landmarks[8].point, aspect);
        const nose = normalizedLandmarkToViewSpace(landmarks[0].point, aspect);
        const right = getNormal(rightEar, leftEar);
        const forward = getNormal(mid(leftEar, rightEar), nose);

        const angleError1 = angleBetweenVec3(this.targetRight, right);
        const angleError2 = angleBetweenVec3(this.targetForward, forward);
        const score = (Math.PI - angleError1) * (Math.PI - angleError2);

        const angleError1F = angleBetweenVec3(this.targetRightMirror, right);
        const angleError2F = angleBetweenVec3(this.targetForwardMirror, forward);
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

        const xl = Math.min(landmarks[8].point[0], landmarks[7].point[0]);
        const xh = Math.max(landmarks[8].point[0], landmarks[7].point[0]);
        const xRange = xh - xl;
        const xPadding = xRange * 0.5;
        const yl = Math.min(landmarks[6].point[1], landmarks[3].point[1], landmarks[10].point[1], landmarks[9].point[1]);
        const yh = Math.min(landmarks[6].point[1], landmarks[3].point[1], landmarks[10].point[1], landmarks[9].point[1]);
        const yRange = yh - yl;
        const yPadding = yRange * 0.5;

        return {
            score: bestScore,
            center: mid(landmarks[0].point),
            related: [
                landmarks[8].point,
                landmarks[7].point,
                landmarks[10].point,
                landmarks[9].point,
                [xl - xPadding, landmarks[0].point[1], landmarks[0].point[2]],
                [xh + xPadding, landmarks[0].point[1], landmarks[0].point[2]],
                [landmarks[0].point[0], yl - yPadding, landmarks[0].point[2]],
                [landmarks[0].point[0], yh + yPadding, landmarks[0].point[2]],
            ],
            flip
        };
    }

}