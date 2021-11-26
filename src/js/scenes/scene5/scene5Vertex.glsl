uniform float uDepth;
uniform float uStrength;
uniform float uAnimate;

varying vec2 vUv;

void main()
{
    vec3 pos = position;
    float strength = distance(uv, vec2(.5));
    strength -= mod(uAnimate, 1.);
    strength *= uStrength;

    float displacement = uDepth * strength;
    pos.z += displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv;
}