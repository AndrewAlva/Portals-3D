import * as THREE from 'three'
import testVertexShader from './scene11Vertex.glsl'
import testFragmentShader from './scene11Fragment.glsl'

var Scene11 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        const scene11Debugger = window.Utils.gui.addFolder('11. Sphere Noise');
        // scene11Debugger.open();
        const scene11Controller = {};

        // Scene animation speed
        scene11Controller.speed = scene11Controller.currentSpeed = 0.06
        scene11Controller.lerpSpeed = 0.0001
        scene11Debugger.add(scene11Controller, 'speed').min(0).max(0.5).step(0.001).name('Scene speed');
        scene11Debugger.add(scene11Controller, 'lerpSpeed').min(0.0001).max(0.015).step(0.0001).name('Scene lerp speed');


        /**
         * Render Targets
         */
        _this.RT1 = new THREE.WebGLRenderTarget(Utils.screenSize.width, Utils.screenSize.height, {
            depthBuffer: true
        });


        /**
         * Scene
         */
        _this.scene = new THREE.Scene()


        /**
         * Object
         */
        // const geometry = new THREE.PlaneGeometry(2, 2, 300, 300)
        const geometry = new THREE.SphereGeometry(4, 600, 600)
        // const geometry = new THREE.BoxGeometry(2, 2, 2, 300, 300, 300)
        
        const material = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            // depthTest: false,
            // blending: THREE.AdditiveBlending,
            uniforms: {
                uDepth: { value: 1 },
                uNoiseScale: { value: 1 },
                uRadialBloom: { value: 0.5 },
                uAnimate: { value: 0 },
                uColor: { value: new THREE.Color('#ffffff') }
            },
        });

        scene11Controller.uDepth = scene11Debugger.add(material.uniforms.uDepth, 'value').min(-10).max(10).step(0.001).name('uDepth');
        scene11Controller.uNoiseScale = scene11Debugger.add(material.uniforms.uNoiseScale, 'value').min(0).max(1).step(0.00001).name('uNoiseScale');
        ACEvents.addEventListener('AC_pause', updateStrength);

        scene11Controller.uRadialBloom = scene11Debugger.add(material.uniforms.uRadialBloom, 'value').min(0.00001).max(1).step(0.00001).name('uRadialBloom');
        // midiEvents.addEventListener('K1_change', updateRadialBloom);
        // midiEvents.addEventListener('K2_change', updateDepth);


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
            scene11Debugger.open();
        }

        _this.deactivate = function() {
            _this.active = false;
            Render.stop( _this.update );
            Utils.resizeCallbacks.remove( _this.onResize );
            scene11Debugger.close();
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

            scene11Controller.currentSpeed = Math.damp(
                scene11Controller.currentSpeed,
                scene11Controller.speed,
                scene11Controller.lerpSpeed,
                time);
            animate += scene11Controller.currentSpeed * 0.1;
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
                scene11Controller.uNoiseScale.object.value = drumLerping;
                scene11Controller.uNoiseScale.updateDisplay();
            }

            // draw render target scene into render target
            Renderer.setRenderTarget(_this.RT1);
            Renderer.render(_this.scene, World.CAMERA);

            Renderer.setRenderTarget(null);
        }


        /**
         * MIDI Handlers
         */
        function updateDepth(e) {
            let val = Math.range(e.velocity, 0, 127, -10, 10);
            scene11Controller.uDepth.object.value = val;
            scene11Controller.uDepth.updateDisplay();

        }
        function updateRadialBloom(e) {
            let val = Math.range(e.velocity, 0, 127, 0.00001, 1);
            scene11Controller.uRadialBloom.object.value = val;
            scene11Controller.uRadialBloom.updateDisplay();

        }
        
        
        /**
         * Web Audio API Handlers
         */
        function updateStrength() {
            scene11Controller.uNoiseScale.object.value = 0.5;
            scene11Controller.uNoiseScale.updateDisplay();
        }
    }
}





export {Scene11};