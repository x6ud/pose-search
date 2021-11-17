import {NSpin, NSwitch} from 'naive-ui';
import {defineComponent, onMounted, PropType, ref, watch} from 'vue';
import {NUM_OF_LANDMARKS} from '../../utils/detect-pose';
import {loadImage} from '../../utils/image';

export default defineComponent({
    components: {
        NSpin,
        NSwitch,
    },
    props: {
        landmarks: Array as PropType<{ point: [number, number, number], visibility: number }[]>,
        imgUrl: String,
    },
    setup(props) {
        const wrapper = ref<HTMLDivElement>();
        const canvas = ref<HTMLCanvasElement>();
        let ctx2d: CanvasRenderingContext2D;

        let imageLoading = ref(false);
        let image: HTMLImageElement;

        const drawLandmarks = ref(true);

        onMounted(async function () {
            ctx2d = canvas.value!.getContext('2d')!;
            await redraw();
        });

        watch([
            () => props.landmarks,
            () => props.imgUrl,
            drawLandmarks,
        ], redraw);

        async function redraw() {
            const rect = wrapper.value!.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            if (canvas.value!.width !== width || canvas.value!.height !== height) {
                canvas.value!.width = width;
                canvas.value!.height = height;
            }

            ctx2d.clearRect(0, 0, width, height);

            if (props.imgUrl) {
                if (!image || image.src !== props.imgUrl) {
                    try {
                        imageLoading.value = true;
                        image = await loadImage(props.imgUrl);
                    } finally {
                        imageLoading.value = false;
                    }
                }
                let scale = 1;
                if (image.width > width) {
                    scale = width / image.width;
                }
                if (image.height > height) {
                    scale = Math.min(scale, height / image.height);
                }
                const cx = width / 2;
                const cy = height / 2;
                const drawWidth = image.width * scale;
                const drawHeight = image.height * scale;
                const dx = cx - drawWidth / 2;
                const dy = cy - drawHeight / 2;
                ctx2d.drawImage(image, dx, dy, drawWidth, drawHeight);

                if (
                    props.landmarks?.length === NUM_OF_LANDMARKS
                    && drawLandmarks.value
                ) {
                    ctx2d.lineWidth = 1.5;

                    let count = 0;
                    let sum = 0;

                    function moveTo(index: number) {
                        ctx2d.beginPath();
                        const point = props.landmarks![index].point;
                        const x = point[0] * drawWidth + dx;
                        const y = point[1] * drawHeight + dy;
                        ctx2d.moveTo(x, y);
                        count += 1;
                        sum += props.landmarks![index].visibility;
                    }

                    function lineTo(index: number) {
                        const point = props.landmarks![index].point;
                        const x = point[0] * drawWidth + dx;
                        const y = point[1] * drawHeight + dy;
                        ctx2d.lineTo(x, y);
                        count += 1;
                        sum += props.landmarks![index].visibility;
                    }

                    function stroke() {
                        const score = sum / count || 0;
                        const r = Math.floor(255 * score);
                        const g = 0;
                        const b = Math.floor(255 * (1 - score));
                        ctx2d.strokeStyle = `rgb(${r},${g},${b})`;
                        ctx2d.stroke();
                        count = 0;
                        sum = 0;
                    }

                    // eyes
                    moveTo(8);
                    lineTo(6);
                    lineTo(5);
                    lineTo(4);
                    lineTo(0);
                    lineTo(1);
                    lineTo(2);
                    lineTo(3);
                    lineTo(7);
                    stroke();

                    // mouth
                    moveTo(10);
                    lineTo(9);
                    stroke();

                    // trunk
                    moveTo(12);
                    lineTo(24);
                    lineTo(23);
                    lineTo(11);
                    lineTo(12);
                    stroke();

                    // right arm
                    moveTo(12);
                    lineTo(14);
                    lineTo(16);
                    stroke();

                    // left arm
                    moveTo(11);
                    lineTo(13);
                    lineTo(15);
                    stroke();

                    // right leg
                    moveTo(24);
                    lineTo(26);
                    lineTo(28);
                    stroke();

                    // left leg
                    moveTo(23);
                    lineTo(25);
                    lineTo(27);
                    stroke();

                    // right hand
                    moveTo(16);
                    lineTo(18);
                    lineTo(20);
                    lineTo(16);
                    lineTo(22);
                    stroke();

                    // left hand
                    moveTo(15);
                    lineTo(17);
                    lineTo(19);
                    lineTo(15);
                    lineTo(21);
                    stroke();

                    // right foot
                    moveTo(28);
                    lineTo(32);
                    lineTo(30);
                    lineTo(28);
                    stroke();

                    // left foot
                    moveTo(27);
                    lineTo(29);
                    lineTo(31);
                    lineTo(27);
                    stroke();
                }
            }
        }

        return {
            wrapper,
            canvas,
            imageLoading,
            drawLandmarks,
        };
    }
});