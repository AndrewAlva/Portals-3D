uniform vec2 uSize;

uniform float uProgress;
uniform float uSignal;
uniform float uSteps;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;

uniform float uAnimate;

varying vec2 vUv;

#pragma glslify: rangeF = require('../../shaders/modules/rangeF.glsl')


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

    //////// Ripples
    float rippleScale = uSignal * 100.;

    float circle = distance( squaredUv, squaredCenter );
    float ripples = abs( sin( (circle * rippleScale) + uAnimate) );
    float blackGradient = uSignal * .75 - distance( squaredUv, squaredCenter ) * .5;
    ripples = clamp(ripples - blackGradient, 0., 1.);


    vec3 color = vec3(ripples);
    float alpha = 1.;

    ///////// Example Textures
    vec4 ripplesTexture = vec4(color, alpha);
    vec4 secondTexture = vec4(0., 0., 1., 1.);

    //////// Stairs mask
    float steps = uSteps;

    vec2 ivUv = vUv * 10.;
    float iDist = (1. / steps) * 10.; // 1.666667
    float stepId = floor(ivUv.x / iDist); // 0, 1, 2, 3, 4, 5
    float stepIdMult = stepId + 1.; // 1, 2, 3, 4, 5, 6

    float barStrength = stepIdMult * uProgress;
    float vertStrength = barStrength * (vUv.y + uProgress);
    
    float stairsMask = step(1., vertStrength);

    ////////// Rainbow bars
    vec3 rainbowTexture = mix(uColor1, uColor2, stepId); // 0,1
    rainbowTexture = mix(rainbowTexture, uColor3, stepId - 1.); // 1,2
    rainbowTexture = mix(rainbowTexture, uColor4, stepId - 2.);
    rainbowTexture = mix(rainbowTexture, uColor5, stepId - 3.);
    rainbowTexture = mix(rainbowTexture, uColor6, stepId - 4.);

    ////////// Transition mask bars
    float stepIdInverted = steps - stepIdMult;
    float yDirection = 1. - vUv.y;
    float heightRange = .5;
    float horizontalStepping = (1. / (steps - 1.)) / 2.; // .1

    float heightStrength = yDirection * heightRange;
    float barGradient = heightStrength + (horizontalStepping * stepIdInverted);

    vec3 transitionBars = vec3(barGradient);
    float transitionBarsMask = step(barGradient, uProgress);


    // vec4 finalColor = mix(ripplesTexture, vec4(rainbowTexture, 1.), stairsMask);
    vec4 finalColor = mix(ripplesTexture, vec4(rainbowTexture, 1.), transitionBarsMask);


    gl_FragColor = finalColor;
    // gl_FragColor = vec4(transitionBars, 1.);
}