import {MouseButton} from './MouseButton';

export default class Input {

    callback?: (input: Input) => void;
    private needsUpdate: boolean = false;

    mouseOver: boolean = false;
    mouseX: number = 0;
    mouseY: number = 0;
    mouseLeft: boolean = false;
    mouseLeftDownThisFrame: boolean = false;
    mouseRight: boolean = false;
    mouseRightDownThisFrame: boolean = false;
    mouseMiddle: boolean = false;
    mouseMiddleDownThisFrame: boolean = false;
    wheelDetX: number = 0;
    wheelDetY: number = 0;

    private readonly onContextmenu: (e: MouseEvent) => void;
    private readonly onMouseMove: (e: MouseEvent) => void;
    private readonly onMouseDown: (e: MouseEvent) => void;
    private readonly onMouseUp: (e: MouseEvent) => void;
    private readonly onMouseLeave: () => void;
    private readonly onMouseOut: (e: MouseEvent) => void;
    private readonly onWheel: (e: WheelEvent) => void;
    private readonly onKeyDown: (e: KeyboardEvent) => void;
    private readonly onKeyUp: (e: KeyboardEvent) => void;
    private readonly onBlur: () => void;

    private readonly keyMap: Map<string, number> = new Map();

    private timestamp: number = 0;

    constructor() {
        this.onContextmenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        this.onMouseMove = (e: MouseEvent) => {
            this.mouseOver = true;
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
            this.triggerCallback();
        };
        this.onMouseDown = (e: MouseEvent) => {
            switch (e.button) {
                case MouseButton.LEFT:
                    this.mouseLeft = true;
                    this.mouseLeftDownThisFrame = true;
                    break;
                case MouseButton.MIDDLE:
                    this.mouseMiddle = true;
                    this.mouseMiddleDownThisFrame = true;
                    break;
                case MouseButton.RIGHT:
                    this.mouseRight = true;
                    this.mouseRightDownThisFrame = true;
                    break;
            }
            this.triggerCallback();
        };
        this.onMouseUp = (e: MouseEvent) => {
            switch (e.button) {
                case MouseButton.LEFT:
                    this.mouseLeft = false;
                    this.mouseLeftDownThisFrame = false;
                    break;
                case MouseButton.MIDDLE:
                    this.mouseMiddle = false;
                    this.mouseMiddleDownThisFrame = false;
                    break;
                case MouseButton.RIGHT:
                    this.mouseRight = false;
                    this.mouseLeftDownThisFrame = false;
                    break;
            }
            this.triggerCallback();
        };
        this.onMouseLeave = () => {
            this.mouseOver = false;
            this.triggerCallback();
        };
        this.onMouseOut = (e) => {
            if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
                this.mouseLeft = false;
                this.mouseLeftDownThisFrame = false;
                this.mouseRight = false;
                this.mouseLeftDownThisFrame = false;
            }
            this.triggerCallback();
        };
        this.onWheel = (e: WheelEvent) => {
            e.preventDefault();
            this.wheelDetX += Math.round(e.deltaX / 100);
            this.wheelDetY += Math.round(e.deltaY / 100);
            this.triggerCallback();
        };
        this.onKeyDown = (e: KeyboardEvent) => {
            const target = e.target;
            if (target && 'tagName' in target && (target as HTMLElement).tagName === 'INPUT') {
                return;
            }
            if (e.ctrlKey) {
                e.preventDefault();
            }
            this.keyMap.set(e.key, this.timestamp);
            this.triggerCallback();
        };
        this.onKeyUp = (e: KeyboardEvent) => {
            const target = e.target;
            if (target && 'tagName' in target && (target as HTMLElement).tagName === 'INPUT') {
                return;
            }
            this.keyMap.delete(e.key);
            this.triggerCallback();
        };
        this.onBlur = () => {
            this.keyMap.clear();
            this.triggerCallback();
        };
    }

    setup(element: HTMLElement) {
        element.addEventListener('contextmenu', this.onContextmenu);
        element.addEventListener('mousemove', this.onMouseMove);
        element.addEventListener('mousedown', this.onMouseDown);
        element.addEventListener('mouseleave', this.onMouseLeave);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mouseout', this.onMouseOut);
        element.addEventListener('wheel', this.onWheel);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('blur', this.onBlur);
    }

    unload(element: HTMLElement) {
        element.removeEventListener('contextmenu', this.onContextmenu);
        element.removeEventListener('mousemove', this.onMouseMove);
        element.removeEventListener('mousedown', this.onMouseDown);
        element.removeEventListener('mouseleave', this.onMouseLeave);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mouseout', this.onMouseOut);
        element.removeEventListener('wheel', this.onWheel);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('blur', this.onBlur);
    }

    update() {
        this.mouseLeftDownThisFrame = false;
        this.mouseRightDownThisFrame = false;
        this.mouseMiddleDownThisFrame = false;
        this.wheelDetX = 0;
        this.wheelDetY = 0;
        this.timestamp += 1;
    }

    isKeyPressed(key: string): boolean {
        return this.keyMap.has(key);
    }

    isKeyPressedThisFrame(key: string): boolean {
        return this.keyMap.get(key) === this.timestamp;
    }

    private triggerCallback() {
        this.needsUpdate = true;
        requestAnimationFrame(() => {
            if (!this.needsUpdate) {
                return;
            }
            this.needsUpdate = false;
            this.callback && this.callback(this);
            this.update();
        });
    }

}
