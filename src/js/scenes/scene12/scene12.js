import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

const hdriURL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/empty_warehouse_01_1k.hdr';
// const hdriURL = 'https://i.imgur.com/ukoyi9f.png';

// const heightMapURL = 'https://i.imgur.com/oYS135g.jpeg';
const heightMapURL = 'https://i.imgur.com/dMYV4cf.jpeg';

const displacementMapURL = 'https://i.imgur.com/L1pqRg9.jpeg';

var Scene12 = {
    promise: Promise.create(),

    init: async function () {
        var _this = this;
        const textureLoader = new THREE.TextureLoader()

        /**
         * Render Targets
         */
        _this.RT1 = new THREE.WebGLRenderTarget(Utils.screenSize.width, Utils.screenSize.height, {
            depthBuffer: true
        });


        /**
         * Scene
         */
         _this.scene = new THREE.Scene()
         // Environment
         const envMap = await loadHDRI(hdriURL, Renderer)
            //  const envMap = await loadTexture(hdriURL)
            //  envMap.mapping = THREE.EquirectangularReflectionMapping
            //  const sun = new THREE.DirectionalLight('white', 0.1)
            //  sun.position.setScalar(3)
            //  _this.scene.add(sun)
            //  _this.scene.add(new THREE.AmbientLight('white', 0.2))

        //  this.scene.environment = this.scene.background = envMap
         this.scene.environment = envMap
         Renderer.toneMapping = THREE.ACESFilmicToneMapping
         Renderer.outputEncoding = THREE.sRGBEncoding
 
         // Load heightmap texture
         const heightMap = await loadTexture(heightMapURL)
         heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping
         const displacementMap = await loadTexture(displacementMapURL)
         displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping

         // Prevent seam introduced by THREE.LinearFilter
        heightMap.minFilter = displacementMap.minFilter = THREE.NearestFilter




        /**
          * GUI
          */
         const scene12Debugger = window.Utils.gui.addFolder('12. Magical Marble');
        //  scene12Debugger.open();
         const scene12Controller = {};
 
         // Scene animation speed
         scene12Controller.speed = scene12Controller.currentSpeed = 0.15
         scene12Controller.lerpSpeed = 0.0001
         scene12Debugger.add(scene12Controller, 'speed').min(0).max(1).step(0.001).name('Scene speed');
         scene12Debugger.add(scene12Controller, 'lerpSpeed').min(0.0001).max(0.015).step(0.0001).name('Scene lerp speed');
 
         // THREE Standard Material custom uniforms
         var materialVars = {
             uColorA: '#000000',
             uColorB: '#ff9200',
             multiplierA: 1,
             multiplierB: 1,
         };
         var materialUniforms = {
             uIterations: { value: 32 },
             uDepth: { value: 0.6 },
             uSmoothing: { value: 0.2 },
             uDisplacement: { value: 0.2 },
             uDispForceX1: { value: 1 },
             uDispForceY1: { value: 1 },
             uDispForceX2: { value: -1 },
             uDispForceY2: { value: -1 },
             uTime: { value: 0 },
             uColorA: { value: new THREE.Color(materialVars.uColorA).multiplyScalar(materialVars.multiplierA) },
             uColorB: { value: new THREE.Color(materialVars.uColorB).multiplyScalar(materialVars.multiplierB) },
             uHeightMap: { value: heightMap },
             uDisplacementMap: { value: displacementMap }
         };

        


        /**
         * Object
         */
        const geometry = new THREE.SphereGeometry(1, 64, 32)
        // const geometry = new THREE.TorusKnotGeometry(2, .7, 900, 60)
        // const geometry = new THREE.TorusGeometry(2, 1.8, 360, 36)
        // const geometry = new THREE.PlaneGeometry(2, 2, 60, 60)

        // const material = new THREE.ShaderMaterial({
        //     vertexShader: testVertexShader,
        //     fragmentShader: testFragmentShader,
        //     side: THREE.DoubleSide,
        //     transparent: true,
        //     // depthTest: false,
        //     // blending: THREE.AdditiveBlending,
        //     uniforms: {
        //         uDepth: { value: -15 },
        //         uStrength: { value: 0 },
        //         uThickness: { value: 0.5 },
        //         uRipples: { value: 1 },
        //         uAnimate: { value: 0 },
        //         uColor: { value: new THREE.Color('#ffffff') }
        //     },
        // });
        const material = new THREE.MeshStandardMaterial({
            // envMapIntensity: 10,
            side: THREE.DoubleSide
        });

        material.onBeforeCompile = shader => {
            shader.uniforms = { ...shader.uniforms, ...materialUniforms };

            /* VS */
            // Add to top of vertex shader
            shader.vertexShader = `
            varying vec3 v_pos;
            varying vec3 v_dir;
            ` + shader.vertexShader;

            // Assign values to varyings inside of main()
            shader.vertexShader = shader.vertexShader.replace(/void main\(\) {/, (match) => match + `
                v_dir = position - cameraPosition; // Points from camera to vertex
                v_pos = position;
            `);


            /* FS */
            // Add to top of fragment shader
            shader.fragmentShader = `
                #define FLIP vec2(1., -1.)

                uniform vec3 uColorA;
                uniform vec3 uColorB;
                uniform sampler2D uHeightMap;
                uniform sampler2D uDisplacementMap;
                uniform int uIterations;
                uniform float uDepth;
                uniform float uSmoothing;
                
                uniform float uDisplacement;
                uniform float uDispForceX1;
                uniform float uDispForceY1;
                uniform float uDispForceX2;
                uniform float uDispForceY2;
                uniform float uTime;
                
                varying vec3 v_pos;
                varying vec3 v_dir;
                ` + shader.fragmentShader;

            // Add above fragment shader main() so we can access common.glsl.js
            shader.fragmentShader = shader.fragmentShader.replace(/void main\(\) {/, (match) => `
                /**
                 * @param p - Point to displace
                 * @param strength - How much the map can displace the point
                 * @returns Point with scrolling displacement applied
                 */

                vec3 displacePoint(vec3 p, float strength) {
                    vec2 uv = equirectUv(normalize(p));
                    vec2 direction1 = vec2(uTime * uDispForceX1, uTime * uDispForceY1);
                    vec2 direction2 = vec2(uTime * uDispForceX2, uTime * uDispForceY2);
                    vec3 displacementA = texture(uDisplacementMap, uv + direction1).rgb; // Upright
                    vec3 displacementB = texture(uDisplacementMap, uv + direction2).rgb; // Upside down
                  
                    // Center the range to [-0.5, 0.5], note the range of their sum is [-1, 1]
                    displacementA -= 0.5;
                    displacementB -= 0.5;
                    
                    return p + strength * (displacementA + displacementB);
                }


                /**
                * @param rayOrigin - Point on sphere
                * @param rayDir - Normalized ray direction
                * @returns Diffuse RGB color
                */
                vec3 marchMarble(vec3 rayOrigin, vec3 rayDir) {
                    float perIteration = 1. / float(uIterations);
                    vec3 deltaRay = rayDir * perIteration * uDepth;

                    // Start at point of intersection and accumulate volume
                    vec3 p = rayOrigin;
                    float totalVolume = 0.;

                    for (int i=0; i<uIterations; ++i) {
                        // Read heightmap from current spherical direction of displaced ray position
                        vec3 displaced = displacePoint(p, uDisplacement);
                        vec2 uv = equirectUv(normalize(displaced));
                        float heightMapVal = texture(uHeightMap, uv - vec2(uTime, 0.)).r;

                        // Take a slice of the heightmap
                        float height = length(p); // 1 at surface, 0 at core, assuming radius = 1
                        float cutoff = 1. - float(i) * perIteration;
                        float slice = smoothstep(cutoff, cutoff + uSmoothing, heightMapVal);

                        // Accumulate the volume and advance the ray forward one step
                        totalVolume += slice * perIteration;
                        p += deltaRay;
                    }
                    return mix(uColorA, uColorB, totalVolume);
                }
            ` + match);

            shader.fragmentShader = shader.fragmentShader.replace(/vec4 diffuseColor.*;/, `
                vec3 rayDir = normalize(v_dir);
                vec3 rayOrigin = v_pos;

                vec3 rgb = marchMarble(rayOrigin, rayDir);
                vec4 diffuseColor = vec4(rgb, 1.);      
            `);



        }

        ////// Mesh Standard Material Vars
        material.roughness = 0.48
        scene12Debugger.add(material, 'roughness', 0, 1, 0.01).name('Roughness')
        material.envMapIntensity = 0.81
        scene12Controller.envMapIntensity = scene12Debugger.add(material, 'envMapIntensity', -10, 10, 0.01).name('Env Map Intensity')
        midiEvents.addEventListener('K5_change', updateEnvMap);

        scene12Controller.uIterations = scene12Debugger.add(materialUniforms.uIterations, 'value', 0, 64, 1).name('uIterations');
        scene12Controller.uDepth = scene12Debugger.add(materialUniforms.uDepth, 'value', 0, 1, 0.01).name('uDepth');
        scene12Controller.uSmoothing = scene12Debugger.add(materialUniforms.uSmoothing, 'value', 0, 1, 0.01).name('uSmoothing');
        scene12Controller.uDisplacement = scene12Debugger.add(materialUniforms.uDisplacement, 'value', -1, 1, 0.001).name('uDisplacement');
        scene12Debugger.add(materialUniforms.uDispForceX1, 'value', -1, 1, 0.001).name('uDispForce x1');
        scene12Debugger.add(materialUniforms.uDispForceX2, 'value', -1, 1, 0.001).name('uDispForce x2');
        scene12Debugger.add(materialUniforms.uDispForceY1, 'value', -1, 1, 0.001).name('uDispForce y1');
        scene12Debugger.add(materialUniforms.uDispForceY2, 'value', -1, 1, 0.001).name('uDispForce y2');
        scene12Debugger.addColor(materialVars, 'uColorA').name('In color').onChange(updateColorA);
        scene12Debugger.addColor(materialVars, 'uColorB').name('Out color').onChange(updateColorB);
        scene12Debugger.add(materialVars, 'multiplierA', -2, 2, 0.001).name('In multiplier').onChange(updateColorA);
        scene12Controller.multiplierB = scene12Debugger.add(materialVars, 'multiplierB', -2, 2, 0.001).name('Out multiplier').onChange(updateColorB);

        function updateColorA() {
            materialUniforms.uColorA.value.set(materialVars.uColorA).multiplyScalar(materialVars.multiplierA)
        }
        function updateColorB() {
            materialUniforms.uColorB.value.set(materialVars.uColorB).multiplyScalar(materialVars.multiplierB)
        }

        // scene12Controller.uDepth = scene12Debugger.add(material.uniforms.uDepth, 'value').min(-15).max(15).step(0.001).name('uDepth');
        // scene12Controller.uStrength = scene12Debugger.add(material.uniforms.uStrength, 'value').min(0).max(1).step(0.00001).name('uStrength');
        // ACEvents.addEventListener('AC_pause', updateStrength);

        // scene12Controller.uThickness = scene12Debugger.add(material.uniforms.uThickness, 'value').min(0.00001).max(0.95).step(0.00001).name('uThickness');
        // midiEvents.addEventListener('K1_change', updateThickness);

        // scene12Controller.uRipples = scene12Debugger.add(material.uniforms.uRipples, 'value').min(1).max(10).step(1).name('uRipples');


        const mesh = new THREE.Mesh(geometry, material)
        _this.scene.add(mesh)


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
            scene12Debugger.open();
        }

        _this.deactivate = function() {
            _this.active = false;
            Render.stop( _this.update );
            Utils.resizeCallbacks.remove( _this.onResize );
            scene12Debugger.close();
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
        let snareLerping = 0;

        let range1Lerped = 0;
        let range2Lerped = 0;
        let range3Lerped = 0;
        let range4Lerped = 0;
        let range5Lerped = 0;


        _this.update = function () {
            let time = Utils.elapsedTime;

            scene12Controller.currentSpeed = Math.damp(
                scene12Controller.currentSpeed,
                scene12Controller.speed,
                scene12Controller.lerpSpeed,
                time);
            animate += scene12Controller.currentSpeed * 0.0075;
            materialUniforms.uTime.value = animate;


            // Audio input
            const drum = AC.audioSignal(AC.analyserNode, AC.frequencyData, 150, 2500);
            drumLerping = Math.damp(
                drumLerping,
                drum,
                0.01,
                time
            );
            const snare = AC.audioSignal(AC.analyserNode, AC.frequencyData, 1000, 1080);
            snareLerping = Math.verlet(
                snareLerping,
                snare,
                0.1
            );

            const freqRanges = [
                0,
                1000,
                2000,
                3000,
                4000,
                5000,
                6000
            ];
            const freqSpacing = 73;

            // const range1 = AC.audioSignal(AC.analyserNode, AC.frequencyData, 0, freqSpacing);
            const range1 = AC.audioSignal(AC.analyserNode, AC.frequencyData, 0, 50);
            range1Lerped = Math.verlet(range1Lerped, range1, 0.9);
            // const range2 = AC.audioSignal(AC.analyserNode, AC.frequencyData, freqSpacing, freqSpacing*2);
            const range2 = AC.audioSignal(AC.analyserNode, AC.frequencyData, 2000, 2100);
            range2Lerped = Math.verlet(range2Lerped, range2, 0.5);
            // const range3 = AC.audioSignal(AC.analyserNode, AC.frequencyData, freqSpacing*2, freqSpacing*3);
            const range3 = AC.audioSignal(AC.analyserNode, AC.frequencyData, 150, 200);
            range3Lerped = Math.verlet(range3Lerped, range3, 0.75);
            // const range4 = AC.audioSignal(AC.analyserNode, AC.frequencyData, freqSpacing*3, freqSpacing*4);
            const range4 = AC.audioSignal(AC.analyserNode, AC.frequencyData, 600, 800);
            range4Lerped = Math.verlet(range4Lerped, range4, 0.95);
            // const range5 = AC.audioSignal(AC.analyserNode, AC.frequencyData, freqSpacing*4, freqSpacing*5);
            const range5 = AC.audioSignal(AC.analyserNode, AC.frequencyData, 0, 1000);
            range5Lerped = Math.verlet(range5Lerped, range5, 0.5);

            if (AC.state.playing) {
                // scene12Controller.uDepth.object.value = drumLerping;
                // scene12Controller.uDepth.updateDisplay();
                
                // scene12Controller.uDisplacement.object.value = Math.max(0.1, snareLerping);
                // scene12Controller.uDisplacement.updateDisplay();

                // scene12Controller.multiplierB.object.multiplierB = Math.range(snareLerping * 2, 0, 1, scene12Controller.multiplierB.__min, scene12Controller.multiplierB.__max);
                // updateColorB();
                // scene12Controller.multiplierB.updateDisplay();

                const musicIterations = Math.range(range1Lerped, 0, 1, 0, scene12Controller.uIterations.__max);
                scene12Controller.uIterations.object.value = Math.max(2, musicIterations);
                scene12Controller.uIterations.updateDisplay();

                const musicDepth = Math.range(range3Lerped, 0, 1, 0, scene12Controller.uDepth.__max);
                scene12Controller.uDepth.object.value = musicDepth;
                scene12Controller.uDepth.updateDisplay();
                
                const musicSmoothing = Math.range(range2Lerped, 0, 1, 0, scene12Controller.uSmoothing.__max);
                scene12Controller.uSmoothing.object.value = musicSmoothing;
                scene12Controller.uSmoothing.updateDisplay();
                
                const musicDisplace = Math.range(range4Lerped * 2, 0, 1, 0.01, scene12Controller.uDisplacement.__max);
                scene12Controller.uDisplacement.object.value = musicDisplace;
                scene12Controller.uDisplacement.updateDisplay();
                
                const musicMultiplierB = Math.range(range5Lerped * 1.6, 0, 1, scene12Controller.multiplierB.__max, scene12Controller.multiplierB.__min);
                scene12Controller.multiplierB.object.multiplierB = musicMultiplierB;
                updateColorB();
                scene12Controller.multiplierB.updateDisplay();
            }

            // draw render target scene into render target
            Renderer.setRenderTarget(_this.RT1);
            Renderer.render(_this.scene, World.CAMERA);

            Renderer.setRenderTarget(null);
        }


        /**
         * MIDI Handlers
         */
        function updateEnvMap(e) {
            let val = Math.range(e.velocity, 0, 127, scene12Controller.envMapIntensity.__min, scene12Controller.envMapIntensity.__max);
            scene12Controller.envMapIntensity.object.envMapIntensity = val;
            scene12Controller.envMapIntensity.updateDisplay();
        }

        function updateThickness(e) {
            let val = Math.range(e.velocity, 0, 127, 0.00001, 0.95);
            scene12Controller.uThickness.object.value = val;
            scene12Controller.uThickness.updateDisplay();

        }


        /**
         * Web Audio API Handlers
         */
        function updateStrength() {
            scene12Controller.uStrength.object.value = 0;
            scene12Controller.uStrength.updateDisplay();
        }

        /**
         * Environment map loader
         */
        function loadHDRI(url, renderer) {
            return new Promise(resolve => {
                const loader = new RGBELoader()
                const pmremGenerator = new THREE.PMREMGenerator(Renderer)
                loader.load(url, (texture) => {
                    const envMap = pmremGenerator.fromEquirectangular(texture).texture
                    texture.dispose()
                    pmremGenerator.dispose()
                    resolve(envMap)
                })
            })
        }

        /**
         * Texture loader
         */
        async function loadTexture(url) {
            return new Promise(resolve => {
                textureLoader.load(url, texture => {
                    resolve(texture)
                })
            })
        }

        _this.promise.resolve();
    },

    ready: async function() {
        return this.promise;
    }
}





export { Scene12 };