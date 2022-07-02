import * as THREE from 'three'
import sceneVertexShader from './scene7Vertex.glsl'
import sceneFragmentShader from './scene7Fragment.glsl'

var galaxyGeometry = null;
var galaxyMaterial = null;
var galaxyPoints = null;

const generateGalaxy = () => {
    if (galaxyPoints !== null) {
        
        Scene7.Debugger.remove(Scene7.controller.uBright);

        Scene7.Debugger.remove(Scene7.controller.uDepth);
        Scene7.Debugger.remove(Scene7.controller.uStrength);

        galaxyGeometry.dispose();
        galaxyMaterial.dispose();
        Scene7.scene.remove(galaxyPoints);
    }

    const parameters = Scene7.controller.galaxy;

    // Geometry
    galaxyGeometry = new THREE.BufferGeometry()

    // Vertex data for geometry
    const positions = new Float32Array(parameters.count * 3);
    const randomness = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count);
    const particleIndex = new Float32Array(parameters.count);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * parameters.radius;
        positions[i3    ] = radius; // x
        positions[i3 + 1] = 0; // y
        positions[i3 + 2] = radius; // z

        // Randomness
        const randomX = Math.pow( Math.random(), parameters.randomnessPower ) * ( radius * parameters.randomness) * ( Math.random() < 0.5 ? 1 : -1 );
        const randomY = Math.pow( Math.random(), parameters.randomnessPower ) * ( radius * parameters.randomness) * ( Math.random() < 0.5 ? 1 : -1 );
        const randomZ = Math.pow( Math.random(), parameters.randomnessPower ) * ( radius * parameters.randomness) * ( Math.random() < 0.5 ? 1 : -1 );
        randomness[i3    ] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

        // Colors
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)
        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scale
        scales[i] = Math.random();
        
        // Index in array
        particleIndex[i] = i;
    }

    galaxyGeometry.setAttribute( 'position', new THREE.BufferAttribute(positions, 3) );
    galaxyGeometry.setAttribute( 'aRandomness', new THREE.BufferAttribute(randomness, 3) );
    galaxyGeometry.setAttribute( 'color', new THREE.BufferAttribute(colors, 3) );
    galaxyGeometry.setAttribute( 'aScale', new THREE.BufferAttribute(scales, 1) );
    galaxyGeometry.setAttribute( 'aIndex', new THREE.BufferAttribute(particleIndex, 1) );


    // Setup Material
    galaxyMaterial = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: sceneVertexShader,
        fragmentShader: sceneFragmentShader,
        uniforms: {
            uTotal: { value: parameters.count },
            uSize: { value: parameters.size * Renderer.getPixelRatio() },
            uSides: { value: parameters.sides },
            uAnimate: { value: 0 },

            uBright: { value: Scene7.controller.uBright?.object.value || 1.12 },

            uDepth: { value: Scene7.controller.uDepth?.object.value || 0.031 },
            uStrength: { value: Scene7.controller.uStrength?.object.value || 1 },
        }
    });

    Scene7.controller.uBright = Scene7.Debugger.add(galaxyMaterial.uniforms.uBright, 'value').min(0.3).max(1.5).step(0.00001).name('uBright');

    Scene7.controller.uDepth = Scene7.Debugger.add(galaxyMaterial.uniforms.uDepth, 'value').min(-20).max(20).step(0.00001).name('uDepth');
    Scene7.controller.uStrength = Scene7.Debugger.add(galaxyMaterial.uniforms.uStrength, 'value').min(0).max(1).step(0.00001).name('uStrength');


    // Combine geometry & material into a 3D object
    galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
    Scene7.scene.add(galaxyPoints);
}



var Scene7 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        _this.Debugger = window.Utils.gui.addFolder('7. Galaxy Vortex to Square');
        // _this.Debugger.open();
        _this.controller = {};

        // Scene animation speed
        _this.controller.speed = _this.controller.currentSpeed = 0.15
        _this.controller.lerpSpeed = 0.015
        _this.controller.accelStrength = 5.55
        _this.controller.accelLerp = 0.005
        _this.Debugger.add(_this.controller, 'speed').min(0).max(5).step(0.001).name('Scene speed');
        _this.Debugger.add(_this.controller, 'lerpSpeed').min(0.0001).max(0.015).step(0.0001).name('Scene lerp speed');
        _this.Debugger.add(_this.controller, 'accelStrength').min(0).max(10).step(0.0001).name('Scene accel strength');
        _this.Debugger.add(_this.controller, 'accelLerp').min(0.0001).max(0.015).step(0.0001).name('Scene accel lerp');

        // Galaxy params
        _this.controller.galaxy = {
            count: 357500,
            size: 65,
            radius: 6.05,
            sides: 4,
            randomness: 3,
            randomnessPower: 1,
            insideColor: '#750000',
            outsideColor: '#ffffff',
        }
        _this.Debugger.add(_this.controller.galaxy, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
        _this.Debugger.add(_this.controller.galaxy, 'size').min(5).max(100).step(1).onFinishChange(generateGalaxy)
        _this.Debugger.add(_this.controller.galaxy, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
        _this.Debugger.add(_this.controller.galaxy, 'sides').min(3).max(20).step(1).onFinishChange(generateGalaxy)
        _this.Debugger.add(_this.controller.galaxy, 'randomness').min(0).max(3).step(0.001).onFinishChange(generateGalaxy)
        _this.Debugger.add(_this.controller.galaxy, 'randomnessPower').min(1).max(20).step(0.001).onFinishChange(generateGalaxy)
        _this.Debugger.addColor(_this.controller.galaxy, 'insideColor').onFinishChange(generateGalaxy)
        _this.Debugger.addColor(_this.controller.galaxy, 'outsideColor').onFinishChange(generateGalaxy)


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
        generateGalaxy();
        
        
        /**
         * Listeners
         * (MIDI, AudioAPI, etc.)
         */
        ACEvents.addEventListener('AC_pause', updateStrength);
        


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
            _this.Debugger.open();
        }

        _this.deactivate = function() {
            _this.active = false;
            Render.stop( _this.update );
            Utils.resizeCallbacks.remove( _this.onResize );
            _this.Debugger.close();
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
        let animate = 0;
        let basslineLerped = 0;
        let drumLerping = 0;

        _this.update = function() {
            let time = Utils.elapsedTime;
            
            // Audio input
            var bassline = AC.audioSignal(AC.analyserNode, AC.frequencyData, 20, 80);
            bassline = Math.range(bassline, 0.7, 1, 0, 1, true);
            basslineLerped = Math.damp(
                basslineLerped,
                bassline,
                _this.controller.accelLerp,
                time
            );
            window.bassline = basslineLerped;
            
            const drum = AC.audioSignal(AC.analyserNode, AC.frequencyData, 100, 250);
            drumLerping = Math.damp(
                drumLerping,
                drum,
                0.0015,
                time
            );
            const accordion = AC.audioSignal(AC.analyserNode, AC.frequencyData, 4000, 12000);
            
            if (AC.state.playing) {
                // Vertex updates


                // Fragment updates
                let bright = Math.range(accordion, 0., 0.8, _this.controller.uBright.__min, _this.controller.uBright.__max, true);
                _this.controller.uBright.object.value = bright;
                _this.controller.uBright.updateDisplay();
                
                _this.controller.uStrength.object.value = accordion;
                _this.controller.uStrength.updateDisplay();
            }

            // Scene speed
            // and acceleration
            let accelPower = basslineLerped * _this.controller.accelStrength;
            let speedAccelerated = _this.controller.speed + accelPower;
            _this.controller.currentSpeed = Math.damp(
                _this.controller.currentSpeed,
                speedAccelerated,
                _this.controller.lerpSpeed,
                time);
            animate += _this.controller.currentSpeed * 0.1;
            galaxyMaterial.uniforms.uAnimate.value = animate;

            // draw render target scene into render target
            Renderer.setRenderTarget(_this.RT1);
            Renderer.render(_this.scene, World.CAMERA);

            Renderer.setRenderTarget(null);
        }
        
        
        /**
         * Web Audio API Handlers
         */
        function updateStrength() {
            _this.controller.uStrength.object.value = 0;
            _this.controller.uStrength.updateDisplay();
        }
    }
}





export {Scene7};