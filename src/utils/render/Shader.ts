class AttributeInfo {
    name: string;
    size: GLint;
    type: GLenum;
    location: GLint;

    constructor(name: string, size: GLint, type: GLenum, location: GLint) {
        this.name = name;
        this.size = size;
        this.type = type;
        this.location = location;
    }
}

class UniformInfo {
    name: string;
    size: GLint;
    type: GLenum;
    location: WebGLUniformLocation;
    setter: (val: any) => void;

    constructor(name: string, size: GLint, type: GLenum, location: WebGLUniformLocation, setter: (val: any) => void) {
        this.name = name;
        this.size = size;
        this.type = type;
        this.location = location;
        this.setter = setter;
    }
}

export default class Shader {
    vertShader?: WebGLShader;
    fragShader?: WebGLShader;
    program?: WebGLProgram;

    attributes: { [name: string]: AttributeInfo } = {};
    uniforms: { [name: string]: UniformInfo } = {};

    constructor(vertShader: WebGLShader, fragShader: WebGLShader, program: WebGLProgram) {
        this.vertShader = vertShader;
        this.fragShader = fragShader;
        this.program = program;
    }

    registerAttribute(name: string, size: GLint, type: GLenum, location: GLint) {
        this.attributes[name] = new AttributeInfo(name, size, type, location);
    }

    registerUniform(name: string, size: GLint, type: GLenum, location: WebGLUniformLocation, setter: (val: any) => void) {
        if (name.endsWith('[0]')) {
            name = name.substr(0, name.length - '[0]'.length);
        }
        this.uniforms[name] = new UniformInfo(name, size, type, location, setter);
    }
}
