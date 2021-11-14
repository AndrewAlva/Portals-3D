Math.map = Math.range = function(value, oldMin = -1, oldMax = 1, newMin = 0, newMax = 1, isClamp) {
    const newValue = (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
    if (isClamp) return Math.clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax));
    return newValue;
};

Math.damp = function (a, b, lambda, dt) {
    return Math.lerp(a, b, 1 - Math.exp(-lambda * dt));
}

Math.lerp = function(v0, v1, t) {
    return v0*(1-t)+v1*t
}