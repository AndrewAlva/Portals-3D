import * as THREE from 'three'
import sceneVertex from './scene10Vertex.glsl'
import sceneFragment from './scene10Fragment.glsl'

var Scene10 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        _this.Debugger = window.Utils.gui.addFolder('Scene10');
        _this.Debugger.open();
        _this.controller = {};

        // Scene animation speed
        _this.controller.speed = _this.controller.currentSpeed = 0.05
        _this.controller.lerpSpeed = 0.01
        _this.Debugger.add(_this.controller, 'speed').min(0).max(1).step(0.001).name('Scene speed');
        _this.Debugger.add(_this.controller, 'lerpSpeed').min(0.0001).max(0.1).step(0.0001).name('Scene lerp speed');


        /**
         * Texture loader
         */
        _this.loadingManager =  new THREE.LoadingManager()
        _this.textureLoader = new THREE.TextureLoader(_this.loadingManager)
        // _this.texture1 = _this.textureLoader.load('img/map1.jpg')


        /**
         * Scene
         */
        _this.scene = new THREE.Scene()


        /**
         * Object
         */

        const totalEquills = 9;
        var equillsMeshes = [];
        var equillsGroup = new THREE.Group();

        var moveAmplitude = new THREE.Vector2(3, 1);
        var moveLerp = new THREE.Vector2(0,0);
        var glCursorLerped = new THREE.Vector2(0,0);

        // Scene animation speed
        _this.controller.groupFrictionX = 0.025;
        _this.controller.groupFrictionY = 0.015;
        _this.Debugger.add(_this.controller, 'groupFrictionX').min(0.00001).max(0.04).step(0.000001).name('Group friction X');
        _this.Debugger.add(_this.controller, 'groupFrictionY').min(0.00001).max(0.04).step(0.000001).name('Group friction Y');

        let planeSize = new THREE.Vector2(.4, .4);
        const planeGeo = new THREE.PlaneGeometry(planeSize.x, planeSize.y, 300, 300)

        for (let i = 0; i < totalEquills; i++) {
            let material = createEquillMaterial();
            let equill = new THREE.Mesh(planeGeo, material)
            equill.position.x = Math.range(Math.random(), 0, 1, -3, 3)
            equill.position.y = Math.range(Math.random(), 0, 1, -2, 2)
            equill.position.z = Math.range(Math.random(), 0, 1, 0, -2)

            equillsMeshes.push(equill)
            equillsGroup.add(equill)
        }

        _this.scene.add(equillsGroup);
        console.log(equillsGroup);

        function createEquillMaterial({color} = {}) {
            return new THREE.ShaderMaterial({
                vertexShader: sceneVertex,
                fragmentShader: sceneFragment,
                side: THREE.DoubleSide,
                transparent: true,
                depthTest: false,
                uniforms: {
                    uColor: { value: new THREE.Color( color || 0x999999 ) },
                    uSize: { value: planeSize },
                    
                    uProgress: { value: 0.6 },
                    uSignal: { value: 0.5 },
                    
                    uAnimate: { value: 0 },
                },
            });
        }

        // _this.controller.uSignal = _this.Debugger.add(material.uniforms.uSignal, 'value').min(0).max(1).step(0.00001).name('uSignal');
        // ACEvents.addEventListener('AC_pause', resetSignal);

        // _this.controller.uProgress = _this.Debugger.add(material.uniforms.uProgress, 'value').min(0).max(1).step(0.00001).name('uProgress');
        // midiEvents.addEventListener('K1_change', updateProgress);


        /**
         * Camera
         */
        const camera = new THREE.PerspectiveCamera(75, Utils.screenSize.width / Utils.screenSize.height)
        camera.position.z = 9
        _this.scene.add(camera)
        _this.scene.myCamera = camera;


        /**
         * Animations
         */
        let animate = 0;
        let drumLerping = 0;
        _this.scene.update = function() {
            let time = Utils.elapsedTime;

            _this.controller.currentSpeed = Math.verlet(
                _this.controller.currentSpeed,
                _this.controller.speed,
                _this.controller.lerpSpeed
            );
            animate += _this.controller.currentSpeed * 0.1;

            equillsMeshes.forEach((mesh, index) => {
                mesh.material.uniforms.uAnimate.value = animate;
                // mesh.position.y += 0.01 * (index * 0.01);
                // if (mesh.position.y > 3) mesh.position.y = -3 
            });


            ////* Group position update *////
            glCursorLerped.x = Math.verlet(glCursorLerped.x, Utils.cursor.glPos.x, _this.controller.groupFrictionX);
            glCursorLerped.y = Math.verlet(glCursorLerped.y, Utils.cursor.glPos.y, _this.controller.groupFrictionY);
            
            equillsGroup.position.x = glCursorLerped.x * moveAmplitude.x * -1;
            equillsGroup.position.y = glCursorLerped.y * moveAmplitude.y * -1;

            
            // Audio input
            const drum = AC.audioSignal(AC.analyserNode, AC.frequencyData, 150, 2500);
            drumLerping = Math.verlet(
                drumLerping,
                drum,
                0.01
            );
            
            if (AC.state.playing) {
                // Vertex updates
                
                // Fragment updates
                _this.controller.uSignal.object.value = drumLerping;
                _this.controller.uSignal.updateDisplay();
            }
        }


        /**
         * MIDI Handlers
         */
        function updateProgress(e) {
            let val = Math.range(e.velocity, 0, 127, 0.00001, 0.95);
            _this.controller.uProgress.object.value = val;
            _this.controller.uProgress.updateDisplay();

        }
        
        
        /**
         * Web Audio API Handlers
         */
        function resetSignal() {
            _this.controller.uSignal.object.value = 0;
            _this.controller.uSignal.updateDisplay();
        }
    }
}





export {Scene10};