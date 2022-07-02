import * as THREE from 'three'
import sceneVertex from './scene10Vertex.glsl'
import sceneFragment from './scene10Fragment.glsl'

var Scene10 = {
    init: function() {
        var _this = this;

        /**
         * GUI
         */
        _this.Debugger = window.Utils.gui.addFolder('**10. Gaze + Interact() Planes');
        // _this.Debugger.open();
        _this.controller = {};

        // Scene animation speed
        _this.controller.speed = _this.controller.currentSpeed = 0.4
        _this.controller.lerpSpeed = 0.01
        _this.Debugger.add(_this.controller, 'speed').min(0).max(1).step(0.001).name('Scene speed');
        _this.Debugger.add(_this.controller, 'lerpSpeed').min(0.0001).max(0.1).step(0.0001).name('Scene lerp speed');


        /**
         * Texture loader
         */
        _this.loadingManager =  new THREE.LoadingManager()
        _this.textureLoader = new THREE.TextureLoader(_this.loadingManager)
        _this.texture1 = _this.textureLoader.load('img/map2.jpg')


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

        const totalEquills = 6;
        var equillsMeshes = [];
        var equillsGroup = new THREE.Group();

        var moveAmplitude = new THREE.Vector2(3, 1);
        var glCursorLerped = new THREE.Vector2(0,0);

        // Scene animation speed
        _this.controller.groupFrictionX = 0.025;
        _this.controller.groupFrictionY = 0.015;
        _this.Debugger.add(_this.controller, 'groupFrictionX').min(0.00001).max(0.04).step(0.000001).name('Group friction X');
        _this.Debugger.add(_this.controller, 'groupFrictionY').min(0.00001).max(0.04).step(0.000001).name('Group friction Y');

        let planeSize = new THREE.Vector2(1.5, 1.5);
        const planeGeo = new THREE.PlaneGeometry(planeSize.x, planeSize.y, 300, 300)

        for (let i = 0; i < totalEquills; i++) {
            let material = createEquillMaterial();
            let equill = new THREE.Mesh(planeGeo, material)
            equill.position.x = Math.range(Math.random(), 0, 1, -3, 3)
            equill.position.y = Math.range(Math.random(), 0, 1, -2, 2)
            equill.position.z = Math.range(Math.random(), 0, 1, 0, -2)
            equill.strength = 1;

            equillsMeshes.push(equill)
            equillsGroup.add(equill)
        }

        _this.scene.add(equillsGroup);

        function createEquillMaterial({color} = {}) {
            return new THREE.ShaderMaterial({
                vertexShader: sceneVertex,
                fragmentShader: sceneFragment,
                side: THREE.FrontSide,
                transparent: true,
                depthTest: false,
                uniforms: {
                    uColor: { value: new THREE.Color( color || 0x999999 ) },
                    uSize: { value: planeSize },
                    uHover: { value: new THREE.Vector2(.5,.5) },
                    uStrength: { value: 1 },
                    uDisplacementScale: { value: 0.1 },
                    tMap1: { value: _this.texture1 },
                    
                    uProgress: { value: 0.6 },
                    uSignal: { value: 0.5 },
                    
                    uAnimate: { value: 0 },
                },
            });
        }

        _this.controller.displacementScale = .244;
        _this.Debugger.add(_this.controller, 'displacementScale').min(-1).max(1).step(0.001).name('Displacement scale').onFinishChange(updateMeshesScale);
        function updateMeshesScale() {
            equillsMeshes.forEach(equill => {
                equill.material.uniforms.uDisplacementScale.value = _this.controller.displacementScale;
            });
        }
        updateMeshesScale();

        _this.controller.signal = 1;
        _this.controller.uSignal = _this.Debugger.add(_this.controller, 'signal').min(1).max(3).step(0.01).name('Signal').onFinishChange(updateMeshesSignal);
        function updateMeshesSignal() {
            equillsMeshes.forEach(equill => {
                equill.material.uniforms.uSignal.value = _this.controller.signal;
            });
        }
        updateMeshesSignal();

        // _this.controller.uSignal = _this.Debugger.add(material.uniforms.uSignal, 'value').min(0).max(1).step(0.00001).name('uSignal');
        ACEvents.addEventListener('AC_pause', resetSignal);

        // _this.controller.uProgress = _this.Debugger.add(material.uniforms.uProgress, 'value').min(0).max(1).step(0.00001).name('uProgress');
        // midiEvents.addEventListener('K1_change', updateProgress);


        /**
         * Raycaster
         */
        const raycaster = new THREE.Raycaster()
        Utils.cursor.glPos = new THREE.Vector2(0,0);



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
        let drumLerping = 0;
        let currentIntersect = null;
        const objectsToTest = [];
        equillsMeshes.forEach(equill => {
            objectsToTest.push(equill);
        });

        _this.update = function() {
            let time = Utils.elapsedTime;

            /** Raycaster */
            raycaster.setFromCamera(
                Utils.cursor.glPos,
                World.CAMERA
            );
            const intersects = raycaster.intersectObjects(objectsToTest);


            if(intersects.length) {
                if(!currentIntersect) {
                    console.log('mouse enter')
                }

                if (currentIntersect && currentIntersect != intersects[0]) {
                    currentIntersect.object.material.uniforms.uColor.value = new THREE.Color(0xffffff)
                    currentIntersect.object.strength = 0;
                }

                currentIntersect = intersects[0]

                let mouseCenter = new THREE.Vector2(currentIntersect.uv.x, currentIntersect.uv.y)
                let center = new THREE.Vector2(currentIntersect.object.material.uniforms.uHover.value.x, currentIntersect.object.material.uniforms.uHover.value.y)
                center = Math.verletVec(center, mouseCenter, 0.15);

                
                currentIntersect.object.material.uniforms.uColor.value = new THREE.Color(0xff0000)
                currentIntersect.object.material.uniforms.uHover.value.x = center.x
                currentIntersect.object.material.uniforms.uHover.value.y = center.y
                currentIntersect.object.strength = 1;
                
            } else {
                if(currentIntersect) {
                    console.log('mouse leave')
                }
                
                equillsMeshes.forEach(equill => {
                    equill.material.uniforms.uColor.value = new THREE.Color(0xffffff);
                    equill.strength = 0;
                });
                currentIntersect = null
            }



            _this.controller.currentSpeed = Math.verlet(
                _this.controller.currentSpeed,
                _this.controller.speed,
                _this.controller.lerpSpeed
            );
            animate += _this.controller.currentSpeed * 0.1;

            equillsMeshes.forEach((mesh, index) => {
                mesh.material.uniforms.uAnimate.value = animate;
                mesh.material.uniforms.uStrength.value = Math.verlet(mesh.material.uniforms.uStrength.value, mesh.strength, 0.05);

                let hoverState = new THREE.Vector2(mesh.material.uniforms.uHover.value.x, mesh.material.uniforms.uHover.value.y)
                let center = new THREE.Vector2(.5, .5);
                hoverState = Math.verletVec(hoverState, center, 0.15);
                mesh.material.uniforms.uHover.value.x = hoverState.x;
                mesh.material.uniforms.uHover.value.y = hoverState.y;
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
                let lerpedSignal = Math.range(drumLerping, 0, 0.6, 1, 3, true);
                _this.controller.signal = lerpedSignal;
                _this.controller.uSignal.updateDisplay();
                updateMeshesSignal();
            }

            // draw render target scene into render target
            Renderer.setRenderTarget(_this.RT1);
            Renderer.render(_this.scene, World.CAMERA);

            Renderer.setRenderTarget(null);
        }


        /**
         * Event Handlers
         */
         window.addEventListener('click', () => {
            if(currentIntersect)
            {
                if( equillsMeshes.indexOf(currentIntersect.object) ) {
                    console.log('clicked on', currentIntersect.object);
                }
            }
        })

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
            _this.controller.uSignal.object.signal = 1;
            _this.controller.uSignal.updateDisplay();
            updateMeshesSignal();
        }
    }
}





export {Scene10};