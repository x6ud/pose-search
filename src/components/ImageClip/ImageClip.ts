import {computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref} from 'vue';
import {isElementInViewport} from '../../utils/dom';

export default defineComponent({
    props: {
        src: {type: String, required: true},
        width: {type: Number, required: true},
        height: {type: Number, required: true},
        imgWidth: {type: Number, required: true},
        imgHeight: {type: Number, required: true},
        center: {type: Object as PropType<[number, number, number]>, required: true},
        related: {type: Array as PropType<[number, number, number][]>, required: true},
        landmarks: {type: Array as PropType<{ point: [number, number, number], visibility: number }[]>, required: true},
        flip: Boolean,
    },
    setup(props) {
        const dom = ref<Element>();
        const visible = ref(false);

        const imgStyle = computed(function () {
            const cx = props.flip ? 1 - props.center[0] : props.center[0];
            let xl = cx;
            let xh = cx;
            for (let point of props.related) {
                const x = props.flip ? 1 - point[0] : point[0];
                xl = Math.min(xl, x);
                xh = Math.max(xh, x);
            }
            xl = Math.max(0, xl);
            xh = Math.min(1, xh);
            const xr = Math.max(Math.abs(cx - xl), Math.abs(xh - cx));

            const cy = props.center[1];
            let yl = cy;
            let yh = cy;
            for (let point of props.related) {
                yl = Math.min(yl, point[1]);
                yh = Math.max(yh, point[1]);
            }
            yl = Math.max(0, yl);
            yh = Math.min(1, yh);
            const yr = Math.max(Math.abs(cy - yl), Math.abs(yh - cy));

            const r = (xr + yr) / 2 + Math.min(xr, yr) / 4;

            const preferWidth = r * 2 * props.imgWidth;
            const preferHeight = r * 2 * props.imgHeight;
            const scale = Math.min(props.width / preferWidth, props.height / preferHeight);
            const width = props.imgWidth * scale;
            const height = props.imgHeight * scale;
            const left = -cx * width + props.width / 2;
            const top = -cy * height + props.height / 2;
            return {
                left: Math.round(left) + 'px',
                top: Math.round(top) + 'px',
                width: Math.floor(width) + 'px',
                height: Math.floor(height) + 'px',
                transform: props.flip ? 'scaleX(-1)' : '',
            };
        });

        let checkVisibilityTid: NodeJS.Timer | null = null;

        onMounted(function () {
            checkVisibilityTid = setInterval(checkVisibility, 100);
            checkVisibility();
        });

        onBeforeUnmount(function () {
            if (checkVisibilityTid != null) {
                clearInterval(checkVisibilityTid);
            }
        });

        function checkVisibility() {
            if (dom.value && isElementInViewport(dom.value)) {
                visible.value = true;
                if (checkVisibilityTid != null) {
                    clearInterval(checkVisibilityTid);
                    checkVisibilityTid = null;
                }
            }
        }

        return {
            dom,
            imgStyle,
            visible,
        };
    }
});