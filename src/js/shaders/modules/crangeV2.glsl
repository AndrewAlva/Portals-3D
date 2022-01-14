vec2 crangeV2(vec2 oldValue, vec2 oldMin, vec2 oldMax, vec2 newMin, vec2 newMax) {
    return clamp(range(oldValue, oldMin, oldMax, newMin, newMax), min(newMin, newMax), max(newMin, newMax));
}

#pragma glslify: export(crangeV2);