import * as THREE from 'three'
import sceneVertex from './scene14Vertex.glsl'
import sceneFragment from './scene14Fragment.glsl'
import { Color } from 'three/build/three.module';

var Scene14 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        _this.Debugger = window.Utils.gui.addFolder('**14. Rainbow transition');
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
         * Render Targets
         */
        _this.RT1 = new THREE.WebGLRenderTarget(Utils.screenSize.width, Utils.screenSize.height, {
            depthBuffer: false
        });


        /**
         * Scene
         */
        _this.scene = new THREE.Scene()


        /**
         * Object
         */
        let planeSize = new THREE.Vector2(2.778, 1);
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

                uSteps: { value: 6 },
                uColor1: {value: new THREE.Color('#ff0000') },
                uColor2: {value: new THREE.Color('#00ff00') },
                uColor3: {value: new THREE.Color('#0000ff') },
                uColor4: {value: new THREE.Color('#00ffff') },
                uColor5: {value: new THREE.Color('#ff00ff') },
                uColor6: {value: new THREE.Color('#ffff00') },
            },
        });

        _this.controller.uSignal = _this.Debugger.add(material.uniforms.uSignal, 'value').min(0).max(1).step(0.00001).name('uSignal');
        ACEvents.addEventListener('AC_pause', resetSignal);

        _this.controller.uProgress = _this.Debugger.add(material.uniforms.uProgress, 'value').min(0).max(1).step(0.00001).name('uProgress');
        _this.controller.uSteps = _this.Debugger.add(material.uniforms.uSteps, 'value').min(2).max(10).step(1).name('uSteps');
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
         * Renderer helper functions
         */
        _this.activate = function() {
            _this.active = true;
            World.COMPOSITOR.material.uniforms.tMap1.value = _this.RT1.texture;
            World.COMPOSITOR.material.uniforms.tMap2.value = _this.RT1.texture;
            _this.onResize();
            Utils.resizeCallbacks.push( _this.onResize );

            Render.start( _this.update, Render.BEFORE_RENDER );
            _this.Debugger.open();
        }

        _this.deactivate = function() {
            _this.active = false;
            Render.stop( _this.update );
            Utils.resizeCallbacks.remove( _this.onResize );
            _this.Debugger.close();
        }


        /**
         * Resizing
         */
        _this.onResize = function() {
            _this.RT1.setSize(Utils.screenSize.width, Utils.screenSize.height);
        }


        /**
         * Animations
         */
        let animate = 0;
        let drumLerping = 0;
        _this.update = function() {
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

            // draw render target scene into render target
            Renderer.setRenderTarget(_this.RT1);
            Renderer.render(_this.scene, World.CAMERA);

            Renderer.setRenderTarget(null);
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





export {Scene14};