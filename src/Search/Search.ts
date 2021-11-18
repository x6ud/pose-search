import {WarningOutlined} from '@vicons/antd';
import {NButton, NIcon, NRadio, NRadioGroup, NSelect} from 'naive-ui';
import {defineComponent, nextTick, onMounted, ref} from 'vue';
import ImageClip from '../components/ImageClip/ImageClip.vue';
import ImageViewer from '../components/ImageViewer/ImageViewer.vue';
import {BodyPart} from '../components/SkeletonModelCanvas/model/BodyPart';
import SkeletonModel from '../components/SkeletonModelCanvas/model/SkeletonModel';
import SkeletonModelCanvas from '../components/SkeletonModelCanvas/SkeletonModelCanvas.vue';
import {MAX_NUM_OF_SEARCH_RESULTS} from '../config';
import {isMouseSupported, isWebGL2Supported} from '../utils/browser-support';
import DraggableCamera from '../utils/DraggableCamera';
import Photo from '../utils/Photo';
import PhotoDataset from '../utils/PhotoDataset';
import MatchChest from './impl/MatchChest';
import MatchCrotch from './impl/MatchCrotch';
import MatchElbow from './impl/MatchElbow';
import MatchElbowCameraUnrelated from './impl/MatchElbowCameraUnrelated';
import MatchFace from './impl/MatchFace';
import MatchHip from './impl/MatchHip';
import MatchHipCameraUnrelated from './impl/MatchHipCameraUnrelated';
import MatchKnee from './impl/MatchKnee';
import MatchKneeCameraUnrelated from './impl/MatchKneeCameraUnrelated';
import MatchShoulder from './impl/MatchShoulder';
import MatchShoulderCameraUnrelated from './impl/MatchShoulderCameraUnrelated';
import {filterAndSort, PoseMatcher, SearchResult} from './impl/search';

const matchers: {
    [name: string]: {
        matcher: PoseMatcher,
        cameraUnrelatedMatcher?: PoseMatcher,
        highlights: BodyPart[],
    }
} = {
    'Face': {
        matcher: new MatchFace(),
        highlights: [BodyPart.head]
    },
    'Chest': {
        matcher: new MatchChest(),
        highlights: [BodyPart.trunk]
    },
    'Left Shoulder': {
        matcher: new MatchShoulder(true),
        cameraUnrelatedMatcher: new MatchShoulderCameraUnrelated(true),
        highlights: [BodyPart.trunk, BodyPart.leftUpperArm]
    },
    'Right Shoulder': {
        matcher: new MatchShoulder(false),
        cameraUnrelatedMatcher: new MatchShoulderCameraUnrelated(false),
        highlights: [BodyPart.trunk, BodyPart.rightUpperArm]
    },
    'Left Elbow': {
        matcher: new MatchElbow(true),
        cameraUnrelatedMatcher: new MatchElbowCameraUnrelated(true),
        highlights: [BodyPart.leftUpperArm, BodyPart.leftLowerArm]
    },
    'Right Elbow': {
        matcher: new MatchElbow(false),
        cameraUnrelatedMatcher: new MatchElbowCameraUnrelated(false),
        highlights: [BodyPart.rightUpperArm, BodyPart.rightLowerArm]
    },
    'Crotch': {
        matcher: new MatchCrotch(),
        highlights: [BodyPart.trunk]
    },
    'Left Hip': {
        matcher: new MatchHip(true),
        cameraUnrelatedMatcher: new MatchHipCameraUnrelated(true),
        highlights: [BodyPart.trunk, BodyPart.leftThigh]
    },
    'Right Hip': {
        matcher: new MatchHip(false),
        cameraUnrelatedMatcher: new MatchHipCameraUnrelated(false),
        highlights: [BodyPart.trunk, BodyPart.rightThigh]
    },
    'Left Knee': {
        matcher: new MatchKnee(true),
        cameraUnrelatedMatcher: new MatchKneeCameraUnrelated(true),
        highlights: [BodyPart.leftThigh, BodyPart.leftCalf]
    },
    'Right Knee': {
        matcher: new MatchKnee(false),
        cameraUnrelatedMatcher: new MatchKneeCameraUnrelated(false),
        highlights: [BodyPart.rightThigh, BodyPart.rightCalf]
    },
};

export default defineComponent({
    components: {
        NButton,
        NSelect,
        NRadio,
        NRadioGroup,
        NIcon,

        WarningOutlined,

        SkeletonModelCanvas,
        ImageClip,
        ImageViewer,
    },
    setup() {
        const supportWebGL2 = isWebGL2Supported();
        const supportMouse = isMouseSupported();

        const dataset = new PhotoDataset();
        const model = new SkeletonModel();
        const camera = new DraggableCamera();

        const searchResultDom = ref<HTMLElement>();

        const dbLoading = ref(false);
        const bodyPartOptions = Object.keys(matchers).map(option => ({value: option, label: option}));
        const bodyPart = ref<string>();
        const gender = ref(0);
        const cameraRelated = ref(1);

        const searching = ref(false);
        const searchResult = ref<SearchResult[]>();

        const showImageViewer = ref(false);
        const imageViewerFlip = ref(false);
        const currentPhoto = ref<Photo>(new Photo());

        onMounted(async function () {
            try {
                dbLoading.value = true;
                await nextTick();
                await dataset.load();
            } finally {
                dbLoading.value = false;
            }
        });

        async function search() {
            try {
                searching.value = true;
                searchResult.value = [];
                await nextTick();
                const bodyPartMatchers = matchers[bodyPart.value!];
                if (bodyPartMatchers) {
                    let list = dataset.data;
                    if (gender.value) {
                        list = list.filter(photo => photo.gender === gender.value);
                    }
                    const matcher = !cameraRelated.value && bodyPartMatchers.cameraUnrelatedMatcher ?
                        bodyPartMatchers.cameraUnrelatedMatcher
                        : bodyPartMatchers.matcher;
                    searchResult.value = filterAndSort(list, model, matcher).slice(0, MAX_NUM_OF_SEARCH_RESULTS);
                    searchResultDom.value!.scrollTop = 0;
                }
            } finally {
                searching.value = false;
            }
        }

        function showLargePhoto(item: SearchResult) {
            showImageViewer.value = true;
            imageViewerFlip.value = item.flip;
            currentPhoto.value = item.photo;
        }

        return {
            supportWebGL2,
            supportMouse,

            matchers,
            model,
            camera,

            searchResultDom,

            dbLoading,
            bodyPartOptions,
            bodyPart,
            gender,
            cameraRelated,

            searchResult,
            searching,

            showImageViewer,
            imageViewerFlip,
            currentPhoto,

            search,
            showLargePhoto,
        };
    }
});