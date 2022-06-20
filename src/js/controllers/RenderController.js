import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

window.RenderController = {
    init: function({enableVR}) {
        var _this = this;

        _this.initRenderer();
        _this.initRenderTargets();
        _this.initCompositor();

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

    initRenderTargets: function() {
        /*
            THREE has a WebGLRenderTarget by default, which is the final
            output to the user screen, here we're creating another 2 as a
            buffer space to render things, save them as a texture and get it
            back to your scene (probably useful for ping-pong technique).

            To use them, you'll need to pass them to Render rAF and
            manually pass your scenes into it like this:
                Renderer.setRenderTarget(window.RT1);
                Renderer.render(SceneEx.scene, camera);

            where SceneEx.scene is a "new THREE.Scene()".
        */
        window.RT1 = new THREE.WebGLRenderTarget(Utils.screenSize.width, Utils.screenSize.height, {
            depthBuffer: false
        });
        window.RT2 = new THREE.WebGLRenderTarget(Utils.screenSize.width, Utils.screenSize.height, {
            depthBuffer: false
        });
    },

    initCompositor: function() {
        const material = new THREE.ShaderMaterial({
            vertexShader: Utils3D.quadVertexShader,
            fragmentShader: Utils3D.baseCompositorFragmentShader,
            transparent: true,
            depthTest: false,
            // blending: THREE.AdditiveBlending,
            uniforms: {
                tMap1: { value: RT1.texture },
                tMap2: { value: RT2.texture },
                uTransition: { value: 0.5 },
            },
        });

        World.DEBUGGER.add(material.uniforms.uTransition, 'value').min(0).max(1).step(0.00001).name('uTransition');

        World.COMPOSITOR = new THREE.Mesh(Utils3D.getQuad(), material)
        World.SCENE.add(World.COMPOSITOR)
    },

    addHandlers: function() {
        var _this = this;
        Utils.resizeCallbacks.push(_this.onResize);
    },

    onResize: function() {
        // Update Renderer
        Renderer.setSize(Utils.screenSize.width, Utils.screenSize.height)
        Renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // Update render targets
        RT1.setSize(Utils.screenSize.width, Utils.screenSize.height);
        if (RT2.enabled) RT2.setSize(Utils.screenSize.width, Utils.screenSize.height);
    },

    loop: function() {
        // Update controls
        World.CONTROLS.update();

        // draw render target scene into render target
        if (RT1.enabled) {
            RT1.scene.update();
            Renderer.setRenderTarget(RT1);
            Renderer.render(RT1.scene, World.CAMERA);
        }

        if (RT2.enabled) {
            Renderer.setRenderTarget(RT2);
            Renderer.render(RT2.scene, World.CAMERA);
        } else if (!RT2.cleared) {
            Renderer.setRenderTarget(RT2);
            Renderer.clear();
            RT2.cleared = true;
        }
        
        // Render
        Renderer.setRenderTarget(null);
        Renderer.render(World.SCENE, World.CAMERA);
    }
}
