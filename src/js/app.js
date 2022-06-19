import '../css/app.css'
import './core/helpers.js'
import './core/math.js'
import './core/Utils.js'
import './core/Utils3D.js'
import './core/events.js'
import { Render } from './core/Render'

import { MIDI } from './midi.js'
import { AudioController } from './AudioController.js'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

import { RenderController } from './controllers/RenderController'
import { SceneController } from './controllers/SceneController.js';

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
import { Scene13 } from './scenes/scene13/scene13.js';
import { Scene14 } from './scenes/scene14/scene14.js';

var App = {
    init: async function({ enableVR = false } = {}) {
        var _this = this;
        Global.events = new Reactor();
        Render.init();

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
        Global.CANVAS = document.querySelector('canvas.webgl')


        /**
         * Renderer
         */
        RenderController.init();
        

        /**
         * Scenes initializing
         */
        SceneController.init();
        await SceneController.registerMultipleScenes([
            SceneEx,
            Scene1,
            Scene2,
            Scene3,
            Scene4,
            Scene5,
            Scene6,
            Scene7,
            Scene8,
            Scene9,
            Scene10,
            Scene11,
            Scene12,
            Scene13,
            Scene14
        ]);

        SceneController.activateScene(Scene14);
        var scene = SceneController.getActiveScene();


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
        const controls = new OrbitControls(camera, Global.CANVAS)
        controls.enableDamping = true
        // controls.autoRotate = true


        // Resizing
        function onResize() {
            // Update camera
            camera.aspect = Utils.screenSize.width / Utils.screenSize.height
            camera.updateProjectionMatrix()
        };

        Utils.resizeCallbacks.push(onResize);


        /**
         * Animate
         */
        const clock = new THREE.Clock();

        const tick = (e) =>
        {
            /* PETE FEEDBACK to review */
            // Grab poses from 'e', or by 'Renderer.xr'
            // check documentation

            // Utils update
            Utils.elapsedTime = clock.getElapsedTime();
                
            // Update controls
            controls.update()

            // Update audio input
            AC.analyserNode.getFloatFrequencyData(AC.frequencyData);

            //  Scene updatee
            scene.update();

            // draw render target scene to render target
            Renderer.setRenderTarget(Scene13.RT1);
            Renderer.render(Scene13.rtScene1, camera);

            Renderer.setRenderTarget(Scene13.RT2);
            Renderer.render(Scene13.rtScene2, camera);
            Renderer.setRenderTarget(null);

            // Render
            Renderer.render(scene, camera)

            // // Call tick again on the next frame
            // if (!Renderer.xr.enabled) {
            //     window.requestAnimationFrame(tick)
            // }

            // Save frame CCapture
            capturer.capture( Global.CANVAS );
        }

        
        /**
         * Init VR
         */
        if (!enableVR) {
            Render.start(tick);
        } else {
            document.body.appendChild( VRButton.createButton( Renderer ) );
            Renderer.xr.enabled = true;
            Renderer.setAnimationLoop(tick);

            /* PETE FEEDBACK to review */
            Renderer.xr.addEventListener('sessionstart', (e) => {
                console.log(e.camera);
            });
        }

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