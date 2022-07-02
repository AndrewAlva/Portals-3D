import * as THREE from 'three'
import testVertexShader from './scene1Vertex.glsl'
import testFragmentShader from './scene1Fragment.glsl'

var Scene1 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        const scene1Debugger = window.Utils.gui.addFolder('u1. Tesseract ripples');
        // scene1Debugger.open();
        const scene1Controller = {};


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
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const geometry2 = new THREE.BoxGeometry(5, 5, 5)
        const geometry3 = new THREE.BoxGeometry(25, 25, 25)
        const material = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            uniforms: {
                uThickness: { value: 0.85 },
                uRipples: { value: 2 },
                uAnimate: { value: 0 }
            },
        });

        scene1Controller.uThickness = scene1Debugger.add(material.uniforms.uThickness, 'value').min(0.00001).max(0.95).step(0.00001).name('uThickness');
        // midiEvents.addEventListener('K1_change', updateThickness);
        
        scene1Controller.uRipples = scene1Debugger.add(material.uniforms.uRipples, 'value').min(1).max(30).step(1).name('uRipples');


        const mesh = new THREE.Mesh(geometry, material)
        _this.scene.add(mesh)
        
        const mesh2 = new THREE.Mesh(geometry2, material)
        _this.scene.add(mesh2)
        
        const mesh3 = new THREE.Mesh(geometry3, material)
        _this.scene.add(mesh3)


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
            scene1Debugger.open();
        }

        _this.deactivate = function() {
            _this.active = false;
            Render.stop( _this.update );
            Utils.resizeCallbacks.remove( _this.onResize );
            scene1Debugger.close();
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
        _this.update = function() {
            let time = Utils.elapsedTime * 1;

            let animate = time * 0.075;
            material.uniforms.uAnimate.value = animate;

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
            scene1Controller.uThickness.object.value = val;
            scene1Controller.uThickness.updateDisplay();

        }
    }
}





export {Scene1};