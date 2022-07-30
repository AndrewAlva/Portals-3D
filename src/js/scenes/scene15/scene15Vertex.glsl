uniform float uAnimate;
varying vec2 vUv;

void main()
{
    vUv = uv;
    vec3 pos = position;
    pos.x += sin((vUv.y + uAnimate * 0.01) * 50.);
    pos.z += cos((vUv.y + uAnimate * 0.01) * 50.);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}