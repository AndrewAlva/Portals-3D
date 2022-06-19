var Render = {
    _render: [],
    isPaused: false,

    init: function() {
        var _this = this;
        requestAnimationFrame( _this.render.bind(_this) )
    },

    render: function() {
        var _this = this;

        for (let i = 0; i < _this._render.length; i++) {
            const callback = _this._render[i];
            if (!callback) {
                _this._render.remove(callback);
                continue;
            }

            callback();
        }

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

    start: function(callback) {
        var _this = this;
        if (!~_this._render.indexOf(callback)) _this._render.push(callback);
    },

    stop: function(callback) {
        this._render.remove(callback);
    },
}

export { Render };