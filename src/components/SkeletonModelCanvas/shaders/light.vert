#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec4 a_color;

uniform mat4 u_pvMatrix;
uniform mat4 u_mMatrix;

out vec4 v_color;
out vec3 v_normal;

void main() {
    gl_Position = u_pvMatrix * u_mMatrix * vec4(a_position, 1.0);
    v_color = a_color;
    v_normal = transpose(inverse(mat3(u_mMatrix))) * normalize(a_normal);
}
