Math.map = Math.range = function(value, oldMin = -1, oldMax = 1, newMin = 0, newMax = 1, isClamp) {
    const newValue = (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
    if (isClamp) return Math.clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax));
    return newValue;
}

Math.clamp = function(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

Math.damp = function (a, b, lambda, dt) {
    return Math.lerp(a, b, 1 - Math.exp(-lambda * dt));
}

Math.lerp = function(v0, v1, t) {
    return v0*(1-t)+v1*t
}

Math.verlet = function(originalValue, finalValue, friction) {
    return originalValue + ( (finalValue - originalValue) * friction )
}

Math.verletVec = function(vec1, vec2, friction) {
    return vec1.add( vec2.sub(vec1).multiplyScalar(friction) )
}