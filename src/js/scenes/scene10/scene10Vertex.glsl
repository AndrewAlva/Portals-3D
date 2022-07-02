uniform vec2 uSize;
uniform vec2 uHover;
uniform float uAnimate;
uniform float uStrength;
uniform float uDisplacementScale;

uniform float uSignal;

varying vec2 vUv;

void main()
{
    vec3 pos = position;

    float ratio = uSize.x / uSize.y;
    vec2 squaredUv = vec2(
        uv.x,
        uv.y / ratio
    );

    vec2 squaredCenter = vec2(
        .5,
        .5 / ratio
    );
    
    vec2 squaredHover = vec2(
        uHover.x,
        uHover.y / ratio
    );

    float blackGradient = distance( squaredUv, squaredHover ) * .75;
    blackGradient = 1. - pow(blackGradient, 2. + blackGradient * blackGradient);
    blackGradient = clamp(blackGradient, 0., 10.);

    float ripples = abs( sin( (blackGradient * 10. * uSignal) + uAnimate) );

    float radialMask = 1. - distance( squaredUv, squaredHover ) * 1.05;
    radialMask = clamp(radialMask, 0., 10.);

    pos.z += ripples * radialMask * uStrength * uDisplacementScale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv;
}