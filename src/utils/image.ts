export function loadImage(url: string) {
    return new Promise<HTMLImageElement>(function (resolve, reject) {
        const img = new Image();
        img.onload = function () {
            resolve(img);
        };
        img.onabort = img.onerror = reject;
        img.crossOrigin = 'anonymous';
        img.src = url;
    });
}