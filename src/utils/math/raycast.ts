import {vec3} from 'gl-matrix';

export function raycastPlane(
    out: vec3,
    ray0x: number,
    ray0y: number,
    ray0z: number,
    ray1x: number,
    ray1y: number,
    ray1z: number,
    p0x: number,
    p0y: number,
    p0z: number,
    nx: number,
    ny: number,
    nz: number,
) {
    const detX = ray1x - ray0x;
    const detY = ray1y - ray0y;
    const detZ = ray1z - ray0z;
    const len = Math.sqrt(detX ** 2 + detY ** 2 + detZ ** 2);
    if (len <= 1e-8) {
        return false;
    }
    const lx = detX / len;
    const ly = detY / len;
    const lz = detZ / len;
    const nLen = Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);
    if (nLen <= 1e-8) {
        return false;
    }
    const invNLen = 1 / nLen;
    nx *= invNLen;
    ny *= invNLen;
    nz *= invNLen;
    const ln = lx * nx + ly * ny + lz * nz;
    if (Math.abs(ln) <= 1e-8) {
        return false;
    }
    const p0r0x = -ray0x + p0x;
    const p0r0y = -ray0y + p0y;
    const p0r0z = -ray0z + p0z;
    const t = (p0r0x * nx + p0r0y * ny + p0r0z * nz) / ln;
    const px = ray0x + t * lx;
    const py = ray0y + t * ly;
    const pz = ray0z + t * lz;
    vec3.set(out, px, py, pz);
    return t >= 0;
}

export function raycastSphere(
    out: vec3,
    ray0x: number,
    ray0y: number,
    ray0z: number,
    ray1x: number,
    ray1y: number,
    ray1z: number,
    cx: number,
    cy: number,
    cz: number,
    r: number
) {
    let vx = ray1x - ray0x;
    let vy = ray1y - ray0y;
    let vz = ray1z - ray0z;
    const dx = ray0x - cx;
    const dy = ray0y - cy;
    const dz = ray0z - cz;
    const a = vx ** 2 + vy ** 2 + vz ** 2;
    const b = 2 * (vx * dx + vy * dy + vz * dz);
    const c = (dx ** 2 + dy ** 2 + dz ** 2) - r ** 2;
    const delta = b ** 2 - 4 * a * c;
    if (delta < 0) {
        return false;
    }
    const sqrtDelta = Math.sqrt(delta);
    const t1 = (-b + sqrtDelta) / (2 * a);
    const t2 = (-b - sqrtDelta) / (2 * a);
    const t = Math.min(t1, t2);
    out[0] = ray0x + vx * t;
    out[1] = ray0y + vy * t;
    out[2] = ray0z + vz * t;
    return true;
}
