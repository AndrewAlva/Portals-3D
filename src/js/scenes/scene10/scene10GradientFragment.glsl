uniform vec3 uColor;
uniform vec2 uSize;
uniform vec2 uHover;
uniform float uStrength;
uniform sampler2D tMap1;

uniform float uProgress;
uniform float uSignal;

uniform float uAnimate;

varying vec2 vUv;

#pragma glslify: rangeF = require('../../shaders/modules/rangeF.glsl')
#pragma glslify: roundedBorder = require('../../shaders/modules/roundedBorder.glsl')


void main() {
    float ratio = uSize.x / uSize.y;
    vec2 squaredUv = vec2(
        vUv.x,
        vUv.y / ratio
    );

    vec2 squaredCenter = vec2(
        .5,
        .5 / ratio
    );
    
    vec2 squaredHover = vec2(
        uHover.x,
        uHover.y / ratio
    );

    vec4 tex1 = texture2D(tMap1, vUv);

    float blackGradient = distance( squaredUv, squaredHover ) * .75;
    blackGradient = 1. - pow(blackGradient, 2. + blackGradient * blackGradient);
    blackGradient = clamp(blackGradient, 0., 10.);

    float ripples = abs( sin( (blackGradient * 10.) + uAnimate) );

    float radialMask = 1. - distance( squaredUv, squaredHover ) * 1.05;
    radialMask = clamp(radialMask, 0., 10.);
    
    vec3 colorRipples = vec3(ripples * radialMask);
    colorRipples *= uColor;

    //// Start border calculation
    float borderWidth = 0.01;
	float borderStep = .5 - borderWidth;
	vec2 borderAspectRatio = vec2(.5 - (borderWidth*ratio), borderStep);

	float borderX = step(borderAspectRatio.x, abs(squaredUv.y - 0.5) );
	float borderY = step(borderAspectRatio.y, abs(squaredUv.x - 0.5) );
	float border = borderX + borderY;
    border *= uStrength;

    vec3 color = tex1.rgb;
    color += border;
    color /= colorRipples;
    gl_FragColor = vec4(colorRipples, 1.);
}