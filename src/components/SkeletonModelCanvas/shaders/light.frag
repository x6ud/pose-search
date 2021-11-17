#version 300 es

precision highp float;

in vec4 v_color;
in vec3 v_normal;

uniform vec3 u_directionalLightDirection;
uniform vec4 u_color;

out vec4 outColor;

void main() {
    outColor = v_color * u_color;
    float light = (dot(v_normal, -normalize(u_directionalLightDirection)) + 1.0) * 0.5;
    outColor.rgb *= (0.5 + 0.5 * light);
}
