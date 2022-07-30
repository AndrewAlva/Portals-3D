import * as THREE from 'three'

export class SketchScene {
    constructor(_config = {}) {
        // quad
        // quad shader (post processing shader, bloom, rgb shift, etc)
        // input rt 
        // output rt

        // scene group

        // activate
            // hook up with render target available
            // _rtPool.getRT()

        // deactivate
            // return RT to the pool
            // _rtPool.putRT()


        // has its own reactor/events
            // fire the update when sceneis gonna be rendered
        

        ////////////// CURRENT SETUP
        console.log('SketchScene constructor');
        this.config = _config;
        this._preRenders = [];
        this._postRenders = [];
        this.animate = 0;
    }

    init() {
        ////////////// CURRENT SETUP
        var _this = this;

        this.initGUI(_this.config);
        // this.loadTextures()
        this.initRenderTargets();
        this.initScene();
    }

    initGUI(config) {
        var _this = this;

        _this.Debugger = window.Utils.gui.addFolder(config.sceneName || '??. Sketch Scene');
        _this.controller = {};
        _this.controller.debugger = {};

        // Scene animation speed
        _this.controller.speed = _this.controller.currentSpeed = 0.5
        _this.controller.lerpSpeed = 0.0001
        _this.speedMultiplier = 0.1;
        _this.controller.debugger.speed = _this.Debugger.add(_this.controller, 'speed').min(0).max(1).step(0.001).name('Scene speed');
        _this.controller.debugger.lerpSpeed = _this.Debugger.add(_this.controller, 'lerpSpeed').min(0.0001).max(0.015).step(0.0001).name('Scene lerp speed');
    }

    initRenderTargets() {
        var _this = this;

        _this.RT1 = new THREE.WebGLRenderTarget(
            Utils.screenSize.width, 
            Utils.screenSize.height, 
            {
                // depthBuffer: false
            }
        );
    }

    initScene() {
        var _this = this;
        _this.rt1Scene = new THREE.Scene()
    }

    activate() {
        var _this = this;

        _this.active = true;
        // Reduce dependencies across code
        // which means, avoid editing another components directly like this
        World.COMPOSITOR.material.uniforms.tMap1.value = _this.RT1.texture;
        World.COMPOSITOR.material.uniforms.tMap2.value = _this.RT1.texture;
        _this.onResize();
        Utils.resizeCallbacks.push( _this.onResize.bind(_this) );

        Render.start( _this.update.bind(_this), Render.BEFORE_RENDER );
        _this.Debugger.open();
    }

    deactivate() {
        var _this = this;

        _this.active = false;
        Render.stop( _this.update );
        Utils.resizeCallbacks.remove( _this.onResize );
        _this.Debugger.close();
    }

    onResize() {
        var _this = this;
        _this.RT1.setSize(Utils.screenSize.width, Utils.screenSize.height);
    }

    update() {
        var _this = this;
        if ( !_this.active ) return;

        _this.time = Utils.elapsedTime;

        _this.controller.currentSpeed = Math.damp(
            _this.controller.currentSpeed,
            _this.controller.speed,
            _this.controller.lerpSpeed,
            _this.time);
        _this.animate += _this.controller.currentSpeed * _this.speedMultiplier;



        /* //
            Loop of callbacks to be called
            BEFORE
            rendering the scene
        // */
        for (let i = 0; i < _this._preRenders.length; i++) {
            const callback = _this._preRenders[i];
            if (!callback) {
                _this._preRenders.remove(callback);
                continue;
            }

            callback();
        }

        _this.draw && _this.draw();


        // draw render target scene into render target
        Renderer.setRenderTarget(_this.RT1);
        Renderer.render(_this.rt1Scene, World.CAMERA);

        Renderer.setRenderTarget(null);


        /* //
            Loop of callbacks to be called 
            AFTER
            rendering the scene
        // */
        for (let i = 0; i < _this._postRenders.length; i++) {
            const callback = _this._postRenders[i];
            if (!callback) {
                _this._postRenders.remove(callback);
                continue;
            }

            callback();
        }
    }

    startRender(callback, when) {
        var _this = this;
        if (when && when == 'post') {
            if (!~_this._postRenders.indexOf(callback)) _this._postRenders.push(callback);
        } else {
            if (!~_this._preRenders.indexOf(callback)) _this._preRenders.push(callback);
        }
    }

    stopRender(callback) {
        this._preRenders.remove(callback);
        this._postRenders.remove(callback);
    }


}