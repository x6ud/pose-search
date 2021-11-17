<template>
    <div class="image-clip"
         :style="{width: width + 'px', height: height + 'px'}"
         ref="dom"
    >
        <img :src="src" alt=""
             :style="imgStyle"
        >
    </div>
</template>

<script src="./ImageClip.ts"></script>

<style lang="scss">
.image-clip {
    position: relative;
    overflow: hidden;
    background: #f2f2f2;
    cursor: zoom-in;

    img {
        position: absolute;
        z-index: 1;
    }

    .link {
        position: absolute;
        z-index: 2;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 8px;
        font-size: 12px;
        background: rgba(0, 0, 0, .5);
        line-height: 1.25em;
        color: #fff;
        opacity: 0;
        transition: opacity .3s;

        a {
            color: #fff;
        }
    }

    &:hover {
        .link {
            opacity: 1;
        }
    }
}
</style>