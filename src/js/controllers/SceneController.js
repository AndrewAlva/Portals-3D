var SceneController = {
    scenes: [],
    activeScene: null,
    currentID: 0,

    init: function() {
        var _this = this;

        return _this;
    },

    registerScene: async function(scene, config = {}) {
        var _this = this;
        scene.init(config);
        _this.scenes.push(scene);

        if (typeof scene.ready === 'function') await scene.ready();
    },

    registerMultipleScenes: async function(scenes) {
        var _this = this;

        let promises = [];
        scenes.forEach(scene => {
            scene.init();
            _this.scenes.push(scene);
            if (typeof scene.ready === 'function') promises.push( scene.ready() );
        });

        if (promises.length > 0) return Promise.all(promises);
    },

    activateScene: async function(scene) {
        // Switch to a specific scene
        var _this = this;

        // await _this.scenes[_this.currentID].animateOut();

        let mode = typeof scene;
        let newSceneID = (mode == 'number') ? scene : _this.scenes.indexOf(scene);
        if (newSceneID < 0 || newSceneID >= _this.scenes.length) return console.error('Scene passed has not been registered, run SceneController.registerScenes(your_scene) first');
        _this.currentID = newSceneID;
        _this.activeScene = _this.scenes[_this.currentID];
        
        RT1.scene = _this.activeScene.rt1Scene;
        RT1.enabled = true;

        if (_this.activeScene.rt2Scene) {
            RT2.scene = _this.activeScene.rt2Scene;
            RT2.enabled = true;
            RT2.cleared = false;
        } else {
            RT2.enabled = false;
        }

        // let p = _this.scenes[_this.currentID].animateIn();
        // return p;
    },

    goToNextScene: function() {
        var _this = this;

        const index = _this.currentID + 1;
        if (index >= _this.scenes.length) {
            _this.activateScene(0)
        } else {
            _this.activateScene(index)
        }
    }


}

export {SceneController};