import '../css/app.css'
import './math.js'
import './utils.js'
import './events.js'

import { MIDI } from './midi.js'
import { AudioController } from './AudioController.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

import { SceneEx } from './scenes/sceneExample.js';
import { Scene1 } from './scenes/scene1/scene1.js';
import { Scene2 } from './scenes/scene2/scene2.js';
import { Scene3 } from './scenes/scene3/scene3.js';
import { Scene4 } from './scenes/scene4/scene4.js';
import { Scene5 } from './scenes/scene5/scene5.js';
import { Scene6 } from './scenes/scene6/scene6.js';
import { Scene7 } from './scenes/scene7/scene7.js';
import { Scene8 } from './scenes/scene8/scene8.js';
import { Scene9 } from './scenes/scene9/scene9.js';
import { Scene10 } from './scenes/scene10/scene10.js';
import { Scene11 } from './scenes/scene11/scene11.js';
import { Scene12 } from './scenes/scene12/scene12.js';

var App = {
    init: async function({ enableVR = false } = {}) {
        var _this = this;

        window.AC = new AudioController();
        await AC.init({
            // stream: true
        });

        let midiControls = new MIDI();
        let midiPromise = midiControls.init();
        midiPromise.finally(_ => {
            _this.start({enableVR});
        })
    },

    start: async function({enableVR}) {
        /**
         * GUI
         */
        var globalDebugger = Utils.gui.addFolder('Global');
        globalDebugger.open();

        // Canvas
        const canvas = document.querySelector('canvas.webgl')


        /**
         * Renderer
         */
        window.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            // alpha: true
        })
        renderer.setSize(Utils.screenSize.width, Utils.screenSize.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        

        /**
         * Scenes initializing
         */
        SceneEx.init();
        Scene1.init();
        Scene2.init();
        Scene3.init();
        Scene4.init();
        Scene5.init();
        Scene6.init();
        Scene7.init();
        Scene8.init();
        Scene9.init();
        Scene10.init();
        Scene11.init();
        await Scene12.init();

        // Scene Manager
        // var scene = SceneEx.scene;
        // var scene = Scene1.scene;
        // var scene = Scene2.scene;
        // var scene = Scene3.scene;
        // var scene = Scene4.scene;
        // var scene = Scene5.scene;
        // var scene = Scene6.scene;
        // var scene = Scene7.scene;
        // var scene = Scene8.scene;
        // var scene = Scene9.scene;
        // var scene = Scene10.scene;
        // var scene = Scene11.scene;
        var scene = Scene12.scene;


        /**
         * Camera
         */
        const camera = new THREE.PerspectiveCamera(75, Utils.screenSize.width / Utils.screenSize.height)
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
        // controls.autoRotate = true


        // Resizing
        function onResize() {
            // Update camera
            camera.aspect = Utils.screenSize.width / Utils.screenSize.height
            camera.updateProjectionMatrix()

            // Update renderer
            renderer.setSize(Utils.screenSize.width, Utils.screenSize.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        };

        Utils.resizeCallbacks.push(onResize);


        /**
         * Animate
         */
        const clock = new THREE.Clock();

        const tick = (e) =>
        {
            /* PETE FEEDBACK to review */
            // Grab poses from 'e', or by 'window.renderer.xr'
            // check documentation

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
            if (!renderer.xr.enabled) {
                window.requestAnimationFrame(tick)
            }

            // Save frame CCapture
            capturer.capture( canvas );
        }

        
        /**
         * Init VR
         */
        if (enableVR) {
            document.body.appendChild( VRButton.createButton( window.renderer ) );
            window.renderer.xr.enabled = true;
            window.renderer.setAnimationLoop(tick);

            /* PETE FEEDBACK to review */
            window.renderer.xr.addEventListener('sessionstart', (e) => {
                console.log(e.camera);
            });
        }

        tick();
    },
}



window.onload = function() {
    window.addEventListener('click', _ => {
        App.init({
            enableVR: false
        });
    }, {once: true});
}


// chrome flags: xr mode