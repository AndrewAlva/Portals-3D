import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

window.RenderController = {
    init: function({enableVR}) {
        var _this = this;

        _this.initRenderer();
        _this.initCompositor();
        _this.initRTPool();

        _this.addHandlers();
        Render.start( _this.loop );
    },

    initRenderer: function() {
        window.Renderer = new THREE.WebGLRenderer({
            canvas: World.CANVAS,
            antialias: true,
            // alpha: true
        })
        Renderer.setSize(Utils.screenSize.width, Utils.screenSize.height)
        Renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    },

    initCompositor: function() {
        const material = new THREE.ShaderMaterial({
            vertexShader: Utils3D.quadVertexShader,
            fragmentShader: Utils3D.baseCompositorFragmentShader,
            transparent: true,
            depthTest: false,
            // blending: THREE.AdditiveBlending,
            uniforms: {
                tMap1: { value: null },
                tMap2: { value: null },
                uTransition: { value: 0.5 },
            },
        });

        World.DEBUGGER.add(material.uniforms.uTransition, 'value').min(0).max(1).step(0.00001).name('uTransition');

        World.COMPOSITOR = new THREE.Mesh(Utils3D.getQuad(), material)
        World.SCENE.add(World.COMPOSITOR)
    },

    initRTPool: function() {
        // Create rtPool to handle RT of scenes and 
        // reduce dependencies across code

        // get
        // put
        // resize?
    },



    /*/////// Event handlers ///////*/
    addHandlers: function() {
        var _this = this;
        Utils.resizeCallbacks.push(_this.onResize);
    },

    onResize: function() {
        // Update Renderer
        Renderer.setSize(Utils.screenSize.width, Utils.screenSize.height)
        Renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    },

    loop: function() {
        // Update controls
        World.CONTROLS.update();
        
        // Render
        Renderer.render(World.SCENE, World.CAMERA);
    }
}
