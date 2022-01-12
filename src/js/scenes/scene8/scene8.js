import * as THREE from 'three'
import testVertexShader from './scene8Vertex.glsl'
import testFragmentShader from './scene8Fragment.glsl'

var Scene8 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        _this.Debugger = window.Utils.gui.addFolder('Scene8');
        _this.Debugger.open();
        _this.controller = {};

        // Scene animation speed
        _this.controller.speed = _this.controller.currentSpeed = 0.005
        _this.controller.lerpSpeed = 0.0001
        _this.Debugger.add(_this.controller, 'speed').min(0).max(1).step(0.001).name('Scene speed');
        _this.Debugger.add(_this.controller, 'lerpSpeed').min(0.0001).max(0.015).step(0.0001).name('Scene lerp speed');


        /**
         * Texture loader
         */
        _this.loadingManager =  new THREE.LoadingManager()
        _this.textureLoader = new THREE.TextureLoader(_this.loadingManager)
        _this.texture1 = _this.textureLoader.load('/img/map1.jpg')
        _this.texture2 = _this.textureLoader.load('/img/map2.jpg')


        /**
         * Scene
         */
        _this.scene = new THREE.Scene()


        /**
         * Object
         */
        const geometry = new THREE.PlaneGeometry(1, 1, 300, 300)
        
        const material = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                tMap1: { value: _this.texture1 },
                tMap2: { value: _this.texture2 },
                uMixer: { value: 0.5 },

                uAnimate: { value: 0 },

                uProgress: { value: 0 },
            },
        });

        _this.controller.uMixer = _this.Debugger.add(material.uniforms.uMixer, 'value').min(0).max(1).step(0.00001).name('uMixer');
        ACEvents.addEventListener('AC_pause', updateMixer);

        _this.controller.uProgress = _this.Debugger.add(material.uniforms.uProgress, 'value').min(0).max(1).step(0.00001).name('uProgress');
        // midiEvents.addEventListener('K1_change', updateProgress);


        const mesh = new THREE.Mesh(geometry, material)
        _this.scene.add(mesh)


        /**
         * Camera
         */
        const camera = new THREE.PerspectiveCamera(75, Utils.sizes.width / Utils.sizes.height)
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
            const snare = AC.audioSignal(AC.analyserNode, AC.frequencyData, 1000, 1080);
            
            if (AC.state.playing) {
                // Vertex updates
                
                // Fragment updates
                _this.controller.uMixer.object.value = drumLerping;
                _this.controller.uMixer.updateDisplay();
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
        function updateMixer() {
            _this.controller.uMixer.object.value = 0;
            _this.controller.uMixer.updateDisplay();
        }
    }
}





export {Scene8};