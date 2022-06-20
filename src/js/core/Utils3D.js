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

    Utils3D.quadVertexShader = `
        varying vec2 vUv;

        void main()
        {
            gl_Position = vec4(position, 1.0);
            vUv = uv;
        }
    `;

    Utils3D.baseCompositorFragmentShader = `
        uniform sampler2D tMap1;
        uniform sampler2D tMap2;
        uniform float uTransition;
        
        varying vec2 vUv;
        
        
        void main() {
            vec4 texture1 = texture2D(tMap1, vUv);
            vec4 texture2 = texture2D(tMap2, vUv);
        
            float transition = step(1. - uTransition, vUv.x);
        
            vec4 finalColor = mix(texture1, texture2, transition);
        
            gl_FragColor = finalColor;
        }
    `;
})();