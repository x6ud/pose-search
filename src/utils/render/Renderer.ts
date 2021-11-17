import {A_COLOR, A_POSITION, A_TEX_COORD, U_TEXTURE} from './constants';
import FrameBuffer from './FrameBuffer';
import Geometry from './Geometry';
import getUniformSetter from './get-uniform-setter';
import Label from './Label';
import Shader from './Shader';
import color2dFrag from './shaders/color-2d.frag';
import color2dVert from './shaders/color-2d.vert';
import image2dFrag from './shaders/image-2d.frag';
import image2dVert from './shaders/image-2d.vert';
import Texture from './Texture';

enum Side {
    NONE, FRONT, BACK
}

enum BatchType {
    MESH, LINES
}

enum BlendMode {
    OVERLAP, LIGHT, PIGMENT
}

interface RendererState {
    /** Viewport width. */
    width: number;
    /** Viewport height. */
    height: number;
    /** 2D draw color. */
    color: { r: number, g: number, b: number, a: number };
    /** 2D camera x. */
    cameraX: number;
    /** 2D camera y. */
    cameraY: number;
    /** 2D camera zoom. */
    zoom: number;
    blendMode: BlendMode;
}

export default class Renderer {

    private static _sharedInstance?: Renderer;

    static sharedInstance(): Renderer {
        if (!Renderer._sharedInstance) {
            Renderer._sharedInstance = new Renderer();
        }
        return Renderer._sharedInstance;
    }

    readonly SIDE_NONE = Side.NONE;
    readonly SIDE_FRONT = Side.FRONT;
    readonly SIDE_BACK = Side.BACK;

    readonly BLEND_MODE_OVERLAP = BlendMode.OVERLAP;
    readonly BLEND_MODE_LIGHT = BlendMode.LIGHT;
    readonly BLEND_MODE_PIGMENT = BlendMode.PIGMENT;

    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGL2RenderingContext;
    attribLocations?: { [name: string]: number };

    /** An 1x1 0xfff pixel. */
    readonly BLANK_WHITE: Texture;
    readonly IMAGE_2D_SHADER: Shader;
    readonly COLOR_2D_SHADER: Shader;

    private currentShader?: Shader;
    private readonly frameBufferStack: FrameBuffer[] = [];
    private currentFrameBuffer?: FrameBuffer;

    private readonly batchSize: number;
    private readonly batchPositionVertices: Float32Array;
    private readonly batchTexCoordVertices: Float32Array;
    private readonly batchColorVertices: Float32Array;
    private readonly batchPositionBuffer: WebGLBuffer;
    private readonly batchTexCoordBuffer: WebGLBuffer;
    private readonly batchColorBuffer: WebGLBuffer;
    private batchType: BatchType = BatchType.MESH;
    private batchTexture?: Texture;
    private batchIndex: number = 0;
    private drawing2D: boolean = false;

    public state: RendererState = {
        width: 0,
        height: 0,
        color: {r: 1, g: 1, b: 1, a: 1},
        cameraX: 0,
        cameraY: 0,
        zoom: 1,
        blendMode: BlendMode.OVERLAP
    };
    private stateStack: RendererState[] = [];

    constructor(target?: HTMLCanvasElement | WebGL2RenderingContext, batchSize: number = 2000) {
        let canvas: HTMLCanvasElement;
        let gl: WebGL2RenderingContext | null = null;
        if (!target) {
            canvas = document.createElement('canvas');
        } else {
            if (target instanceof HTMLCanvasElement) {
                canvas = target;
            } else {
                canvas = target.canvas as HTMLCanvasElement;
                gl = target;
            }
        }
        if (!gl) {
            gl = canvas.getContext('webgl2',
                {
                    alpha: true,
                    antialias: false,
                    depth: true,
                    premultipliedAlpha: false,
                    preserveDrawingBuffer: false,
                    stencil: false
                }
            );
            if (!gl) {
                throw new Error('Failed to create WebGL2 rendering context');
            }
        }
        this.canvas = canvas;
        this.gl = gl;
        this.state.width = canvas.width;
        this.state.height = canvas.height;
        gl.viewport(0, 0, this.state.width, this.state.height);
        gl.enable(gl.BLEND);

        this.BLANK_WHITE = this.createTextureFromRgbaPixels(1, 1, new Uint8Array([0xff, 0xff, 0xff, 0xff]));

        this.IMAGE_2D_SHADER = this.createShader(image2dVert, image2dFrag);
        this.COLOR_2D_SHADER = this.createShader(color2dVert, color2dFrag);

        this.batchSize = batchSize;
        this.batchPositionVertices = new Float32Array(batchSize * 3 * 2 * 2);
        this.batchPositionBuffer = this.createDynamicDrawBuffer(this.batchPositionVertices);
        this.batchTexCoordVertices = new Float32Array(batchSize * 3 * 2 * 2);
        this.batchTexCoordBuffer = this.createDynamicDrawBuffer(this.batchTexCoordVertices);
        this.batchColorVertices = new Float32Array(batchSize * 3 * 2 * 4);
        this.batchColorBuffer = this.createDynamicDrawBuffer(this.batchColorVertices);
    }

    copyTo(
        ctx: CanvasRenderingContext2D,
        dx: number = 0,
        dy: number = 0,
        dw: number = this.state.width,
        dh: number = this.state.height,
        sx: number = 0,
        sy: number = 0,
        sw: number = this.state.width,
        sh: number = this.state.height
    ) {
        ctx.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    viewport(width: number, height: number) {
        this.state.width = width;
        this.state.height = height;
        this.gl.viewport(0, 0, this.state.width, this.state.height);
    }

    resizeCanvas(width: number, height: number) {
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        this.viewport(width, height);
    }

    clearColor(r: number = 0, g: number = 0, b: number = 0, a: number = 0) {
        const gl = this.gl;
        gl.clearColor(r, g, b, a);
    }

    clear(color: boolean, depth: boolean, stencil: boolean) {
        this.flush2D();
        this.switchFrameBuffer();
        const gl = this.gl;
        let mask = 0;
        if (color) {
            mask |= gl.COLOR_BUFFER_BIT;
        }
        if (depth) {
            mask |= gl.DEPTH_BUFFER_BIT;
        }
        if (stencil) {
            mask |= gl.STENCIL_BUFFER_BIT;
        }
        gl.clear(mask);
    }

    depthTest(enabled: boolean) {
        const gl = this.gl;
        if (enabled) {
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
    }

    depthMask(enabled: boolean) {
        this.gl.depthMask(enabled);
    }

    cullFace(side: Side) {
        const gl = this.gl;
        switch (side) {
            case Side.NONE:
                gl.disable(gl.CULL_FACE);
                break;
            case Side.FRONT:
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.FRONT);
                break;
            case Side.BACK:
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
                break;
        }
    }

    blendMode(blendMode: BlendMode) {
        if (blendMode === this.state.blendMode) {
            return;
        }
        this.state.blendMode = blendMode;
        this.flush2D();
        const gl = this.gl;
        switch (blendMode) {
            case BlendMode.OVERLAP:
                gl.blendEquation(gl.FUNC_ADD);
                gl.blendFunc(gl.ONE, gl.ZERO);
                break;
            case BlendMode.LIGHT:
                gl.blendEquation(gl.FUNC_ADD);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                break;
            case BlendMode.PIGMENT: {
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.MAX);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }
                break;
        }
    }

    useShader(shader?: Shader) {
        if (shader !== this.currentShader) {
            this.flush2D();
            this.currentShader = shader;
            if (shader) {
                const gl = this.gl;
                gl.useProgram(shader.program!);
            }
        }
    }

    uniform(name: string, value: any) {
        const shader = this.currentShader;
        if (!shader) {
            return;
        }
        this.flush2D();
        const uniform = shader.uniforms[name];
        uniform?.setter(value);
    }

    save() {
        if (this.stateStack.length > 999) {
            throw new Error('State stack has reach a max size of 999');
        }
        const state = this.state;
        const color = state.color;
        this.stateStack.push({
            width: state.width,
            height: state.height,
            color: {r: color.r, g: color.g, b: color.b, a: color.a},
            cameraX: state.cameraX,
            cameraY: state.cameraY,
            zoom: state.zoom,
            blendMode: state.blendMode
        });
    }

    restore() {
        const state = this.stateStack.pop();
        if (!state) {
            throw new Error('State stack is empty');
        }
        this.state.color.r = state.color.r;
        this.state.color.g = state.color.g;
        this.state.color.b = state.color.b;
        this.state.color.a = state.color.a;
        this.state.cameraX = state.cameraX;
        this.state.cameraY = state.cameraY;
        this.state.zoom = state.zoom;
        this.viewport(state.width, state.height);
        this.blendMode(state.blendMode);
    }

    private createDynamicDrawBuffer(vertices: Float32Array) {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGL buffer');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer;
    }

    private createVBO(vertices: Float32Array) {
        const gl = this.gl;
        const vbo = gl.createBuffer();
        if (!vbo) {
            throw new Error('Failed to create WebGL buffer');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }

    private createIBO(indices: number[]) {
        const gl = this.gl;
        const ibo = gl.createBuffer();
        if (!ibo) {
            throw new Error('Failed to create WebGL buffer');
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    private bindVertexArrayAttribute(
        location: GLint,
        buffer: WebGLBuffer,
        componentSize: GLint = 4,
        type: GLenum = this.gl.FLOAT,
        normalized: GLboolean = false,
        stride: GLsizei = 0,
        offset: GLintptr = 0
    ) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, componentSize, type, normalized, stride, offset);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    // ====================== texture ======================

    createEmptyTexture(width: number = this.state.width, height: number = this.state.height, flipY: boolean = false): Texture {
        if (width < 0 || height < 0) {
            throw new Error('Negative width/height');
        }
        const gl = this.gl;
        const texture = gl.createTexture();
        if (!texture) {
            throw new Error('Failed to create WebGL texture');
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        const ret = new Texture(texture, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE);
        ret.flipY = flipY;
        return ret;
    }

    createTexture(image: TexImageSource): Texture {
        const texture = this.createEmptyTexture(image.width, image.height);
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture!);
        gl.texImage2D(gl.TEXTURE_2D, texture.level, texture.internalFormat, texture.format, texture.type, image);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    createTextureFromImageUrl(url: string): Promise<Texture> {
        return new Promise((resolve, reject) => {
            try {
                const image = new Image();
                image.onload = () => {
                    try {
                        const texture = this.createTexture(image);
                        texture.image = image;
                        resolve(texture);
                    } catch (e) {
                        reject(e);
                    }
                };
                image.onabort = image.onerror = (e: string | Event) => {
                    reject(e);
                };
                image.src = url;
            } catch (e) {
                reject(e);
            }
        });
    }

    createDepthTexture(width: number = this.state.width, height: number = this.state.height) {
        if (width < 0 || height < 0) {
            throw new Error('Negative width/height');
        }
        const gl = this.gl;
        const texture = gl.createTexture();
        if (!texture) {
            throw new Error('Failed to create WebGL texture');
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return new Texture(texture, 0, gl.DEPTH_COMPONENT32F, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT);
    }

    createTextureFromRgbaPixels(width: number, height: number, pixels: ArrayBufferView) {
        const texture = this.createEmptyTexture(width, height);
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture!);
        gl.texImage2D(gl.TEXTURE_2D, texture.level, texture.internalFormat, width, height, texture.border, texture.format, texture.type, pixels);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    setTextureFromPixels(texture: Texture, width: number, height: number, pixels: ArrayBufferView) {
        const gl = this.gl;
        if (!texture.glTexture) {
            throw new Error('Texture has been deleted');
        }
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
        gl.texImage2D(gl.TEXTURE_2D, texture.level, texture.internalFormat, width, height, texture.border, texture.format, texture.type, pixels);
        gl.bindTexture(gl.TEXTURE_2D, null);
        texture.width = width;
        texture.height = height;
    }

    deleteTexture(texture: Texture) {
        if (texture.glTexture) {
            this.gl.deleteTexture(texture.glTexture);
            texture.glTexture = undefined;
        }
        texture.width = 0;
        texture.height = 0;
    }

    resizeTexture(texture: Texture,
                  width: number = this.state.width,
                  height: number = this.state.height,
                  recreate: boolean = false
    ) {
        if (width < 0 || height < 0) {
            throw new Error('Negative width/height');
        }
        if (texture.width === width && texture.height === height) {
            return;
        }
        const gl = this.gl;
        if (!texture.glTexture) {
            throw new Error('Texture has been deleted');
        }
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
        gl.texImage2D(gl.TEXTURE_2D, texture.level, texture.internalFormat, width, height, texture.border, texture.format, texture.type, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        texture.width = width;
        texture.height = height;
    }

    // ====================== shader ======================

    private createGlShader(src: string, type: GLenum): WebGLShader {
        const gl = this.gl;
        const shader = gl.createShader(type);
        if (!shader) {
            throw new Error('Failed to create WebGL shader');
        }
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error('Failed to compile WebGL shader:\n\n' + gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    createShader(vertSrc: string, fragSrc: string): Shader {
        const gl = this.gl;
        const vertShader = this.createGlShader(vertSrc, gl.VERTEX_SHADER);
        const fragShader = this.createGlShader(fragSrc, gl.FRAGMENT_SHADER);
        const program = gl.createProgram();
        if (!program) {
            throw new Error('Failed to create WebGL program');
        }
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        const attribLocations = this.attribLocations;
        if (attribLocations) {
            for (let attrName in attribLocations) {
                if (attribLocations.hasOwnProperty(attrName)) {
                    gl.bindAttribLocation(program, attribLocations[attrName], attrName);
                }
            }
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Failed to link WebGL program:\n\n' + gl.getProgramInfoLog(program));
        }

        const shader = new Shader(vertShader, fragShader, program);

        const numOfAttrs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numOfAttrs; ++i) {
            const info = gl.getActiveAttrib(program, i);
            if (!info) {
                throw new Error('Failed to get WebGL attribute info');
            }
            const location = gl.getAttribLocation(program, info.name);
            shader.registerAttribute(info.name, info.size, info.type, location);
        }

        const numOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        const samplerCounter = {count: 0};
        for (let i = 0; i < numOfUniforms; ++i) {
            const info = gl.getActiveUniform(program, i);
            if (!info) {
                throw new Error('Failed to get WebGL uniform info');
            }
            const location = gl.getUniformLocation(program, info.name);
            if (location == null) {
                throw new Error('Failed to get uniform location');
            }
            shader.registerUniform(
                info.name,
                info.size,
                info.type,
                location,
                getUniformSetter(gl, info.name, info.size, info.type, location, samplerCounter)
            );
        }

        return shader;
    }

    deleteShader(shader: Shader) {
        const gl = this.gl;
        if (shader.program) {
            gl.deleteProgram(shader.program);
            shader.program = undefined;
        }
        if (shader.vertShader) {
            gl.deleteShader(shader.vertShader);
            shader.vertShader = undefined;
        }
        if (shader.fragShader) {
            gl.deleteShader(shader.fragShader);
            shader.fragShader = undefined;
        }
        shader.uniforms = {};
        shader.attributes = {};
    }

    // ====================== frame buffer ======================

    createFrameBuffer(): FrameBuffer {
        const gl = this.gl;
        const frameBuffer = gl.createFramebuffer();
        if (!frameBuffer) {
            throw new Error('Failed to create WebGL frame buffer');
        }
        return new FrameBuffer(frameBuffer);
    }

    attachColorTexture(frameBuffer: FrameBuffer, texture: Texture | null) {
        this.attachColorTextures(frameBuffer, texture ? [texture] : []);
    }

    attachColorTextures(frameBuffer: FrameBuffer, textures: Texture[]) {
        const gl = this.gl;
        if (!frameBuffer.glFrameBuffer) {
            throw new Error('Frame buffer has been deleted');
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
        frameBuffer.textures.length = textures.length;
        textures.forEach((texture, index) => {
            if (!texture.glTexture) {
                throw new Error('Texture has been deleted');
            }
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture.glTexture, texture.level);

            frameBuffer.textures[index] = texture;
        });
        gl.drawBuffers(textures.map((texture, index) => (gl.COLOR_ATTACHMENT0 + index)));
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.currentFrameBuffer = undefined;
    }

    attachDepthTexture(frameBuffer: FrameBuffer, texture: Texture | null) {
        const gl = this.gl;
        if (!frameBuffer.glFrameBuffer) {
            throw new Error('Frame buffer has been deleted');
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
        if (texture) {
            if (!texture.glTexture) {
                throw new Error('Texture has been deleted');
            }
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture.glTexture, texture.level);
            frameBuffer.depthTexture = texture;
        } else {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, null, 0);
            frameBuffer.depthTexture = undefined;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.currentFrameBuffer = undefined;
    }

    attachStencilTexture(frameBuffer: FrameBuffer, texture: Texture | null) {
        const gl = this.gl;
        if (!frameBuffer.glFrameBuffer) {
            throw new Error('Frame buffer has been deleted');
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
        if (texture) {
            if (!texture.glTexture) {
                throw new Error('Texture has been deleted');
            }
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, texture.glTexture, texture.level);
            frameBuffer.stencilTexture = texture;
        } else {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, null, 0);
            frameBuffer.stencilTexture = undefined;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.currentFrameBuffer = undefined;
    }

    deleteFrameBuffer(frameBuffer: FrameBuffer, deleteTexture: boolean = false) {
        if (frameBuffer.glFrameBuffer) {
            this.gl.deleteFramebuffer(frameBuffer.glFrameBuffer);
            frameBuffer.glFrameBuffer = undefined;
        }
        if (deleteTexture) {
            frameBuffer.textures.forEach(texture => this.deleteTexture(texture));
        }
    }

    resizeFrameBuffer(frameBuffer: FrameBuffer, width: number = this.state.width, height: number = this.state.height) {
        frameBuffer.textures.forEach(texture => this.resizeTexture(texture, width, height));
        frameBuffer.depthTexture && this.resizeTexture(frameBuffer.depthTexture, width, height);
        frameBuffer.stencilTexture && this.resizeTexture(frameBuffer.stencilTexture, width, height);
    }

    startCapture(frameBuffer: FrameBuffer) {
        this.flush2D();
        this.frameBufferStack.push(frameBuffer);
    }

    endCapture() {
        this.flush2D();
        this.frameBufferStack.pop();
    }

    private switchFrameBuffer() {
        const stack = this.frameBufferStack;
        const frameBuffer = stack.length ? stack[stack.length - 1] : undefined;
        if (frameBuffer !== this.currentFrameBuffer) {
            this.currentFrameBuffer = frameBuffer || undefined;
            const gl = this.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer?.glFrameBuffer || null);
        }
    }

    // ====================== 3d - geometry ======================

    disposeGeometry(geometry: Geometry) {
        const gl = this.gl;
        if (geometry.vao) {
            gl.deleteVertexArray(geometry.vao);
            geometry.vao = undefined;
        }
        if (geometry.ibo) {
            gl.deleteBuffer(geometry.ibo);
            geometry.ibo = undefined;
        }
        geometry.attributes.forEach(attr => {
            if (attr.vbo) {
                gl.deleteBuffer(attr.vbo);
                attr.vbo = undefined;
            }
        });
    }

    drawGeometry(geometry: Geometry) {
        if (this.drawing2D) {
            throw new Error('Renderer.end2D must be call before draw geometry');
        }

        const gl = this.gl;

        if (!geometry.vao) {
            const vao = gl.createVertexArray();
            if (!vao) {
                throw new Error('Failed to create Vertex Array Object');
            }
            geometry.vao = vao;
            gl.bindVertexArray(vao);
            const shader = this.currentShader;
            if (!shader) {
                throw new Error('Shader not set');
            }
            const attribLocations = this.attribLocations;
            geometry.attributes.forEach(geoAttr => {
                if (!geoAttr.vbo) {
                    geoAttr.vbo = this.createVBO(geoAttr.vertices);
                }
                if (attribLocations && attribLocations.hasOwnProperty(geoAttr.name)) {
                    this.bindVertexArrayAttribute(
                        attribLocations[geoAttr.name],
                        geoAttr.vbo,
                        geoAttr.componentSize
                    );
                } else {
                    const attribute = shader.attributes[geoAttr.name];
                    if (attribute) {
                        this.bindVertexArrayAttribute(
                            attribute.location,
                            geoAttr.vbo,
                            geoAttr.componentSize
                        );
                    }
                }
            });
        }
        gl.bindVertexArray(geometry.vao);

        if (!geometry.ibo) {
            geometry.ibo = this.createIBO(geometry.indices);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.ibo);

        this.switchFrameBuffer();
        switch (geometry.type) {
            case Geometry.TYPE_TRIANGLES:
                gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
                break;
            case Geometry.TYPE_LINES:
                gl.drawElements(gl.LINES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
                break;
        }

        gl.bindVertexArray(null);
    }

    // ====================== 2D - instanced drawing ======================

    begin2D() {
        if (this.drawing2D) {
            throw new Error('Renderer.end2D must be call before begin');
        }
        this.drawing2D = true;
    }

    end2D() {
        if (!this.drawing2D) {
            throw new Error('Renderer.begin2D must be call before end');
        }
        this.flush2D();
        this.drawing2D = false;
    }

    setCameraPosition(x: number, y: number) {
        this.state.cameraX = x;
        this.state.cameraY = y;
    }

    centerCamera() {
        this.setCameraPosition(this.state.width / 2, this.state.height / 2);
    }

    setZoom(zoom: number) {
        this.state.zoom = zoom;
    }

    setColor(r: number, g: number, b: number, a: number = 1) {
        this.state.color.r = r;
        this.state.color.g = g;
        this.state.color.b = b;
        this.state.color.a = a;
    }

    private flush2D() {
        if (!this.drawing2D) {
            return;
        }
        if (this.batchIndex === 0) {
            return;
        }
        switch (this.batchType) {
            case BatchType.MESH:
                this.flushMesh();
                break;
            case BatchType.LINES:
                this.flushLines();
                break;
        }
    }

    private flushMesh() {
        const texture = this.batchTexture;

        const len = this.batchIndex;
        this.batchIndex = 0;

        const gl = this.gl;
        let shader = this.currentShader;
        if (!shader) {
            shader = this.IMAGE_2D_SHADER;
        }
        if (!shader.program) {
            throw new Error('Shader has been deleted');
        }
        gl.useProgram(shader.program);

        // position
        const aPosition = shader.attributes[A_POSITION];
        if (aPosition) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.batchPositionBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.batchPositionVertices);
            const location = aPosition.location;
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
        }

        // tex-coord
        const aTexCoord = shader.attributes[A_TEX_COORD];
        if (aTexCoord) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.batchTexCoordBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.batchTexCoordVertices);
            const location = aTexCoord.location;
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
        }

        // color
        const aColor = shader.attributes[A_COLOR];
        if (aColor) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.batchColorBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.batchColorVertices);
            const location = aColor.location;
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, 4, gl.FLOAT, false, 0, 0);
        }

        // texture
        shader.uniforms[U_TEXTURE]?.setter(texture?.glTexture);

        // draw
        this.switchFrameBuffer();
        gl.drawArrays(gl.TRIANGLES, 0, len * 6);
    }

    private flushLines() {
        const len = this.batchIndex;
        this.batchIndex = 0;

        const gl = this.gl;
        let shader = this.currentShader;
        if (!shader) {
            shader = this.COLOR_2D_SHADER;
        }
        if (!shader.program) {
            throw new Error('Shader has been deleted');
        }
        gl.useProgram(shader.program);

        // position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.batchPositionBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.batchPositionVertices);
        const positionLocation = shader.attributes[A_POSITION].location;
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.batchColorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.batchColorVertices);
        const colorLocation = shader.attributes[A_COLOR].location;
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

        // draw
        this.switchFrameBuffer();
        gl.drawArrays(gl.LINES, 0, len * 2);
    }

    drawLine(x0: number, y0: number, x1: number, y1: number) {
        if (!this.drawing2D) {
            throw new Error('Renderer.begin2D must be call before draw');
        }
        if (
            this.batchIndex >= this.batchSize * 3
            || this.batchType !== BatchType.LINES
        ) {
            this.flush2D();
        }
        this.batchType = BatchType.LINES;

        const zoom = this.state.zoom;
        const invW = 2 / this.state.width * zoom;
        const invH = 2 / this.state.height * zoom;
        const cameraX = this.state.cameraX;
        const cameraY = this.state.cameraY;

        const positionVertices = this.batchPositionVertices;
        const index = this.batchIndex * 2 * 2;
        positionVertices[index] = (x0 - cameraX) * invW;
        positionVertices[index + 1] = (y0 - cameraY) * invH;
        positionVertices[index + 2] = (x1 - cameraX) * invW;
        positionVertices[index + 3] = (y1 - cameraY) * invH;

        const colorIndex = this.batchIndex * 2 * 4;
        const vertexColors = this.batchColorVertices;
        const color = this.state.color;
        for (let i = 0; i < 2; ++i) {
            const offset = i * 4;
            vertexColors[colorIndex + offset] = color.r;
            vertexColors[colorIndex + 1 + offset] = color.g;
            vertexColors[colorIndex + 2 + offset] = color.b;
            vertexColors[colorIndex + 3 + offset] = color.a;
        }

        this.batchIndex += 1;
    }

    private pushCwQuadVertices(
        texture: Texture,
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
        texX0: number,
        texY0: number,
        texX1: number,
        texY1: number,
        texX2: number,
        texY2: number,
        texX3: number,
        texY3: number
    ) {
        if (!this.drawing2D) {
            throw new Error('Renderer.begin2D must be call before draw');
        }
        if (
            this.batchIndex >= this.batchSize
            || texture !== this.batchTexture
            || this.batchType !== BatchType.MESH
        ) {
            this.flush2D();
        }
        this.batchType = BatchType.MESH;

        this.batchTexture = texture;
        const index = this.batchIndex * 3 * 2 * 2;
        const positionVertices = this.batchPositionVertices;
        const texCoordVertices = this.batchTexCoordVertices;

        positionVertices[index] = x0;
        positionVertices[index + 1] = y0;
        positionVertices[index + 2] = x1;
        positionVertices[index + 3] = y1;
        positionVertices[index + 4] = x3;
        positionVertices[index + 5] = y3;

        positionVertices[index + 6] = x1;
        positionVertices[index + 7] = y1;
        positionVertices[index + 8] = x2;
        positionVertices[index + 9] = y2;
        positionVertices[index + 10] = x3;
        positionVertices[index + 11] = y3;

        if (texture.flipY) {
            [texX0, texY0, texX3, texY3] = [texX3, texY3, texX0, texY0];
            [texX1, texY1, texX2, texY2] = [texX2, texY2, texX1, texY1];
        }

        texCoordVertices[index] = texX0;
        texCoordVertices[index + 1] = texY0;
        texCoordVertices[index + 2] = texX1;
        texCoordVertices[index + 3] = texY1;
        texCoordVertices[index + 4] = texX3;
        texCoordVertices[index + 5] = texY3;

        texCoordVertices[index + 6] = texX1;
        texCoordVertices[index + 7] = texY1;
        texCoordVertices[index + 8] = texX2;
        texCoordVertices[index + 9] = texY2;
        texCoordVertices[index + 10] = texX3;
        texCoordVertices[index + 11] = texY3;

        const colorIndex = this.batchIndex * 3 * 2 * 4;
        const vertexColors = this.batchColorVertices;
        const color = this.state.color;
        for (let i = 0; i < 2 * 3; ++i) {
            const offset = i * 4;
            vertexColors[colorIndex + offset] = color.r;
            vertexColors[colorIndex + 1 + offset] = color.g;
            vertexColors[colorIndex + 2 + offset] = color.b;
            vertexColors[colorIndex + 3 + offset] = color.a;
        }
        this.batchIndex += 1;
    }

    drawCwQuad(
        texture: Texture,
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
        texX0: number = 0,
        texY0: number = texture.height,
        texX1: number = texture.width,
        texY1: number = texture.height,
        texX2: number = texture.width,
        texY2: number = 0,
        texX3: number = 0,
        texY3: number = 0
    ) {
        const zoom = this.state.zoom;
        const invW = 2 / this.state.width * zoom;
        const invH = 2 / this.state.height * zoom;
        const invSW = 1 / texture.width;
        const invSH = 1 / texture.height;
        const cameraX = this.state.cameraX;
        const cameraY = this.state.cameraY;
        this.pushCwQuadVertices(
            texture,
            (x0 - cameraX) * invW,
            (y0 - cameraY) * invH,
            (x1 - cameraX) * invW,
            (y1 - cameraY) * invH,
            (x2 - cameraX) * invW,
            (y2 - cameraY) * invH,
            (x3 - cameraX) * invW,
            (y3 - cameraY) * invH,
            texX0 * invSW,
            texY0 * invSH,
            texX1 * invSW,
            texY1 * invSH,
            texX2 * invSW,
            texY2 * invSH,
            texX3 * invSW,
            texY3 * invSH
        );
    }

    drawRect(
        texture: Texture,
        dx: number = 0,
        dy: number = 0,
        dw: number = texture.width,
        dh: number = texture.height,
        flipX: boolean = false,
        flipY: boolean = false,
        sx: number = 0,
        sy: number = 0,
        sw: number = texture.width,
        sh: number = texture.height
    ) {
        const dstLeft = dx;
        const dstRight = dx + dw;
        const dstTop = dy + dh;
        const dstBottom = dy;
        let texLeft = sx;
        let texRight = sx + sw;
        let texTop = sy;
        let texBottom = sy + sh;
        if (flipX) {
            [texLeft, texRight] = [texRight, texLeft];
        }
        if (flipY) {
            [texTop, texBottom] = [texBottom, texTop];
        }
        this.drawCwQuad(
            texture,
            dstLeft,
            dstBottom,
            dstRight,
            dstBottom,
            dstRight,
            dstTop,
            dstLeft,
            dstTop,
            texLeft,
            texBottom,
            texRight,
            texBottom,
            texRight,
            texTop,
            texLeft,
            texTop
        );
    }

    draw(
        texture: Texture,
        dstX: number = 0,
        dstY: number = 0,
        dstW: number = texture.width,
        dstH: number = texture.height,
        flipX: boolean = false,
        flipY: boolean = false,
        srcX: number = 0,
        srcY: number = 0,
        srcW: number = texture.width,
        srcH: number = texture.height,
        dx: number = 0,
        dy: number = 0,
        ox: number = 0,
        oy: number = 0,
        rotation: number = 0,
        sx: number = 1,
        sy: number = 1
    ) {
        const left = dstX;
        const right = dstX + dstW;
        const top = dstY + dstH;
        const bottom = dstY;

        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);

        const m11 = cosR * sx;
        const m12 = -sinR * sy;
        const m13 = -cosR * ox * sx + dx + ox + oy * sinR * sy;
        const m21 = sinR * sx;
        const m22 = cosR * sy;
        const m23 = -cosR * oy * sy + dy - ox * sinR * sx + oy;

        const v0x = left;
        const v0y = bottom;
        const v1x = right;
        const v1y = bottom;
        const v2x = right;
        const v2y = top;
        const v3x = left;
        const v3y = top;

        let texLeft = srcX;
        let texRight = srcX + srcW;
        let texTop = srcY;
        let texBottom = srcY + srcH;
        if (flipX) {
            [texLeft, texRight] = [texRight, texLeft];
        }
        if (flipY) {
            [texTop, texBottom] = [texBottom, texTop];
        }

        this.drawCwQuad(
            texture,
            m11 * v0x + m12 * v0y + m13,
            m21 * v0x + m22 * v0y + m23,
            m11 * v1x + m12 * v1y + m13,
            m21 * v1x + m22 * v1y + m23,
            m11 * v2x + m12 * v2y + m13,
            m21 * v2x + m22 * v2y + m23,
            m11 * v3x + m12 * v3y + m13,
            m21 * v3x + m22 * v3y + m23,
            texLeft,
            texBottom,
            texRight,
            texBottom,
            texRight,
            texTop,
            texLeft,
            texTop
        );
    }

    drawLabel(
        label: Label,
        dstX: number = 0,
        dstY: number = 0,
        dstW: number = label.width,
        dstH: number = label.height,
        flipX: boolean = false,
        flipY: boolean = false,
        srcX: number = 0,
        srcY: number = 0,
        srcW: number = label.width,
        srcH: number = label.height,
        dx: number = 0,
        dy: number = 0,
        ox: number = 0,
        oy: number = 0,
        rotation: number = 0,
        sx: number = 1,
        sy: number = 1
    ) {
        this.draw(
            label.texture(this),
            dstX,
            dstY,
            dstW,
            dstH,
            flipX,
            flipY,
            srcX,
            srcY,
            srcW,
            srcH,
            dx,
            dy,
            ox,
            oy,
            rotation,
            sx,
            sy
        );
    }

}
