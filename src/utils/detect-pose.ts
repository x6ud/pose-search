import {Pose, Results} from '@mediapipe/pose';

type DetectPoseResults = {
    normalizedLandmarks: { point: [number, number, number], visibility: number }[];
    worldLandmarks: { point: [number, number, number], visibility: number }[];
};

let instancePromise: Promise<Pose>;
let onResultsCallback: (results: DetectPoseResults) => void;

function onResults(results: Results) {
    if (onResultsCallback) {
        onResultsCallback({
            normalizedLandmarks: results?.poseLandmarks?.map(landmark => ({
                point: [landmark.x, landmark.y, -landmark.z], visibility: landmark.visibility || 0
            })) || [],
            worldLandmarks: results?.poseWorldLandmarks?.map(landmark => ({
                point: [landmark.x, -landmark.y, -landmark.z], visibility: landmark.visibility || 0
            })) || [],
        });
    }
}

function getInstance(): Promise<Pose> {
    return instancePromise = instancePromise || new Promise(async function (resolve) {
        const pose = new Pose({
            locateFile(path, prefix) {
                return './node_modules/@mediapipe/pose/' + path;
            }
        });
        pose.setOptions({
            selfieMode: false,
            modelComplexity: 2,
            smoothLandmarks: false
        });
        await pose.initialize();
        pose.onResults(onResults);
        resolve(pose);
    });
}

export const NUM_OF_LANDMARKS = 33;

export function detectPose(image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<DetectPoseResults> {
    return new Promise(async function (resolve) {
        const pose = await getInstance();
        pose.reset();
        onResultsCallback = resolve;
        await pose.send({image});
    });
}