import {KeyOutlined, LeftOutlined, RightOutlined, SaveFilled, SearchOutlined} from '@vicons/antd';
import {NButton, NIcon, NInput, NRadio, NTag, useMessage} from 'naive-ui';
import {defineComponent, onMounted, ref, watch} from 'vue';
import NormalizedLandmarksCanvas from '../components/NormalizedLandmarksCanvas/NormalizedLandmarksCanvas.vue';
import SkeletonModelCanvas from '../components/SkeletonModelCanvas/SkeletonModelCanvas.vue';
import WorldLandmarksCanvas from '../components/WorldLandmarksCanvas/WorldLandmarksCanvas.vue';
import PhotoDatabase from '../utils/db/PhotoDatabase';
import {detectPose} from '../utils/detect-pose';
import {loadImage} from '../utils/image';
import Photo, {getPhotoGenderByTags} from '../utils/Photo';
import {unsplashGetPhoto, unsplashSearchPhotos, UnsplashSearchPhotosResult} from '../utils/unsplash';

const LOCAL_STORAGE_KEY__UNSPLASH_ACCESS_KEY = 'unsplash-access-key';

export default defineComponent({
    components: {
        NButton,
        NIcon,
        NInput,
        NRadio,
        NTag,

        KeyOutlined,
        SearchOutlined,
        LeftOutlined,
        RightOutlined,
        SaveFilled,

        NormalizedLandmarksCanvas,
        WorldLandmarksCanvas,
        SkeletonModelCanvas,
    },
    setup: function () {
        const database = new PhotoDatabase();

        const numOfRecords = ref(0);
        const dbLoading = ref(false);

        const accessKey = ref(localStorage.getItem(LOCAL_STORAGE_KEY__UNSPLASH_ACCESS_KEY) || '');
        const keywords = ref('');
        const page = ref(1);
        const perPage = ref(20);
        const searchLoading = ref(false);
        const searchResult = ref<UnsplashSearchPhotosResult>();
        const photo = ref(new Photo());
        const recordInserted = ref(false);
        const modelRunning = ref(false);
        const modelHasBeenRun = ref(false);

        const message = useMessage();

        onMounted(async function () {
            try {
                dbLoading.value = true;
                await database.init();
                numOfRecords.value = database.countRecords();
            } finally {
                dbLoading.value = false;
            }
        });

        watch(accessKey, function (val) {
            localStorage.setItem(LOCAL_STORAGE_KEY__UNSPLASH_ACCESS_KEY, val);
        });

        async function search() {
            try {
                searchLoading.value = true;
                searchResult.value = await unsplashSearchPhotos(accessKey.value, keywords.value, page.value, perPage.value);
            } finally {
                searchLoading.value = false;
            }
        }

        async function onSearch() {
            page.value = 1;
            await search();
        }

        async function prevPage() {
            page.value = Math.max(page.value - 1, 1);
            await search();
        }

        async function nextPage() {
            page.value = Math.min(page.value + 1, searchResult.value?.pages || 1);
            await search();
        }

        async function jumpToPage() {
            const pageNum = Number(prompt('Jump to page', page.value + ''));
            if (!pageNum) {
                return;
            }
            page.value = Math.max(Math.min(Number(pageNum), searchResult.value?.pages || 1), 1) || page.value;
            await search();
        }

        async function selectPhoto(id: string) {
            const record = database.queryPhotoById(id);
            if (record) {
                recordInserted.value = true;
                photo.value = record;
            } else {
                recordInserted.value = false;
                modelHasBeenRun.value = false;
                const details = await unsplashGetPhoto(accessKey.value, id);
                photo.value = new Photo();
                photo.value.id = details.id;
                photo.value.width = details.width;
                photo.value.height = details.height;
                photo.value.full = details.urls.full;
                photo.value.regular = details.urls.regular;
                photo.value.authorName = details.author.name;
                photo.value.authorUsername = details.author.username;
                photo.value.gender = getPhotoGenderByTags(details.tags);
                photo.value.tags = details.tags;
            }
        }

        async function runModel() {
            try {
                modelRunning.value = true;
                const pose = await detectPose(await loadImage(photo.value.regular));
                photo.value.normalizedLandmarks = pose.normalizedLandmarks;
                photo.value.worldLandmarks = pose.worldLandmarks;
            } finally {
                modelHasBeenRun.value = true;
                modelRunning.value = false;
            }
        }

        function addRecord() {
            try {
                dbLoading.value = true;
                database.addPhoto(photo.value);
                recordInserted.value = true;
                numOfRecords.value += 1;
            } finally {
                dbLoading.value = false;
            }
        }

        async function saveDatabase() {
            try {
                dbLoading.value = true;
                await database.saveToFile();
            } finally {
                dbLoading.value = false;
            }
        }

        function onPhotoGenderChange(e: InputEvent) {
            const value = Number((e.target as HTMLInputElement).value);
            if (recordInserted.value) {
                database.updatePhotoGender(photo.value.id, value);
            }
            photo.value.gender = value;
        }

        return {
            numOfRecords,
            dbLoading,

            accessKey,
            keywords,
            page,
            perPage,
            searchLoading,
            searchResult,
            photo,
            recordInserted,
            modelRunning,
            modelHasBeenRun,

            onSearch,
            prevPage,
            nextPage,
            jumpToPage,
            selectPhoto,

            runModel,
            addRecord,
            saveDatabase,
            onPhotoGenderChange,
        };
    }
});