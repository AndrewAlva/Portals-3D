import * as THREE from 'three'
import testVertexShader from './sceneExampleVertex.glsl'
import testFragmentShader from './sceneExampleFragment.glsl'

var SceneEx = {
    init: function() {
        var _this = this;
        _this.start();
    },

    start: function() {
        var _this = this;

        /**
         * GUI
         */
        const sceneExDebugger = window.Utils.gui.addFolder('Scene 1');
        sceneExDebugger.open();
        const sceneExController = {};


        /**
         * Scene
         */
        _this.scene = new THREE.Scene()


        /**
         * Object
         */
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const geometry2 = new THREE.BoxGeometry(5, 5, 5)
        const material = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            uniforms: {
                uRadius: { value: 0.45 },
                uAlpha: { value: 0.8 },
            },
        });

        sceneExController.uRadius = sceneExDebugger.add(material.uniforms.uRadius, 'value').min(0.0001).max(0.45).step(0.0001).name('uRadius');
        // midiEvents.addEventListener('K1_change', updateRadius);


        const mesh = new THREE.Mesh(geometry, material)
        const mesh2 = new THREE.Mesh(geometry2, material)
        _this.scene.add(mesh)
        _this.scene.add(mesh2)


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
            let alpha = Math.abs( Math.sin(time) );

            material.uniforms.uAlpha.value = alpha;
        }


        /**
         * MIDI Handlers
         */
        function updateRadius(e) {
            let val = Math.range(e.velocity, 0, 127, 0.0001, 0.45);
            sceneExController.uRadius.object.value = val;
            sceneExController.uRadius.updateDisplay();

        }
    }
}





export {SceneEx};