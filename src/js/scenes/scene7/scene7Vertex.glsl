#define PI 3.1415926538
#define PI2 6.2831853076

attribute float aIndex;
attribute float aScale;
attribute vec3 aRandomness;

uniform float uTotal;
uniform float uSize;
uniform float uSides;
uniform float uAnimate;

varying vec3 vColor;

uniform float uDepth;

uniform float uStrength;


float geomRadius(float theta, float n) {
    return cos(PI / n) / cos( theta - (PI2 / n) * floor( (n * theta + PI) / PI2) );
}


void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.);

    // Get radius range
    float distanceToCenter = length(modelPosition.xz);

    // Polygon sides
    float vertexCount = uSides;
    
    float angle = (PI2 / uTotal) * aIndex;
    float polygonRadius = geomRadius(angle, vertexCount);

        // New global spinning
        float rotation = (uAnimate * 0.175);
        angle += rotation;

    modelPosition.x = sin(angle) * distanceToCenter * polygonRadius;
    modelPosition.z = cos(angle) * distanceToCenter * polygonRadius;

    // Apply randomness
    vec3 intervalRandomness = max(0.01, sin(uAnimate * 0.7)) * aRandomness;
    modelPosition.xyz += intervalRandomness;
    
    // Apply height variation
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