import * as THREE from 'three'

var RenderController = {
    init: function() {
        var _this = this;

        window.Renderer = new THREE.WebGLRenderer({
            canvas: Global.CANVAS,
            antialias: true,
            // alpha: true
        })
        Renderer.setSize(Utils.screenSize.width, Utils.screenSize.height)
        Renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        _this.addHandlers();

    },

    addHandlers: function() {
        var _this = this;
        Utils.resizeCallbacks.push(_this.onResize);
    },

    onResize: function() {
        // Update Renderer
        Renderer.setSize(Utils.screenSize.width, Utils.screenSize.height)
        Renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
}

export { RenderController };