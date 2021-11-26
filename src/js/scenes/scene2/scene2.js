import * as THREE from 'three'
import testVertexShader from './scene2Vertex.glsl'
import testFragmentShader from './scene2Fragment.glsl'

var Scene2 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        const scene2Debugger = window.Utils.gui.addFolder('Scene2');
        // scene2Debugger.open();
        const scene2Controller = {};


        /**
         * Scene
         */
        _this.scene = new THREE.Scene()


        /**
         * Object
         */
        const geometry = new THREE.SphereGeometry(1, 128, 128)
        const geometry2 = new THREE.SphereGeometry(5, 128, 128)
        const geometry3 = new THREE.SphereGeometry(25, 128, 128)
        const material = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            uniforms: {
                uThickness: { value: 0.9 },
                uRipples: { value: 4 },
                uAnimate: { value: 0 }
            },
        });

        scene2Controller.uThickness = scene2Debugger.add(material.uniforms.uThickness, 'value').min(0.00001).max(0.95).step(0.00001).name('uThickness');
        // midiEvents.addEventListener('K1_change', updateThickness);
        
        scene2Controller.uRipples = scene2Debugger.add(material.uniforms.uRipples, 'value').min(1).max(30).step(1).name('uRipples');


        const mesh = new THREE.Mesh(geometry, material)
        _this.scene.add(mesh)
        
        const mesh2 = new THREE.Mesh(geometry2, material)
        _this.scene.add(mesh2)
        
        const mesh3 = new THREE.Mesh(geometry3, material)
        // _this.scene.add(mesh3)


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
        _this.scene.update = function() {
            let time = Utils.elapsedTime * 1;

            let animate = time * 0.05;
            material.uniforms.uAnimate.value = animate;

            // mesh2.rotation.y = time;
        }


        /**
         * MIDI Handlers
         */
        function updateThickness(e) {
            let val = Math.range(e.velocity, 0, 127, 0.00001, 0.95);
            scene2Controller.uThickness.object.value = val;
            scene2Controller.uThickness.updateDisplay();

        }
    }
}





export {Scene2};