<template>
    <div class="skeleton" ref="container">
        <n-spin :show="loading">
            <canvas ref="canvas"></canvas>
        </n-spin>

        <div class="anchor" style="top: 4px; left: 4px;">
            <a href="https://sketchfab.com/3d-models/skeleton-4de7b96a351a4a35b1b6e5415277ff07"
               target="_blank"
               title="Author of the original model"
            >
                <n-icon size="16"
                        color="#000"
                        class="icon-btn"
                >
                    <info-circle-outlined/>
                </n-icon>
            </a>
        </div>

        <div class="anchor" style="top: 4px; right: 4px;"
             v-if="!readonly"
        >
            <n-popconfirm @positive-click="reset">
                <template #trigger>
                    <n-icon size="22" color="#000"
                            class="icon-btn"
                            title="Reset"
                    >
                        <undo-outlined/>
                    </n-icon>
                </template>
                Reset model?
            </n-popconfirm>
        </div>
    </div>
</template>

<script src="./SkeletonModelCanvas.ts"></script>

<style lang="scss">
.skeleton {
    position: relative;
    box-sizing: border-box;
    border: solid 1px #d9d9d9;
    border-radius: 2px;
    background: #f2f2f2;
    overflow: hidden;

    .n-spin-container,
    .n-spin-content {
        width: 100%;
        height: 100%;
    }

    .anchor {
        position: absolute;
        z-index: 2;
    }

    .icon-btn {
        opacity: .25;
        cursor: pointer;
        transition: opacity .3s;

        &:hover {
            opacity: .5;
        }
    }
}
</style>