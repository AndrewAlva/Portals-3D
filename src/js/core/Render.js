import * as THREE from 'three'

window.Render = {
    _render: [],
    _beforeRender: [],
    isPaused: false,
    clock: null,
    BEFORE_RENDER: 'Render.BEFORE_RENDER',

    init: function() {
        var _this = this;
        _this.initClock();
        requestAnimationFrame( _this.render.bind(_this) )
    },


    initClock: function() {
        this.clock = new THREE.Clock();
    },

    render: function() {
        var _this = this;

        for (let i = 0; i < _this._beforeRender.length; i++) {
            const callback = _this._beforeRender[i];
            if (!callback) {
                _this._beforeRender.remove(callback);
                continue;
            }

            callback();
        }

        for (let i = 0; i < _this._render.length; i++) {
            const callback = _this._render[i];
            if (!callback) {
                _this._render.remove(callback);
                continue;
            }

            callback();
        }

        Utils.elapsedTime = _this.clock.getElapsedTime();

        if (!_this.isPaused) requestAnimationFrame( _this.render.bind(_this) );
    },

    pause: function() {
        this.isPaused = true;
    },

    resume: function() {
        var _this = this;

        if (!_this.isPaused) return;
        _this.isPaused = false;
        requestAnimationFrame( _this.render.bind(_this) )
    },

    start: function(callback, when) {
        var _this = this;
        if (when && when == _this.BEFORE_RENDER) {
            if (!~_this._beforeRender.indexOf(callback)) _this._beforeRender.push(callback);
        } else {
            if (!~_this._render.indexOf(callback)) _this._render.push(callback);
        }
    },

    stop: function(callback) {
        this._render.remove(callback);
        this._beforeRender.remove(callback);
    },
}