import * as dat from 'dat.gui'

(function () {
    window.Utils = {};

    window.Utils.gui = new dat.GUI();
    // dat.GUI.toggleHide();
    window.Utils.debugger = {};

    window.Utils.sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    window.addEventListener('resize', () => {
        // Update sizes
        Utils.sizes.width = window.innerWidth;
        Utils.sizes.height = window.innerHeight;
    });

}) ();