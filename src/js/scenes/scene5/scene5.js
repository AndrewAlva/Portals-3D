import * as THREE from 'three'
import sceneVertexShader from './scene5Vertex.glsl'
import sceneFragmentShader from './scene5Fragment.glsl'

var Scene5 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        const scene5Debugger = window.Utils.gui.addFolder('5. Cube Ripples Vertex');
        // scene5Debugger.open();
        const scene5Controller = {};

        // Scene animation speed
        scene5Controller.speed = scene5Controller.currentSpeed = 0.005
        scene5Controller.lerpSpeed = 0.0001
        scene5Debugger.add(scene5Controller, 'speed').min(0).max(1).step(0.001).name('Scene speed');
        scene5Debugger.add(scene5Controller, 'lerpSpeed').min(0.0001).max(0.015).step(0.0001).name('Scene lerp speed');


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
        const geometry = new THREE.BoxGeometry(1, 1, 1, 100, 100, 100)
        
        const material = new THREE.ShaderMaterial({
            vertexShader: sceneVertexShader,
            fragmentShader: sceneFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uDepth: { value: -15 },
                uStrength: { value: 0 },
                uThickness: { value: 0.95 },
                uRipples: { value: 1 },
                uAnimate: { value: 0 },
                uColor: { value: new THREE.Color('#ffffff') }
            },
        });

        scene5Controller.uDepth = scene5Debugger.add(material.uniforms.uDepth, 'value').min(-15).max(15).step(0.001).name('uDepth');
        scene5Controller.uStrength = scene5Debugger.add(material.uniforms.uStrength, 'value').min(0).max(1).step(0.00001).name('uStrength');
        ACEvents.addEventListener('AC_pause', updateStrength);

        scene5Controller.uThickness = scene5Debugger.add(material.uniforms.uThickness, 'value').min(0.00001).max(0.95).step(0.00001).name('uThickness');
        // midiEvents.addEventListener('K1_change', updateThickness);
        
        scene5Controller.uRipples = scene5Debugger.add(material.uniforms.uRipples, 'value').min(1).max(10).step(1).name('uRipples');


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
            scene5Debugger.open();
        }

        _this.deactivate = function() {
            _this.active = false;
            Render.stop( _this.update );
            Utils.resizeCallbacks.remove( _this.onResize );
            scene5Debugger.close();
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

            scene5Controller.currentSpeed = Math.damp(
                scene5Controller.currentSpeed,
                scene5Controller.speed,
                scene5Controller.lerpSpeed,
                time);
            animate += scene5Controller.currentSpeed * 0.1;
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
                scene5Controller.uStrength.object.value = drumLerping;
                scene5Controller.uStrength.updateDisplay();


                // Fragment updates
                let ripples = scene5Controller.uRipples.__max * snare;
                ripples = Math.max(1, ripples);
                scene5Controller.uRipples.object.value = ripples;
                scene5Controller.uRipples.updateDisplay();
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
            scene5Controller.uThickness.object.value = val;
            scene5Controller.uThickness.updateDisplay();

        }
        
        
        /**
         * Web Audio API Handlers
         */
        function updateStrength() {
            scene5Controller.uStrength.object.value = 0;
            scene5Controller.uStrength.updateDisplay();
        }
    }
}





export {Scene5};