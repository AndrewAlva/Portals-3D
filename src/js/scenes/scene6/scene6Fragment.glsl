uniform float uBright;

uniform float uThickness;
uniform float uAnimate;

varying vec3 vColor;

void main() {
    vec2 uv = gl_PointCoord;

    // // Disc
    // float circle = distance( gl_PointCoord, vec2(0.5) );
    // float strength = 1. - step(.5, circle);

    // // Diffused disc
    // float circle = distance( gl_PointCoord, vec2(0.5) );
    // circle *= 2.;
    // float strength = 1. - circle;

    // Light point pattern
    float circle = distance( gl_PointCoord, vec2(0.5) );
    circle = 1. - circle;
    float strength = pow(circle, 10. / uBright);

    // Final color
    // vec3 color = vColor * strength;
    vec3 color = mix(vec3(0.), vColor, strength);

    gl_FragColor = vec4(color, 1.);
}