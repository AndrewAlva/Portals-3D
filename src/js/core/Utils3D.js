import * as THREE from 'three'
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

    Utils3D.basicVertexShader = `
        varying vec2 vUv;

        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
    `;

    Utils3D.basicColorFragmentShader = `
        uniform vec3 uColor;
        uniform float uAlpha;
        varying vec2 vUv;
        void main() {
            float strength = smoothstep(0.15, 0.5, distance( vUv, vec2(.5) ));
            gl_FragColor = vec4(vec3(strength), uAlpha);
        }
    `;
    
    Utils3D.basicTextureFragmentShader = `
        uniform sampler2D tMap;
        uniform float uAlpha;
        varying vec2 vUv;
        void main() {
            vec4 texture = texture2D(tMap, vUv);
            gl_FragColor = vec4(texture.rgb, uAlpha);
        }
    `;

    Utils3D.getTestShaderMaterial = function( _type = 'image', _config = {} ) {
        let material;
        let fragment;
        let uniforms = {
            uAlpha: { value: _config.uAlpha || 1 }
        };

        if (_type == 'image') {
            let loadingManager =  new THREE.LoadingManager()
            let textureLoader = new THREE.TextureLoader(loadingManager)
            let texture1 = textureLoader.load('_assets/uv.jpg')

            uniforms.tMap = { value: texture1 };
            fragment = Utils3D.basicTextureFragmentShader;
            
        } else {
            uniforms.uColor = { value: new THREE.Color(_config.uColor || '#ffffff') };
            fragment = Utils3D.basicColorFragmentShader;
        }

        material = new THREE.ShaderMaterial({
            vertexShader: Utils3D.basicVertexShader,
            fragmentShader: fragment,
            side: _config.side || THREE.FrontSide,
            transparent: _config.transparent || false,
            depthTest: _config.depthTest || true,
            blending: _config.blending, /* i.e. THREE.AdditiveBlending */
            uniforms
        });

        return material;
    }

})();