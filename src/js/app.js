import '../css/app.css'
import './utils.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { scene1 } from './scene1.js';

/**
 * GUI
 */
var globalDebugger = window.Utils.gui.addFolder('Global');
globalDebugger.open();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene Manager
var scene = scene1;


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
camera.position.z = 3
// scene.add(camera) // Apparently this isn't needed

const frontCamera = {};
frontCamera.quaternion = new THREE.Quaternion().copy(camera.quaternion);
frontCamera.pos = new THREE.Vector3().copy(camera.position);
camera.currentPosition = 'frontCamera';

const highAngleCamera = {};
highAngleCamera.quaternion = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(0.3608, -0.1314, 0.8675), 0.3161);
highAngleCamera.pos = new THREE.Vector3(1.6286, 1.9301, -1.6192);

window.Utils.debugger.toggleCamera = function() {
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

globalDebugger.add(window.Utils.debugger, 'toggleCamera');

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

//  Scene updatee
scene.update();
    
// Render
renderer.render(scene, camera)

// Call tick again on the next frame
window.requestAnimationFrame(tick)
}

tick()
 