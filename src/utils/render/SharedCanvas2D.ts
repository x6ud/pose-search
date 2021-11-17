export default class SharedCanvas2D {

    private static _instance?: SharedCanvas2D;

    static instance(): SharedCanvas2D {
        if (!SharedCanvas2D._instance) {
            SharedCanvas2D._instance = new SharedCanvas2D();
        }
        return SharedCanvas2D._instance;
    }

    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    private constructor() {
        const canvas = this.canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create canvas 2d context');
        }
        this.ctx = ctx;
    }

    resize(width: number, height: number) {
        if (width !== this.canvas.width || height !== this.canvas.height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }

    fitSize(width: number, height: number) {
        if (width > this.canvas.width || height > this.canvas.height) {
            this.canvas.width = Math.max(width, this.canvas.width);
            this.canvas.height = Math.max(height, this.canvas.height);
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}
