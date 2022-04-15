uniform float uDepth;
uniform float uNoiseScale;
uniform float uRadialBloom;
uniform float uAnimate;

varying vec2 vUv;
varying float vNoise;
varying float vMask;

float cnoise(vec2 v) {
    float t = v.x * 0.3;
    v.y *= 0.8;
    float noise = 0.0;
    float s = 0.5;
    noise += (sin(v.x * 0.9 / s + t * 10.0) + sin(v.x * 2.4 / s + t * 15.0) + sin(v.x * -3.5 / s + t * 4.0) + sin(v.x * -2.5 / s + t * 7.1)) * 0.3;
    noise += (sin(v.y * -0.3 / s + t * 18.0) + sin(v.y * 1.6 / s + t * 18.0) + sin(v.y * 2.6 / s + t * 8.0) + sin(v.y * -2.6 / s + t * 4.5)) * 0.3;
    return noise;
}

void main()
{
    vec2 centerUv = (uv - vec2(.5)) * 2.;
    vec3 pos = position;
    float speed = uAnimate * 2.015;

    vec2 freq = vec2(8., 10.) * max(uNoiseScale * 2., .3);
    float noisePush = cnoise( centerUv*freq + vec2(uAnimate * .5, -uAnimate * 5.15) );
    noisePush -= cnoise( uv*vec2(4., 5.) - vec2(uAnimate * .9, -uAnimate * 1.05) ) * .8;

    float gradientMask = pow(length(centerUv) + uRadialBloom, 2.);
    // noisePush *= gradientMask;

    // pos.y += noisePush * .25;
    pos.z += noisePush * (sin(uAnimate * 10.) * .1 + .3) * uDepth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    vUv = uv;
    vNoise = noisePush;
    vMask = gradientMask;
}