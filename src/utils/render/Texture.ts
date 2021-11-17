export default class Texture {
    glTexture?: WebGLTexture;

    level: GLint;
    internalFormat: GLint;
    width: number;
    height: number;
    border: GLint;
    format: GLenum;
    type: GLenum;

    flipY: boolean = false;
    image?: HTMLImageElement;

    constructor(glTexture: WebGLTexture,
                level: number,
                internalformat: number,
                width: number,
                height: number,
                border: number,
                format: number,
                type: number
    ) {
        this.glTexture = glTexture;
        this.level = level;
        this.internalFormat = internalformat;
        this.width = width;
        this.height = height;
        this.border = border;
        this.format = format;
        this.type = type;
    }

}
