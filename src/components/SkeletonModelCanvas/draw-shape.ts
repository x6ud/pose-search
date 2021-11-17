import Renderer from '../../utils/render/Renderer';

export function drawCircle(
    renderer: Renderer,
    radius: number,
    cx: number,
    cy: number,
    precision: number = Math.min(8, radius / 2)
) {
    let x0 = 0;
    let y0 = radius;
    const num = Math.ceil(2 * Math.PI * radius / (precision / renderer.state.zoom));
    const detAngle = Math.PI * 2 / num;
    const cos = Math.cos(detAngle);
    const sin = Math.sin(detAngle);
    const px = cx;
    const py = cy;
    for (let i = 0; i < num; ++i) {
        const x1 = x0 * cos - y0 * sin;
        const y1 = x0 * sin + y0 * cos;
        renderer.drawLine(
            x0 + px,
            y0 + py,
            x1 + px,
            y1 + py
        );
        x0 = x1;
        y0 = y1;
    }
}