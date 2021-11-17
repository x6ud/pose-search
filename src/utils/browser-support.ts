export function isWebGL2Supported() {
    return !!document.createElement('canvas')?.getContext('webgl2');
}

export function isMouseSupported() {
    return 'PointerEvent' in window;
}