<template>
    <div class="normalized-landmarks-canvas"
         ref="wrapper"
    >
        <n-spin :show="imageLoading">
            <canvas ref="canvas"></canvas>
        </n-spin>

        <n-switch v-model:value="drawLandmarks"
                  style="position: absolute; right: 4px; top: 4px; z-index: 2;"
        />
    </div>
</template>

<script src="./NormalizedLandmarksCanvas.ts"></script>

<style lang="scss">
.n-spin-container,
.n-spin-content {
    width: 100%;
    height: 100%;
}

.normalized-landmarks-canvas {
    position: relative;
    box-sizing: border-box;
    border: solid 1px #d9d9d9;
    border-radius: 2px;
    background: #f2f2f2;
    overflow: hidden;
}
</style>