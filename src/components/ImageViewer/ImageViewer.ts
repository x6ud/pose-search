import {CloseCircleOutlined} from '@vicons/antd';
import {NIcon, NSpin} from 'naive-ui';
import {computed, defineComponent, ref, watch} from 'vue';
import {APP_NAME} from '../../config';
import {addGlobalDragListener} from '../../utils/dom';
import {loadImage} from '../../utils/image';

const MAX_ZOOM = 14;
const MIN_ZOOM = -10;

export default defineComponent({
    components: {
        NIcon,
        NSpin,

        CloseCircleOutlined,
    },
    props: {
        show: Boolean,
        id: {type: String, required: true},
        regular: {type: String, required: true},
        full: {type: String, required: true},
        authorName: {type: String, required: true},
        authorUsername: {type: String, required: true},
        flip: Boolean,
    },
    emits: ['update:show'],
    setup(props, ctx) {
        const fullLoading = ref(false);
        const zoom = ref(0);
        const dx = ref(0);
        const dy = ref(0);

        const authorUrl = computed(function () {
            return `https://unsplash.com/@${props.authorUsername}?utm_source=${APP_NAME}&utm_medium=referral`;
        });
        const unsplashUrl = computed(function () {
            return `https://unsplash.com/?utm_source=${APP_NAME}&utm_medium=referral`;
        });
        const imgStyle = computed(function () {
            const scale = 1.1 ** zoom.value;
            const translateX = -dx.value / scale * (props.flip ? -1 : 1);
            const translateY = dy.value / scale;
            return {
                transform: `scaleX(${(props.flip ? -1 : 1) * scale}) scaleY(${scale}) translateX(${translateX}px) translateY(${translateY}px)`
            };
        });

        watch(() => props.full, async function () {
            resetTransform();
            if (!props.full) {
                return;
            }
            try {
                fullLoading.value = true;
                await loadImage(props.full);
            } finally {
                fullLoading.value = false;
            }
        });

        function close() {
            resetTransform();
            ctx.emit('update:show', false);
        }

        function resetTransform() {
            zoom.value = 0;
            dx.value = 0;
            dy.value = 0;
        }

        function onWheel(e: WheelEvent) {
            zoom.value -= Math.round(e.deltaY / 100);
            zoom.value = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom.value));
        }

        function onMouseDown(e: MouseEvent) {
            if (e.button === 0) {
                e.preventDefault();
                e.stopPropagation();
                const dragStartX = dx.value;
                const dragStartY = dy.value;
                const x0 = e.clientX;
                const y0 = e.clientY;
                addGlobalDragListener(
                    e,
                    function (e: MouseEvent) {
                        dx.value = dragStartX - (e.clientX - x0);
                        dy.value = dragStartY + e.clientY - y0;
                    }
                );
            }
        }

        return {
            fullLoading,
            authorUrl,
            unsplashUrl,
            imgStyle,

            close,
            onWheel,
            onMouseDown,
        };
    }
});