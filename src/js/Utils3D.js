import { BufferGeometry, BufferAttribute } from 'three/build/three.module.js'

(function () {
    window.Utils3D = {};

    Utils3D.getQuad = function() {
        let geometry = new BufferGeometry();
        let position = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
        let uv = new Float32Array([0, 0, 2, 0, 0, 2]);
        geometry.setAttribute('position', new BufferAttribute(position, 3));
        geometry.setAttribute('uv', new BufferAttribute(uv, 2));

        return geometry;
    }
})();