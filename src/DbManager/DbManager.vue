<template>
    <div class="container rows">
        <div class="cols" style="align-items: center; font-size: 12px; color: #999;">
            <n-button size="small"
                      :loading="dbLoading"
                      @click="recreate"
            >
                Recreate
            </n-button>
            <div class="fill"></div>
            <div style="margin-right: .5em;">Num of Records: {{ numOfRecords }}</div>
            <n-button size="small"
                      :loading="dbLoading"
                      type="primary"
                      @click="save"
            >
                <template #icon>
                    <save-outlined/>
                </template>
                Save
            </n-button>
        </div>

        <div class="cols" style="height: 56px;">
            <n-button title="Prev Page"
                      style="height: 100%;"
                      size="tiny"
                      :disabled="!page || pageNum === 1"
                      @click="prevPage"
            >
                <template #icon>
                    <n-icon>
                        <left-outlined/>
                    </n-icon>
                </template>
            </n-button>
            <div class="photos cols fill">
                <template v-if="page">
                    <div class="photo"
                         v-for="item in page"
                         :style="{'background-image': `url(${item.regular})`}"
                         :class="{selected: item.id === photo.id}"
                         @click="selectPhoto(item)"
                    ></div>
                </template>
                <div class="pages"
                     @dblclick="jumpToPage"
                >
                    {{ pageNum }}/{{ numOfPages }}
                </div>
            </div>
            <n-button title="Next Page"
                      style="height: 100%;"
                      size="tiny"
                      :disabled="!page || pageNum >= numOfPages"
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
            </div>
        </div>
    </div>
</template>

<script src="./DbManager.ts"></script>

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