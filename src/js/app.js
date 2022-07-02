import '../css/app.css'
import './core/helpers.js'
import './core/math.js'
import './core/Utils.js'
import './core/Utils3D.js'
import './core/events.js'
import './core/World.js'
import './core/Render'
import './controllers/RenderController';

import { MIDI } from './midi.js'
import { AudioController } from './AudioController.js'

import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

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
        World.init();
        Render.init();
        RenderController.init({enableVR});

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
         * Scenes initializing
         */
        SceneController.init();

        /* Tools scenes */
        await SceneController.registerMultipleScenes([
            SceneEx,
            Scene8,
            Scene9,
            Scene10
        ]);

        /* Unfinished scenes (not audio hooked) */
        await SceneController.registerMultipleScenes([
            Scene1,
            Scene2,
            Scene3
        ]);

        /* Visual scenes */
        await SceneController.registerMultipleScenes([
            Scene4,
            Scene5,
            Scene6,
            Scene7,
            Scene11,
            Scene12,
            Scene13,
            Scene14
        ]);

        SceneController.activateScene(Scene14);
        window.SC = SceneController;

        /**
         * Animate
         */

        const tick = (e) =>
        {
            /* PETE FEEDBACK to review */
            // Grab poses from 'e', or by 'Renderer.xr'
            // check documentation


            // Update audio input
            AC.analyserNode.getFloatFrequencyData(AC.frequencyData);


            //////////////////////
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