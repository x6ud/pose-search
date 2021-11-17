import Texture from './Texture';

export default function getUniformSetter(
    gl: WebGL2RenderingContext,
    name: string,
    size: GLint,
    type: GLenum,
    location: WebGLUniformLocation,
    samplerCounter: { count: number }
): (val: any) => void {
    if (name.substr(-3) === '[0]') {
        switch (type) {
            case gl.FLOAT:
                return function (val: Float32List) {
                    gl.uniform1fv(location, val);
                };
            case gl.INT:
                return function (val: Int32List) {
                    gl.uniform1iv(location, val);
                };
            case gl.UNSIGNED_INT:
                return function (val: Uint32List) {
                    gl.uniform1uiv(location, val);
                };
            case gl.SAMPLER_2D:
                const units = new Int32Array(size);
                for (let ii = 0; ii < size; ++ii) {
                    units[ii] = samplerCounter.count++;
                }
                return function (textures: (WebGLTexture | Texture | null | undefined)[]) {
                    gl.uniform1iv(location, units);
                    for (let ii = 0; ii < size; ++ii) {
                        let texture = textures[ii];
                        if (texture instanceof Texture) {
                            texture = texture.glTexture;
                        }
                        gl.activeTexture(gl.TEXTURE0 + units[ii]);
                        gl.bindTexture(gl.TEXTURE_2D, texture || null);
                    }
                };
            default:
                throw new Error(`Unimplemented setter type (uniform: ${name}, type: ${type})`);
        }
    }
    switch (type) {
        case gl.FLOAT:
            return function (val: GLfloat) {
                gl.uniform1f(location, val);
            };
        case gl.FLOAT_VEC2:
            return function (val: Float32List) {
                gl.uniform2fv(location, val);
            };
        case gl.FLOAT_VEC3:
            return function (val: Float32List) {
                gl.uniform3fv(location, val);
            };
        case gl.FLOAT_VEC4:
            return function (val: Float32List) {
                gl.uniform4fv(location, val);
            };
        case gl.BOOL:
        case gl.INT:
            return function (val: GLint) {
                gl.uniform1i(location, val);
            };
        case gl.BOOL_VEC2:
        case gl.INT_VEC2:
            return function (val: Int32List) {
                gl.uniform2iv(location, val);
            };
        case gl.BOOL_VEC3:
        case gl.INT_VEC3:
            return function (val: Int32List) {
                gl.uniform3iv(location, val);
            };
        case gl.BOOL_VEC4:
        case gl.INT_VEC4:
            return function (val: Int32List) {
                gl.uniform4iv(location, val);
            };
        case gl.FLOAT_MAT2:
            return function (val: Float32List) {
                gl.uniformMatrix2fv(location, false, val);
            };
        case gl.FLOAT_MAT3:
            return function (val: Float32List) {
                gl.uniformMatrix3fv(location, false, val);
            };
        case gl.FLOAT_MAT4:
            return function (val: Float32List) {
                gl.uniformMatrix4fv(location, false, val);
            };
        case gl.SAMPLER_2D:
            const ii = samplerCounter.count++;
            return function (val: WebGLTexture | Texture | null | undefined) {
                if (val instanceof Texture) {
                    val = val.glTexture;
                }
                gl.uniform1i(location, ii);
                gl.activeTexture(gl.TEXTURE0 + ii);
                gl.bindTexture(gl.TEXTURE_2D, val || null);
            };
        default:
            throw new Error(`Unimplemented setter type (uniform: ${name}, type: ${type})`);
    }
}
