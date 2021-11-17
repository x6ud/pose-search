class Attribute {
    name: string;
    componentSize: number;
    vertices: Float32Array;
    vbo?: WebGLBuffer;

    constructor(name: string, componentSize: number, vertices: Float32Array) {
        this.name = name;
        this.componentSize = componentSize;
        this.vertices = vertices;
    }
}

enum PrimitiveType {
    TRIANGLES, LINES
}

export default class Geometry {

    static readonly TYPE_TRIANGLES = PrimitiveType.TRIANGLES;
    static readonly TYPE_LINES = PrimitiveType.LINES;

    type: PrimitiveType = PrimitiveType.TRIANGLES;
    attributes: Attribute[] = [];
    indices: number[] = [];
    ibo?: WebGLBuffer;
    vao?: WebGLVertexArrayObject;

    constructor(type: PrimitiveType = PrimitiveType.TRIANGLES) {
        this.type = type;
    }

    setVertices(vertices: { [name: string]: number[] }[]) {
        const len = vertices.length;
        const attributes: { [name: string]: Attribute } = {};
        for (let attrName in vertices[0]) {
            if (vertices[0].hasOwnProperty(attrName)) {
                const size = vertices[0][attrName].length;
                attributes[attrName] = new Attribute(
                    attrName,
                    size,
                    new Float32Array(size * len)
                );
            }
        }
        for (let i = 0; i < len; ++i) {
            const vertex = vertices[i];
            for (let attrName in vertex) {
                if (vertex.hasOwnProperty(attrName)) {
                    const pointArr = vertex[attrName];
                    attributes[attrName].vertices.set(pointArr, pointArr.length * i);
                }
            }
        }
        this.attributes = Object.values(attributes);
    }

}
