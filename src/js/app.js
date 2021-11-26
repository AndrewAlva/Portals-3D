import '../css/app.css'
import './math.js'
import './utils.js'
import './events.js'

import { MIDI } from './midi.js'
import { AudioController } from './AudioController.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { SceneEx } from './scenes/sceneExample.js';
import { Scene1 } from './scenes/scene1/scene1.js';
import { Scene2 } from './scenes/scene2/scene2.js';
import { Scene3 } from './scenes/scene3/scene3.js';
import { Scene4 } from './scenes/scene4/scene4.js';
import { Scene5 } from './scenes/scene5/scene5.js';

var App = {
    init: async function() {
        var _this = this;

        window.AC = new AudioController();
        await AC.init({
            // stream: true
        });

        var midiControls = new MIDI();
        midiControls.init(_this.start);
    },

    start: function() {
        Scene1.init();
        Scene2.init();
        Scene3.init();
        Scene4.init();
        Scene5.init();

        /**
         * GUI
         */
        var globalDebugger = Utils.gui.addFolder('Global');
        globalDebugger.open();

        // Canvas
        const canvas = document.querySelector('canvas.webgl')

        // Scene Manager
        // var scene = Scene1.scene;
        // var scene = Scene2.scene;
        // var scene = Scene3.scene;
        // var scene = Scene4.scene;
        var scene = Scene5.scene;


        window.addEventListener('resize', () =>
        {
            // Update camera
            camera.aspect = Utils.sizes.width / Utils.sizes.height
            camera.updateProjectionMatrix()

            // Update renderer
            renderer.setSize(Utils.sizes.width, Utils.sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })


        /**
         * Camera
         */
        const camera = new THREE.PerspectiveCamera(75, Utils.sizes.width / Utils.sizes.height)
        camera.position.z = 2
        // scene.add(camera) // Apparently this isn't needed
        window.cam = camera;

        const frontCamera = {};
        frontCamera.quaternion = new THREE.Quaternion().copy(camera.quaternion);
        frontCamera.pos = new THREE.Vector3().copy(camera.position);
        camera.currentPosition = 'frontCamera';

        const highAngleCamera = {};
        highAngleCamera.quaternion = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(-0.1151, 0.881, 0.2778), 0.365);
        highAngleCamera.pos = new THREE.Vector3(3.9486, 3.9486, -3.9486);

        Utils.debugger.toggleCamera = function() {
            if (camera.currentPosition == 'frontCamera') {
                camera.quaternion.copy(highAngleCamera.quaternion);
                camera.position.copy(highAngleCamera.pos);
                camera.currentPosition = 'highAngleCamera';
            } else {
                camera.quaternion.copy(frontCamera.quaternion);
                camera.position.copy(frontCamera.pos);
                camera.currentPosition = 'frontCamera';
            }
        }
        // Utils.debugger.toggleCamera();

        globalDebugger.add(Utils.debugger, 'toggleCamera');
        // midiEvents.addEventListener('P1_push', Utils.debugger.toggleCamera)

        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true


        /**
         * Renderer
         */
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(Utils.sizes.width, Utils.sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


        /**
         * Animate
         */
        const clock = new THREE.Clock();

        const tick = () =>
        {
            // Utils update
            Utils.elapsedTime = clock.getElapsedTime();
                
            // Update controls
            controls.update()

            // Update audio input
            AC.analyserNode.getFloatFrequencyData(AC.frequencyData);

            //  Scene updatee
            scene.update();
                
            // Render
            renderer.render(scene, camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()
    }
}



window.onload = function() {
    window.addEventListener('click', _ => {
        App.init();
    }, {once: true});
}
 