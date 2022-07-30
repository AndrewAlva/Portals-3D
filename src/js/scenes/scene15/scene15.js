import * as THREE from 'three'
import sceneVertex from './scene15Vertex.glsl'
import sceneFragment from './scene15Fragment.glsl'
import { SketchScene } from '../SketchScene.js'
import { Line3D } from '../../modules/Line3D.js'

class Sketch extends SketchScene {
    constructor( _config = {} ) {
        super(_config);
        this.drumLerping = 0;
        console.log('Scene15 constructor');
    }

    init() {
        super.init();
        this.setup();
    }

    setup() {
        var _this = this;
        _this.helpers = {
            bassline: 0,
        };

        _this.speedMultiplier = 0.3; /* Scene speed */
        _this.controller.lerpSpeed = 0.015
        _this.controller.debugger.lerpSpeed.updateDisplay();

        _this.controller.accelStrength = 5.5
        _this.controller.accelLerp = 0.005
        _this.Debugger.add(_this.controller, 'accelStrength').min(0).max(10).step(0.0001).name('Scene accel strength');
        _this.Debugger.add(_this.controller, 'accelLerp').min(0.0001).max(0.015).step(0.0001).name('Scene accel lerp');

        let planeSize = new THREE.Vector2(.05, 1);
        const geometry = new THREE.PlaneGeometry(planeSize.x, planeSize.y, 300, 300)
        
        _this.material = new THREE.ShaderMaterial({
            vertexShader: sceneVertex,
            fragmentShader: sceneFragment,
            side: THREE.DoubleSide,
            // transparent: true,
            // depthTest: false,
            // blending: THREE.AdditiveBlending,
            uniforms: {
                uSize: { value: planeSize },
                
                uProgress: { value: 0.6 },
                uSignal: { value: 0.5 },
                
                uAnimate: { value: 0 },
            },
        });

        _this.controller.uSignal = _this.Debugger.add(_this.material.uniforms.uSignal, 'value').min(0).max(1).step(0.00001).name('uSignal');
        ACEvents.addEventListener( 'AC_pause', _this.resetSignal.bind(_this) );

        _this.controller.uProgress = _this.Debugger.add(_this.material.uniforms.uProgress, 'value').min(0).max(1).step(0.00001).name('uProgress');
        midiEvents.addEventListener( 'K1_change', _this.updateProgress.bind(_this) );


        // const mesh = new THREE.Mesh(geometry, _this.material)
        // _this.rt1Scene.add(mesh)
        
        // const mesh2 = new THREE.Mesh(geometry, _this.material)
        // mesh2.rotation.y = Math.PI/2;
        // _this.rt1Scene.add(mesh2)
        
        const line1 = new Line3D({material: _this.material, height: 10, radius: 0.01,  segments: 360});
        _this.rt1Scene.add(line1._mesh)

        

        // _this.startRender( _this.sceneUpdate.bind(_this) )
    }

    draw() {
        var _this = this;
        
        // _this.material.uniforms.uAnimate.value = _this.animate; /* Sketch exclusive */
        
        // Audio input
        var basslineInput = AC.audioSignal(AC.analyserNode, AC.frequencyData, 20, 80);
        basslineInput = Math.range(basslineInput, 0.7, 1, 0, 1, true);
        var basslineLerped = Math.damp(
            _this.helpers.bassline,
            basslineInput,
            _this.controller.accelLerp,
            _this.time
        );
        _this.helpers.bassline = basslineLerped;


        const drum = AC.audioSignal(AC.analyserNode, AC.frequencyData, 150, 2500);
        _this.drumLerping = Math.damp(
            _this.drumLerping,
            drum,
            0.01,
            _this.time
        );

        // Scene speed
        // and acceleration
        let accelPower = _this.helpers.bassline * _this.controller.accelStrength;
        let speedAccelerated = _this.controller.speed + accelPower;
        _this.controller.currentSpeed = Math.damp(
            _this.controller.currentSpeed,
            speedAccelerated,
            _this.controller.lerpSpeed,
            _this.time);
        /*
            TODO:
            Add rotation to shaders, similar to the acceleration to _this.animate below
        */
        _this.animate += _this.controller.currentSpeed * 0.1;
        _this.material.uniforms.uAnimate.value = _this.animate;

        
        if (AC.state.playing) {
            // Vertex updates
            
            // Fragment updates
            _this.controller.uSignal.object.value = _this.drumLerping;
            _this.controller.uSignal.updateDisplay();
        }

        window.expose = {
            bassline: _this.helpers.bassline,
            nSpeed: _this.controller.speed,
            animate: _this.animate,
            speed: _this.controller.currentSpeed,
            accelPower,
            speedAccelerated
        }
    }

    /**
     * MIDI Handlers
     */
    updateProgress(e) {
        var _this = this;
        let val = Math.range(e.velocity, 0, 127, 0.00001, 0.95);
        _this.controller.uProgress.object.value = val;
        _this.controller.uProgress.updateDisplay();
    }
    
    
    /**
     * Web Audio API Handlers
     */
    resetSignal() {
        var _this = this;
        if ( !_this.active ) return;

        _this.controller.uSignal.object.value = 0;
        _this.controller.uSignal.updateDisplay();
    }
}

var Scene15 = new Sketch({sceneName: '15. Lines scene'});
export {Scene15};