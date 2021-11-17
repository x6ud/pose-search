<template>
    <div class="world-landmarks-canvas"
         ref="container"
    >
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script src="./WorldLandmarksCanvas.ts"></script>

<style lang="scss">
.world-landmarks-canvas {
    box-sizing: border-box;
    border: solid 1px #d9d9d9;
    border-radius: 2px;
    background: #f2f2f2;
    overflow: hidden;
}
</style>