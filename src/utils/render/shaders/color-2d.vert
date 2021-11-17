#version 300 es

precision mediump float;

in vec4 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
    v_color = a_color;
    gl_Position = a_position;
}
