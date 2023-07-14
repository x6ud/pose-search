const POSE_CONFIG = {
    locateFile(path, prefix) {
        return '/worker/@mediapipe/pose/' + path;
    }
};
self.createMediapipeSolutionsWasm = POSE_CONFIG;
self.createMediapipeSolutionsPackedAssets = POSE_CONFIG;
importScripts(
    '/worker/@mediapipe/pose/pose.js',
    '/worker/@mediapipe/pose/pose_solution_packed_assets_loader.js',
    '/worker/@mediapipe/pose/pose_solution_simd_wasm_bin.js',
);

(function () {
    let pose;
    let detectPoseResults;
    self.onmessage = async function (e) {
        try {
            if (!pose) {
                pose = new Pose(POSE_CONFIG);
                pose.setOptions({
                    selfieMode: false,
                    modelComplexity: 2,
                    smoothLandmarks: false
                });

                const solution = pose.g;
                const solutionConfig = solution.g;
                solutionConfig.files = () => []; // disable default import files behavior
                await pose.initialize();
                solution.D = solution.h.GL.currentContext.GLctx; // set gl ctx

                // load data files
                const files = solution.F;
                files['pose_landmark_heavy.tflite'] = (await fetch('/worker/@mediapipe/pose/pose_landmark_heavy.tflite')).arrayBuffer();
                files['pose_web.binarypb'] = (await fetch('/worker/@mediapipe/pose/pose_web.binarypb')).arrayBuffer();

                // set callback
                pose.onResults(function onResults(results) {
                    detectPoseResults = {
                        normalizedLandmarks: results?.poseLandmarks?.map(landmark => ({
                            point: [landmark.x, landmark.y, -landmark.z], visibility: landmark.visibility || 0
                        })) || [],
                        worldLandmarks: results?.poseWorldLandmarks?.map(landmark => ({
                            point: [landmark.x, -landmark.y, -landmark.z], visibility: landmark.visibility || 0
                        })) || [],
                    };
                });
            }
            pose.reset();
            const bitmap = e.data;
            await pose.send({image: bitmap});
        } catch (e) {
            detectPoseResults = null;
        }
        postMessage(detectPoseResults);
    };
})();
