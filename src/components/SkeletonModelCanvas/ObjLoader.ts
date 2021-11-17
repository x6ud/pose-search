import Geometry from '../../utils/render/Geometry';

export default class ObjLoader {

    private vertexArr: [number, number, number][] = [];
    private normalArr: [number, number, number][] = [];
    private indexArr: [number, number][][] = [];

    private _lowerX: number = 0;
    private _lowerY: number = 0;
    private _lowerZ: number = 0;
    private _upperX: number = 0;
    private _upperY: number = 0;
    private _upperZ: number = 0;
    private _xRange: number = 0;
    private _yRange: number = 0;
    private _zRange: number = 0;

    load(src: string) {
        const vertexArr = this.vertexArr;
        const normalArr = this.normalArr;
        const indexArr = this.indexArr;
        const lines = src.split('\n');
        let lowerX: number = Infinity;
        let lowerY: number = Infinity;
        let lowerZ: number = Infinity;
        let upperX: number = -Infinity;
        let upperY: number = -Infinity;
        let upperZ: number = -Infinity;
        for (let i = 0, len = lines.length; i < len; ++i) {
            const line = lines[i].trim();
            if (!line) {
                continue;
            }
            const parts = line.split(' ');
            switch (parts[0]) {
                case 'v': {
                    const x = Number(parts[1]) || 0;
                    const y = Number(parts[2]) || 0;
                    const z = Number(parts[3]) || 0;
                    vertexArr.push([x, y, z]);
                    lowerX = Math.min(lowerX, x);
                    lowerY = Math.min(lowerY, y);
                    lowerZ = Math.min(lowerZ, z);
                    upperX = Math.max(upperX, x);
                    upperY = Math.max(upperY, y);
                    upperZ = Math.max(upperZ, z);
                }
                    break;
                case 'vn': {
                    const x = Number(parts[1]) || 0;
                    const y = Number(parts[2]) || 0;
                    const z = Number(parts[3]) || 0;
                    normalArr.push([x, y, z]);
                }
                    break;
                case 'f': {
                    const face: [number, number][] = [];
                    for (let j = 1, len = parts.length; j < len; ++j) {
                        const vertexIndices = parts[j].split('/');
                        face.push([
                            Number(vertexIndices[0]) - 1,
                            vertexIndices[2] ? Number(vertexIndices[2]) - 1 : -1
                        ]);
                    }
                    indexArr.push(face);
                }
                    break;
            }
        }
        this._lowerX = lowerX;
        this._lowerY = lowerY;
        this._lowerZ = lowerZ;
        this._upperX = upperX;
        this._upperY = upperY;
        this._upperZ = upperZ;
        this._xRange = upperX - lowerX;
        this._yRange = upperY - lowerY;
        this._zRange = upperZ - lowerZ;
        return this;
    }

    translate(dx: number, dy: number, dz: number) {
        const vertexArr = this.vertexArr;
        for (let i = 0, len = vertexArr.length; i < len; ++i) {
            const vertex = vertexArr[i];
            vertex[0] += dx;
            vertex[1] += dy;
            vertex[2] += dz;
        }
        this._lowerX += dx;
        this._upperX += dx;
        this._lowerY += dy;
        this._upperY += dy;
        this._lowerZ += dz;
        this._upperZ += dz;
        return this;
    }

    setGeometryVertices(geometry: Geometry, color: number[] = [1, 1, 1, 1]) {
        const vertices: { 'a_color': number[], 'a_position': number[], 'a_normal': number[] }[] = [];
        const indices: number[] = [];

        const vertexArr = this.vertexArr;
        const normalArr = this.normalArr;
        const indexArr = this.indexArr;
        for (let i = 0, len = indexArr.length; i < len; ++i) {
            const face = indexArr[i];
            if (face.length !== 3 && face.length !== 4) {
                throw new Error('Illegal face vertices num');
            }
            const index0 = vertices.length;
            let needsCalculateNormal = false;
            for (let j = 0, len = face.length; j < len; ++j) {
                const vertexIndices = face[j];
                const positionIndex = vertexIndices[0];
                const normalIndex = vertexIndices[1];
                const position = vertexArr[positionIndex];
                if (normalIndex < 0) {
                    needsCalculateNormal = true;
                }
                const normal = normalIndex < 0 ? [0, 0, 0] : normalArr[normalIndex];
                vertices.push({'a_color': color, 'a_position': position, 'a_normal': normal});
            }
            if (needsCalculateNormal) {
                // todo
            }
            if (face.length === 3) {
                indices.push(index0, index0 + 1, index0 + 2);
            } else {
                indices.push(
                    index0, index0 + 1, index0 + 2,
                    index0, index0 + 2, index0 + 3,
                );
            }
        }

        geometry.setVertices(vertices);
        geometry.indices = indices;
    }

    get lowerX(): number {
        return this._lowerX;
    }

    get lowerY(): number {
        return this._lowerY;
    }

    get lowerZ(): number {
        return this._lowerZ;
    }

    get upperX(): number {
        return this._upperX;
    }

    get upperY(): number {
        return this._upperY;
    }

    get upperZ(): number {
        return this._upperZ;
    }

    get xRange(): number {
        return this._xRange;
    }

    get yRange(): number {
        return this._yRange;
    }

    get zRange(): number {
        return this._zRange;
    }
}