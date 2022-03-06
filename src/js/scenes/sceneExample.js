import * as THREE from 'three'
import sceneVertex from './SceneExampleVertex.glsl'
import sceneFragment from './SceneExampleFragment.glsl'

var SceneEx = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        _this.Debugger = window.Utils.gui.addFolder('SceneEx');
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
        // _this.texture1 = _this.textureLoader.load('img/map1.jpg')


        /**
         * Scene
         */
        _this.scene = new THREE.Scene()


        /**
         * Object
         */
        let planeSize = new THREE.Vector2(4.778, 1);
        const geometry = new THREE.PlaneGeometry(planeSize.x, planeSize.y, 300, 300)
        
        const material = new THREE.ShaderMaterial({
            vertexShader: sceneVertex,
            fragmentShader: sceneFragment,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            // blending: THREE.AdditiveBlending,
            uniforms: {
                uSize: { value: planeSize },
                
                uProgress: { value: 0.6 },
                uSignal: { value: 0.5 },
                
                uAnimate: { value: 0 },
            },
        });

        _this.controller.uSignal = _this.Debugger.add(material.uniforms.uSignal, 'value').min(0).max(1).step(0.00001).name('uSignal');
        ACEvents.addEventListener('AC_pause', resetSignal);

        _this.controller.uProgress = _this.Debugger.add(material.uniforms.uProgress, 'value').min(0).max(1).step(0.00001).name('uProgress');
        // midiEvents.addEventListener('K1_change', updateProgress);


        const mesh = new THREE.Mesh(geometry, material)
        _this.scene.add(mesh)


        /**
         * Camera
         */
        const camera = new THREE.PerspectiveCamera(75, Utils.screenSize.width / Utils.screenSize.height)
        camera.position.z = 9
        _this.scene.add(camera)
        _this.scene.myCamera = camera;


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





export {SceneEx};