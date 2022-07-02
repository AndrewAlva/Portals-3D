import * as THREE from 'three'
import testVertexShader from './scene4Vertex.glsl'
import testFragmentShader from './scene4Fragment.glsl'

var Scene4 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        const scene4Debugger = window.Utils.gui.addFolder('4. Plane Ripples Vertex');
        // scene4Debugger.open();
        const scene4Controller = {};

        // Scene animation speed
        scene4Controller.speed = scene4Controller.currentSpeed = 0.005
        scene4Controller.lerpSpeed = 0.0001
        scene4Debugger.add(scene4Controller, 'speed').min(0).max(1).step(0.001).name('Scene speed');
        scene4Debugger.add(scene4Controller, 'lerpSpeed').min(0.0001).max(0.015).step(0.0001).name('Scene lerp speed');


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
        const geometry = new THREE.PlaneGeometry(1, 1, 300, 300)
        
        const material = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uDepth: { value: -15 },
                uStrength: { value: 0 },
                uThickness: { value: 0.5 },
                uRipples: { value: 1 },
                uAnimate: { value: 0 },
                uColor: { value: new THREE.Color('#ffffff') }
            },
        });

        scene4Controller.uDepth = scene4Debugger.add(material.uniforms.uDepth, 'value').min(-15).max(15).step(0.001).name('uDepth');
        scene4Controller.uStrength = scene4Debugger.add(material.uniforms.uStrength, 'value').min(0).max(1).step(0.00001).name('uStrength');
        ACEvents.addEventListener('AC_pause', updateStrength);

        scene4Controller.uThickness = scene4Debugger.add(material.uniforms.uThickness, 'value').min(0.00001).max(0.95).step(0.00001).name('uThickness');
        // midiEvents.addEventListener('K1_change', updateThickness);
        
        scene4Controller.uRipples = scene4Debugger.add(material.uniforms.uRipples, 'value').min(1).max(10).step(1).name('uRipples');


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
            scene4Debugger.open();
        }

        _this.deactivate = function() {
            _this.active = false;
            Render.stop( _this.update );
            Utils.resizeCallbacks.remove( _this.onResize );
            scene4Debugger.close();
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

            scene4Controller.currentSpeed = Math.damp(
                scene4Controller.currentSpeed,
                scene4Controller.speed,
                scene4Controller.lerpSpeed,
                time);
            animate += scene4Controller.currentSpeed * 0.1;
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
                scene4Controller.uStrength.object.value = drumLerping;
                scene4Controller.uStrength.updateDisplay();


                // Fragment updates
                let ripples = scene4Controller.uRipples.__max * snare;
                ripples = Math.max(1, ripples);
                scene4Controller.uRipples.object.value = ripples;
                scene4Controller.uRipples.updateDisplay();
            }

            // draw render target scene into render target
            Renderer.setRenderTarget(_this.RT1);
            Renderer.render(_this.scene, World.CAMERA);

            Renderer.setRenderTarget(null);
        }


        /**
         * MIDI Handlers
         */
        function updateThickness(e) {
            let val = Math.range(e.velocity, 0, 127, 0.00001, 0.95);
            scene4Controller.uThickness.object.value = val;
            scene4Controller.uThickness.updateDisplay();

        }
        
        
        /**
         * Web Audio API Handlers
         */
        function updateStrength() {
            scene4Controller.uStrength.object.value = 0;
            scene4Controller.uStrength.updateDisplay();
        }
    }
}





export {Scene4};