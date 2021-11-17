import Geometry from '../../utils/render/Geometry';
import Renderer from '../../utils/render/Renderer';
import Transform3D from '../../utils/render/Transform3D';

function lines(...indices: number[]) {
    const ret: number[] = [];
    for (let i = 0, len = indices.length; i < len - 1; ++i) {
        ret.push(indices[i]);
        ret.push(indices[i + 1]);
    }
    return ret;
}

export default class LandmarksGeometry extends Transform3D {

    private geometry = new Geometry(Geometry.TYPE_LINES);

    setLandmarks(renderer: Renderer, landmarks: { point: [number, number, number], visibility: number }[]) {
        this.dispose(renderer);
        const geometry = this.geometry;
        const vertices: { 'a_position': number[], 'a_color': number[] }[] = [];
        for (let landmark of landmarks) {
            vertices.push({
                'a_position': [landmark.point[0], landmark.point[1], landmark.point[2]],
                'a_color': [landmark.visibility, 0, 1 - landmark.visibility, 1]
            });
        }
        const indices: number[] = [
            // eyes
            ...lines(8, 6, 5, 4, 0, 1, 2, 3, 7),
            // mouth
            ...lines(10, 9),
            // trunk
            ...lines(12, 24, 23, 11, 12),
            // right arm
            ...lines(12, 14, 16),
            // left arm
            ...lines(11, 13, 15),
            // right leg
            ...lines(24, 26, 28),
            // left leg
            ...lines(23, 25, 27),
            // right hand
            ...lines(16, 18, 20, 16, 22),
            // left hand
            ...lines(15, 17, 19, 15, 21),
            // right foot
            ...lines(28, 32, 30, 28),
            // left foot
            ...lines(27, 29, 31, 27),
        ];
        geometry.setVertices(vertices);
        geometry.indices = indices;
    }

    dispose(renderer: Renderer) {
        renderer.disposeGeometry(this.geometry);
    }

    render(renderer: Renderer) {
        renderer.uniform('u_mMatrix', this.matrix);
        renderer.drawGeometry(this.geometry);
    }

}