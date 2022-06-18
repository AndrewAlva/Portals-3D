import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import sceneVertex from './scene13Vertex.glsl'
import sceneFragment from './scene13Fragment.glsl'

import rt1Vertex from './rt1Vertex.glsl'
import rt1Fragment from './rt1Fragment.glsl'
import rt2Vertex from './rt2Vertex.glsl'
import rt2Fragment from './rt2Fragment.glsl'

var Scene13 = {
    init: function() {
        var _this = this;

        // Canvas
        const canvas = document.querySelector('canvas.webgl')

        /**
         * GUI
         */
        _this.Debugger = window.Utils.gui.addFolder('13. Render Target logic');
        // _this.Debugger.open();
        _this.controller = {};

        // Scene animation speed
        _this.controller.speed = _this.controller.currentSpeed = 0.5
        _this.controller.lerpSpeed = 0.0001
        _this.Debugger.add(_this.controller, 'speed').min(0).max(1).step(0.001).name('Scene speed');
        _this.Debugger.add(_this.controller, 'lerpSpeed').min(0.0001).max(0.015).step(0.0001).name('Scene lerp speed');


        /**
         * Texture loader
         */
        _this.loadingManager =  new THREE.LoadingManager()
        _this.textureLoader = new THREE.TextureLoader(_this.loadingManager)
        _this.texture1 = _this.textureLoader.load('_assets/uv.jpg')

        
        /**
         * Render Targets
         */
        var rtWidth = Utils.screenSize.width;
        var rtHeight = Utils.screenSize.height;
        _this.RT1 = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
            depthBuffer: false
        });
        _this.RT2 = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
            depthBuffer: false
        });

        _this.rtScene1 = new THREE.Scene();
        _this.rtScene2 = new THREE.Scene();

        // const rtGeom1 = new THREE.PlaneGeometry(2, 0.5, 300, 300)
        const rtGeom1 = new THREE.TorusKnotGeometry(2, .7, 900, 60)
    
        const rtMaterial1 = new THREE.ShaderMaterial({
            vertexShader: rt1Vertex,
            fragmentShader: rt1Fragment,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uSize: { value: new THREE.Vector2(2, 0.5) },
                
                uProgress: { value: 0.6 },
                uSignal: { value: 0.5 },
                
                uAnimate: { value: 0 },
            },
        });
        const rtMaterial2 = new THREE.ShaderMaterial({
            vertexShader: rt2Vertex,
            fragmentShader: rt2Fragment,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uSize: { value: new THREE.Vector2(2, 0.5) },
                
                uSignal: { value: 1 },
                uProgress: { value: 1 },
                
                uAnimate: { value: 0 },
            },
        });

        const rtMesh1 = new THREE.Mesh(rtGeom1, rtMaterial1)
        const rtMesh2 = new THREE.Mesh(rtGeom1, rtMaterial2)

        _this.rtScene1.add(rtMesh1)
        _this.rtScene2.add(rtMesh2)

        _this.controller.uSignal = _this.Debugger.add(rtMaterial1.uniforms.uSignal, 'value').min(0).max(1).step(0.00001).name('uSignal');
        ACEvents.addEventListener('AC_pause', resetSignal);

        _this.controller.uProgress = _this.Debugger.add(rtMaterial1.uniforms.uProgress, 'value').min(0).max(1).step(0.00001).name('uProgress');
        // midiEvents.addEventListener('K1_change', updateProgress);



        /**
         * Scene
         */
        _this.scene = new THREE.Scene()


        /**
         * Objects
         */
        const geometry = Utils3D.getQuad();
        
        const material = new THREE.ShaderMaterial({
            vertexShader: sceneVertex,
            fragmentShader: sceneFragment,
            transparent: true,
            depthTest: false,
            // blending: THREE.AdditiveBlending,
            uniforms: {
                tMap1: { value: _this.RT1.texture },
                tMap2: { value: _this.RT2.texture },
                uAnimate: { value: 0 },
            },
        });

        const mesh = new THREE.Mesh(geometry, material)
        _this.scene.add(mesh)


        /**
         * Resizing
         */
        function handleResize() {
        }

        Utils.resizeCallbacks.push(handleResize);


        /**
         * Animations
         */
        let animate = 0;
        let drumLerping = 0;
        _this.scene.update = function() {
            let time = Utils.elapsedTime;

            _this.controller.currentSpeed = Math.damp(
                _this.controller.currentSpeed,
                _this.controller.speed,
                _this.controller.lerpSpeed,
                time);
            animate += _this.controller.currentSpeed * 0.1;
            material.uniforms.uAnimate.value = animate;
            rtMaterial1.uniforms.uAnimate.value = animate;
            rtMaterial2.uniforms.uAnimate.value = animate;

            
            // Audio input
            const drum = AC.audioSignal(AC.analyserNode, AC.frequencyData, 150, 2500);
            drumLerping = Math.damp(
                drumLerping,
                drum,
                0.01,
                time
            );
            
            if (AC.state.playing) {
                // Vertex updates
                
                // Fragment updates
                _this.controller.uSignal.object.value = drumLerping;
                _this.controller.uSignal.updateDisplay();
            }
        }


        /**
         * MIDI Handlers
         */
        function updateProgress(e) {
            let val = Math.range(e.velocity, 0, 127, 0.00001, 0.95);
            _this.controller.uProgress.object.value = val;
            _this.controller.uProgress.updateDisplay();

        }
        
        
        /**
         * Web Audio API Handlers
         */
        function resetSignal() {
            _this.controller.uSignal.object.value = 0;
            _this.controller.uSignal.updateDisplay();
        }
    }
}





export {Scene13};