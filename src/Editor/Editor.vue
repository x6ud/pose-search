<template>
    <div class="container rows">
        <div class="cols">
            <n-input placeholder="Unsplash Access Key"
                     title="Unsplash Access Key"
                     style="width: 140px;"
                     size="small"
                     v-model:value="accessKey"
            >
                <template #prefix>
                    <n-icon>
                        <key-outlined/>
                    </n-icon>
                </template>
            </n-input>
            <n-input placeholder="Keywords"
                     title="Keywords"
                     size="small"
                     v-model:value="keywords"
                     :disabled="!accessKey"
                     :loading="searchLoading"
                     @keypress.enter="onSearch"
            >
                <template #prefix>
                    <n-icon>
                        <search-outlined/>
                    </n-icon>
                </template>
            </n-input>
        </div>

        <div class="cols" style="height: 56px;">
            <n-button title="Prev Page"
                      style="height: 100%;"
                      size="tiny"
                      :disabled="!searchResult || page === 1"
                      :loading="searchLoading"
                      @click="prevPage"
            >
                <template #icon>
                    <n-icon>
                        <left-outlined/>
                    </n-icon>
                </template>
            </n-button>
            <div class="photos cols fill">
                <template v-if="searchResult">
                    <div class="photo"
                         v-for="item in searchResult.photos"
                         :style="{'background-image': `url(${item.urls.thumb})`}"
                         :class="{selected: item.id === photo.id}"
                         @click="selectPhoto(item.id)"
                    ></div>
                </template>
                <div class="pages"
                     @dblclick="jumpToPage"
                >
                    {{ page }}/{{ searchResult?.pages || 0 }}
                </div>
            </div>
            <n-button title="Next Page"
                      style="height: 100%;"
                      size="tiny"
                      :disabled="!searchResult || page >= searchResult.pages"
                      :loading="searchLoading"
                      @click="nextPage"
            >
                <template #icon>
                    <n-icon>
                        <right-outlined/>
                    </n-icon>
                </template>
            </n-button>
        </div>

        <div class="cols fill">
            <normalized-landmarks-canvas class="fill"
                                         :img-url="photo.regular"
                                         :landmarks="photo.normalizedLandmarks"
            />

            <div class="rows" style="width: 280px;">
                <world-landmarks-canvas style="width: 280px; height: 280px;"
                                        :landmarks="photo.worldLandmarks"
                />
                <skeleton-model-canvas style="width: 280px; height: 280px;"
                                       :landmarks="photo.worldLandmarks"
                                       readonly
                />
            </div>

            <div class="rows" style="width: 280px; overflow: auto;">
                <div class="form">
                    <div class="form-item">
                        <label>ID</label>
                        <n-input class="value"
                                 placeholder=""
                                 size="small"
                                 readonly
                                 v-model:value="photo.id"
                        />
                    </div>
                    <div class="form-item">
                        <label>Author</label>
                        <n-input class="value"
                                 placeholder=""
                                 size="small"
                                 readonly
                                 v-model:value="photo.authorName"
                        />
                    </div>
                    <div class="form-item">
                        <label>Size</label>
                        <div class="value">
                            {{ photo.width }}×{{ photo.height }}
                        </div>
                    </div>
                    <div class="form-item">
                        <label>Gender</label>
                        <div class="value">
                            <n-radio name="gender"
                                     :checked="!photo.gender"
                                     :value="0"
                                     :disabled="!photo.id"
                                     @change="onPhotoGenderChange"
                            >
                                Unmarked
                            </n-radio>
                            <n-radio name="gender"
                                     :checked="photo.gender === 1"
                                     :value="1"
                                     :disabled="!photo.id"
                                     @change="onPhotoGenderChange"
                            >
                                Male
                            </n-radio>
                            <n-radio name="gender"
                                     :checked="photo.gender === 2"
                                     :value="2"
                                     :disabled="!photo.id"
                                     @change="onPhotoGenderChange"
                            >
                                Female
                            </n-radio>
                        </div>
                    </div>
                </div>

                <div class="cols" style="justify-content: flex-end;">
                    <n-button
                        :disabled="!photo.id || !!photo.normalizedLandmarks.length || modelRunning || modelHasBeenRun"
                        :loading="modelRunning"
                        @click="runModel"
                    >
                        Run Model
                    </n-button>
                    <n-button :disabled="!photo.id || !photo.normalizedLandmarks.length || recordInserted || dbLoading"
                              @click="addRecord"
                    >
                        Add Record
                    </n-button>
                </div>
            </div>
        </div>

        <div class="cols" style="align-items: center; font-size: 12px; color: #999;">
            <div class="fill"></div>
            <div style="margin-right: .5em;">Num of Records: {{ numOfRecords }}</div>
            <n-button size="tiny"
                      type="primary"
                      :loading="dbLoading"
                      @click="saveDataJson"
            >
                <template #icon>
                    <save-filled/>
                </template>
                Save JSON
            </n-button>
        </div>
    </div>
</template>

<script src="./Editor.ts"></script>

<style lang="scss" scoped>
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

.photos {
    position: relative;
    border: solid 1px #d9d9d9;
    border-radius: 2px;
    padding: 2px;

    .photo {
        width: 50px;
        height: 50px;
        background-color: #f2f2f2;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        cursor: pointer;

        &.selected {
            background-color: #1890ff;
            outline: solid 1px #1890ff;
        }
    }

    .pages {
        position: absolute;
        right: 2px;
        bottom: 2px;
        color: rgba(0, 0, 0, 0.45);
        text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
        font-size: 12px;
        user-select: none;
    }
}

.form {
    display: flex;
    flex-direction: column;

    .form-item {
        display: flex;
        align-items: center;

        &:not(:last-child) {
            margin-bottom: 4px;
        }

        label {
            margin-right: .5em;
            width: 4em;
            text-align: right;
        }

        .value {
            flex: 1 1;
            min-width: 0;
        }
    }
}
</style>