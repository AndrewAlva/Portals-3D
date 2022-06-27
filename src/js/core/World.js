import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

window.World = {
    SCENE: null,
    CAMERA: null,
    CANVAS: null,
    COMPOSITOR: null, // Quad mesh receiving RTs to display
    CONTROLS: null,
    DEBUGGER: null,

    init: function() {
        this.initGUI();
        this.initSetup();
    },

    initGUI: function() {
        this.DEBUGGER = Utils.gui.addFolder('Global');
        this.DEBUGGER.open();
    },

    initSetup: function() {
        var _this = this;
        _this.CANVAS = document.querySelector('canvas.webgl')
        _this.SCENE = new THREE.Scene();
        _this.setupCamera();


    },


    /**
     * Camera
     */
    setupCamera: function() {
        var _this = this;

        _this.CAMERA = new THREE.PerspectiveCamera(75, Utils.screenSize.width / Utils.screenSize.height)
        _this.CAMERA.position.z = 2

        const frontCamera = {};
        frontCamera.quaternion = new THREE.Quaternion().copy(_this.CAMERA.quaternion);
        frontCamera.pos = new THREE.Vector3().copy(_this.CAMERA.position);
        _this.CAMERA.currentPosition = 'frontCamera';

        const highAngleCamera = {};
        highAngleCamera.quaternion = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(-0.1151, 0.881, 0.2778), 0.365);
        highAngleCamera.pos = new THREE.Vector3(3.9486, 3.9486, -3.9486);

        Utils.debugger.toggleCamera = function() {
            if (_this.CAMERA.currentPosition == 'frontCamera') {
                _this.CAMERA.quaternion.copy(highAngleCamera.quaternion);
                _this.CAMERA.position.copy(highAngleCamera.pos);
                _this.CAMERA.currentPosition = 'highAngleCamera';
            } else {
                _this.CAMERA.quaternion.copy(frontCamera.quaternion);
                _this.CAMERA.position.copy(frontCamera.pos);
                _this.CAMERA.currentPosition = 'frontCamera';
            }
        }
        // Utils.debugger.toggleCamera();

        _this.DEBUGGER.add(Utils.debugger, 'toggleCamera');
        // midiEvents.addEventListener('P1_push', Utils.debugger.toggleCamera)


        // Controls
        _this.CONTROLS = new OrbitControls(_this.CAMERA, _this.CANVAS)
        _this.CONTROLS.enableDamping = true
        // controls.autoRotate = true


        // Resizing
        function onResizeCamera() {
            // Update camera
            _this.CAMERA.aspect = Utils.screenSize.width / Utils.screenSize.height
            _this.CAMERA.updateProjectionMatrix()
        };

        Utils.resizeCallbacks.push(onResizeCamera);
    },
}