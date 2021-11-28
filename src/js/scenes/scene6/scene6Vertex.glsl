attribute float aScale;
attribute vec3 aRandomness;

uniform float uSize;
uniform float uAnimate;

varying vec3 vColor;

uniform float uSpin;
uniform float uDepth;

uniform float uStrength;


void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.);

    // Spin
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    // float angleOffset = (1. / distanceToCenter) * (uAnimate * 0.2);
    float angleOffset = (1. / distanceToCenter) * uSpin;
    float rotation = (uAnimate * 0.2);
    angle += angleOffset + rotation;

    // Apply spin
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    // Apply randomness
    modelPosition.xyz += aRandomness;
    
    // Apply height variation
    // modelPosition.y += (1. / distanceToCenter) * uDepth;
    float yJump = (10. / distanceToCenter) * uDepth;
    yJump *= uStrength;
    
    modelPosition.y += yJump;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = aScale * uSize;
    gl_PointSize *= ( 1. / - viewPosition.z );

    vColor = color;
}