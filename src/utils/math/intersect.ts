export function isPointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
    return (px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2;
}

export function isPointInTriangle(
    x: number,
    y: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    cx: number,
    cy: number
): boolean {
    const v0x = cx - ax;
    const v0y = cy - ay;
    const v1x = cx - bx;
    const v1y = cy - by;
    const v2x = cx - x;
    const v2y = cy - y;
    const d00 = v0x * v0x + v0y * v0y;
    const d01 = v0x * v1x + v0y * v1y;
    const d02 = v0x * v2x + v0y * v2y;
    const d11 = v1x * v1x + v1y * v1y;
    const d12 = v1x * v2x + v1y * v2y;
    const inv = 1 / (d00 * d11 - d01 * d01);
    const u = (d11 * d02 - d01 * d12) * inv;
    const v = (d00 * d12 - d01 * d02) * inv;
    if (u < 0 || u > 1 || v < 0 || v > 1) {
        return false;
    }
    return u + v <= 1;
}

export function isCircleInRect(
    cx: number,
    cy: number,
    radius: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number
): boolean {
    if (x0 > x1) {
        [x0, x1] = [x1, x0];
    }
    if (y0 > y1) {
        [y0, y1] = [y1, y0];
    }
    return !(
        cx + radius < x0
        || cx - radius > x1
        || cy + radius < y0
        || cy - radius > y1
    );
}