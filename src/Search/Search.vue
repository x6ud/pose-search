<template>
    <div class="container cols">
        <div class="rows" style="width: 320px; height: 100%; overflow: auto;">
            <div class="cols search-condition">
                <n-select class="fill"
                          size="small"
                          placeholder="Joint / Body Part"
                          filterable
                          clearable
                          :options="bodyPartOptions"
                          :loading="dbLoading"
                          v-model:value="bodyPart"
                />
                <n-button size="small"
                          type="primary"
                          @click="search"
                          :disabled="!bodyPart || searching"
                >
                    Search
                </n-button>
            </div>

            <div class="cols search-condition">
                <label>Gender</label>
                <n-radio-group size="small" v-model:value="gender">
                    <n-radio :value="0">Any</n-radio>
                    <n-radio :value="1">Male</n-radio>
                    <n-radio :value="2">Female</n-radio>
                </n-radio-group>
            </div>

            <div class="cols search-condition"
                 v-show="matchers[bodyPart]?.cameraUnrelatedMatcher"
            >
                <label>Camera</label>
                <n-radio-group size="small" v-model:value="cameraRelated">
                    <n-radio :value="1">Related</n-radio>
                    <n-radio :value="0">Ignored</n-radio>
                </n-radio-group>
            </div>

            <div class="description">
                <div>Wheel: Rotate Camera / Zoom</div>
                <div>Mouse Right: Move Camera</div>
                <div>Shift + Mouse Left: Rotate Joint</div>
            </div>

            <skeleton-model-canvas style="width: 100%; height: 400px; min-height: 400px;"
                                   :model="model"
                                   :camera="camera"
                                   :highlights="matchers[bodyPart]?.highlights"
            />

            <div style="width: 100%; height: 1px; background: #d9d9d9; margin: 6px 0;"></div>

            <div class="description">
                <div>Author: x6udpngx</div>
                <div>
                    <a href="https://github.com/x6ud/x6ud.github.io/issues" target="_blank">Leave a message</a>
                </div>
                <div>
                    <a href="https://github.com/x6ud/pose-search" target="_blank">Source code</a>
                </div>
                <div>
                    <span>Support me:&nbsp;</span>
                    <a href="https://ko-fi.com/x6udpngx" target="_blank">Ko-fi.com/x6udpngx</a>
                </div>
                <div>
                    <a href="https://x6ud.github.io/human-anatomy-for-artist-search-helper" target="_blank">
                        Male body art reference search
                    </a>
                </div>
                <div>
                    <a href="https://x6ud.github.io/female-anatomy-for-artist-search-helper" target="_blank">
                        Female body art reference search
                    </a>
                </div>
            </div>
        </div>
        <div class="fill">
            <div class="result"
                 style="width: 100%; height: 100%; overflow: auto"
                 ref="searchResultDom"
            >
                <div class="loading" v-if="dbLoading && !searchResult?.length">
                    Loading data...
                </div>
                <div class="warning"
                     v-if="!searchResult?.length && (!supportWebGL2 || !supportMouse)"
                     style="font-size: 16px;"
                >
                    <div v-if="!supportWebGL2">
                        <n-icon>
                            <warning-outlined/>
                        </n-icon>
                        This page requires WebGL2 but your system does not seem to support.
                        Try updating your graphics card drivers or changing your browser.
                    </div>
                    <div v-if="!supportMouse">
                        <n-icon>
                            <warning-outlined/>
                        </n-icon>
                        This page currently supports mouse operation only.
                    </div>
                </div>

                <image-clip v-for="item in searchResult"
                            class="photo"
                            :src="item.photo.regular"
                            :width="200"
                            :height="200"
                            :img-width="item.photo.width"
                            :img-height="item.photo.height"
                            :center="item.center"
                            :related="item.related"
                            :landmarks="item.photo.normalizedLandmarks"
                            :flip="item.flip"
                            @click="showLargePhoto(item)"
                />
            </div>
        </div>
    </div>

    <image-viewer v-model:show="showImageViewer"
                  :id="currentPhoto.id"
                  :regular="currentPhoto.regular"
                  :full="currentPhoto.full"
                  :flip="imageViewerFlip"
                  :author-name="currentPhoto.authorName"
                  :author-username="currentPhoto.authorUsername"
    />
</template>

<script src="./Search.ts"></script>

<style lang="scss">
.container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 4px;
}

.rows {
    display: flex;
    flex-direction: column;

    & > *:not(:last-child) {
        margin-bottom: 4px;
    }

    & > .fill {
        flex: 1 1;
        min-height: 0;
    }
}

.cols {
    display: flex;

    & > *:not(:last-child) {
        margin-right: 4px;
    }

    & > .fill {
        flex: 1 1;
        min-width: 0;
    }
}

.search-condition {
    align-items: center;

    label {
        width: 3.5em;
        padding-right: .5em;
        text-align: right;
        font-size: 12px;
        color: #989898;
    }
}

.description {
    color: #c2c2c2;
    font-size: 12px;
    line-height: 1.5em;

    a {
        text-decoration: none;
        font-size: inherit;
        color: #1890ff;

        &:hover {
            text-decoration: underline;
        }
    }
}

.result {
    box-sizing: border-box;
    padding: 4px;
    border: solid 1px #d9d9d9;
    border-radius: 2px;
    overflow: auto;
    user-select: none;

    .photo {
        float: left;
        margin: 0 8px 8px 0;
        border-radius: 4px;
    }
}
</style>