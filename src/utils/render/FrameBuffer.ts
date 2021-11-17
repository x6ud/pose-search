import Texture from './Texture';

export default class FrameBuffer {

    glFrameBuffer?: WebGLFramebuffer;
    textures: Texture[] = [];
    depthTexture?: Texture;
    stencilTexture?: Texture;

    constructor(glFrameBuffer: WebGLFramebuffer) {
        this.glFrameBuffer = glFrameBuffer;
    }

    get texture(): Texture | undefined {
        return this.textures[0];
    }

}
