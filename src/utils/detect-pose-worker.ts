type DetectPoseResults = {
    normalizedLandmarks: { point: [number, number, number], visibility: number }[];
    worldLandmarks: { point: [number, number, number], visibility: number }[];
};

const worker = new Worker('/worker/detect-pose.worker.js', {type: 'classic'});
const canvas = document.createElement('canvas');
const ctx2d = canvas.getContext('2d')!;

export function detectPoseWorker(image: HTMLImageElement) {
    return new Promise<DetectPoseResults>(async function (resolve, reject) {
        worker.onmessage = function (e) {
            if (e.data) {
                resolve(e.data);
            } else {
                reject('Failed to run model');
            }
        };
        const MAX_SIZE = 1000;
        if (image.width > MAX_SIZE || image.height > MAX_SIZE) {
            const scale = MAX_SIZE / Math.max(image.width, image.height);
            const width = Math.floor(image.width * scale);
            const height = Math.floor(image.height * scale);
            canvas.width = width;
            canvas.height = height;
            ctx2d.clearRect(0, 0, width, height);
            ctx2d.drawImage(image, 0, 0, width, height);
            worker.postMessage(await createImageBitmap(canvas));
        } else {
            worker.postMessage(await createImageBitmap(image));
        }
    });
}
