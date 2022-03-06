import * as dat from 'dat.gui'

window.debounce = function(fn, delay) {
    let timerId;
    return function(...args) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    }
}

window.throttle = function(fn, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = (new Date).getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn(...args);
    }
}

(function () {
    window.Utils = {};

    //////* GUI aka. Debugger *//////
    Utils.gui = new dat.GUI();
    // dat.GUI.toggleHide();
    Utils.debugger = {};

    Utils.resizeCallbacks = [];



    //////* Resizing setup *//////
    function handleResize() {
        Utils.resizeCallbacks.forEach(cb => { cb() });
    }

    window.addEventListener( 'resize', debounce(handleResize, 100) );



    //////* Screen size *//////
    Utils.screenSize = {};

    function updateWindowSize() {
        Utils.screenSize.width = window.innerWidth;
        Utils.screenSize.height = window.innerHeight;
    }
    updateWindowSize();
    Utils.resizeCallbacks.push(updateWindowSize);



    //////* Miscellaneous *//////
    window.capturer = new CCapture( {
        framerate: 60,
        verbose: true,
        format: 'png',
        timeLimit: 7
    });

}) ();