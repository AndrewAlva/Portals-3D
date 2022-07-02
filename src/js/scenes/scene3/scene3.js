import * as THREE from 'three'
import testVertexShader from './scene3Vertex.glsl'
import testFragmentShader from './scene3Fragment.glsl'

var Scene3 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        const scene3Debugger = window.Utils.gui.addFolder('u3. RGB Tesseract Ripples');
        // scene3Debugger.open();
        const scene3Controller = {};


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
        const geometry2 = new THREE.BoxGeometry(1.1, 1.1, 1.1)
        const geometry3 = new THREE.BoxGeometry(1.2, 1.2, 1.2)
        
        const material = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uThickness: { value: 0.85 },
                uRipples: { value: 3 },
                uAnimate: { value: 0 },
                uColor: { value: new THREE.Color('#ff0000') }
            },
        });
        const material2 = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uThickness: { value: 0.85 },
                uRipples: { value: 3 },
                uAnimate: { value: 0 },
                uColor: { value: new THREE.Color('#00ff00') }
            },
        });
        const material3 = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uThickness: { value: 0.85 },
                uRipples: { value: 3 },
                uAnimate: { value: 0 },
                uColor: { value: new THREE.Color('#0000ff') }
            },
        });

        scene3Controller.uThickness = scene3Debugger.add(material.uniforms.uThickness, 'value').min(0.00001).max(0.95).step(0.00001).name('uThickness');
        // midiEvents.addEventListener('K1_change', updateThickness);
        
        scene3Controller.uRipples = scene3Debugger.add(material.uniforms.uRipples, 'value').min(1).max(30).step(1).name('uRipples');


        const mesh = new THREE.Mesh(geometry, material)
        const meshB = mesh.clone()
        const meshC = mesh.clone()
        meshB.scale.set(5, 5, 5)
        meshC.scale.set(25, 25, 25)
        _this.scene.add(mesh)
        _this.scene.add(meshB)
        _this.scene.add(meshC)
        
        const mesh2 = new THREE.Mesh(geometry2, material2)
        const mesh2B = mesh2.clone()
        const mesh2C = mesh2.clone()
        mesh2B.scale.set(5, 5, 5)
        mesh2C.scale.set(25, 25, 25)
        _this.scene.add(mesh2)
        _this.scene.add(mesh2B)
        _this.scene.add(mesh2C)
        
        const mesh3 = new THREE.Mesh(geometry3, material3)
        const mesh3B = mesh3.clone()
        const mesh3C = mesh3.clone()
        mesh3B.scale.set(5, 5, 5)
        mesh3C.scale.set(25, 25, 25)
        _this.scene.add(mesh3)
        _this.scene.add(mesh3B)
        _this.scene.add(mesh3C)


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
            scene3Debugger.open();
        }

        _this.deactivate = function() {
            _this.active = false;
            Render.stop( _this.update );
            Utils.resizeCallbacks.remove( _this.onResize );
            scene3Debugger.close();
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

            let animate = time * 0.045;
            material.uniforms.uAnimate.value = animate;
            material2.uniforms.uAnimate.value = animate;
            material3.uniforms.uAnimate.value = animate;

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
            scene3Controller.uThickness.object.value = val;
            scene3Controller.uThickness.updateDisplay();

        }
    }
}





export {Scene3};