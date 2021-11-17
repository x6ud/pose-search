import {LeftOutlined, RightOutlined, SaveOutlined} from '@vicons/antd';
import {NButton, NIcon, NInput, NRadio} from 'naive-ui';
import {computed, defineComponent, onMounted, ref} from 'vue';
import NormalizedLandmarksCanvas from '../components/NormalizedLandmarksCanvas/NormalizedLandmarksCanvas.vue';
import PhotoDatabase from '../utils/db/PhotoDatabase';
import Photo from '../utils/Photo';

export default defineComponent({
    components: {
        SaveOutlined,
        LeftOutlined,
        RightOutlined,

        NButton,
        NIcon,
        NInput,
        NRadio,

        NormalizedLandmarksCanvas,
    },
    setup() {
        let database = new PhotoDatabase();

        const dbLoading = ref(false);
        const numOfRecords = ref(0);

        const page = ref<Photo[]>([]);
        const pageNum = ref(1);
        const pageSize = ref(20);
        const numOfPages = computed(function () {
            return Math.ceil(numOfRecords.value / pageSize.value);
        });
        const photo = ref(new Photo());

        onMounted(async function () {
            try {
                dbLoading.value = true;
                await database.init();
                numOfRecords.value = database.countRecords();
                loadPage();
            } finally {
                dbLoading.value = false;
            }
        });

        async function recreate() {
            try {
                database = new PhotoDatabase();
                await database.init(false);
                database.createTables();
                numOfRecords.value = database.countRecords();
            } finally {
                dbLoading.value = false;
            }
        }

        async function save() {
            try {
                await database.saveToFile();
            } finally {
                dbLoading.value = false;
            }
        }

        function loadPage() {
            page.value = database.queryPhotosPage(pageSize.value, pageNum.value);
        }

        function prevPage() {
            pageNum.value = Math.max(pageNum.value - 1, 1);
            loadPage();
        }

        function nextPage() {
            pageNum.value = Math.min(pageNum.value + 1, numOfPages.value);
            loadPage();
        }

        function jumpToPage() {
            const num = Number(prompt('Jump to page', pageNum.value + ''));
            if (!num) {
                return;
            }
            pageNum.value = Math.max(Math.min(Number(num), numOfPages.value), 1) || 1;
            loadPage();
        }

        function selectPhoto(item: Photo) {
            photo.value = item;
        }

        function onPhotoGenderChange(e: InputEvent) {
            const value = Number((e.target as HTMLInputElement).value);
            database.updatePhotoGender(photo.value.id, value);
            photo.value.gender = value;
        }

        return {
            dbLoading,
            numOfRecords,

            page,
            pageNum,
            numOfPages,
            photo,

            recreate,
            save,

            prevPage,
            nextPage,
            jumpToPage,
            selectPhoto,
            onPhotoGenderChange,
        };
    }
});