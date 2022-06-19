import * as dat from 'dat.gui'

(function () {
    window.Utils = {};

    //////* GUI aka. Debugger *//////
    Utils.gui = new dat.GUI();
    // dat.GUI.toggleHide();
    Utils.debugger = {};

    
    
    //////* Resizing handler setup *//////
    Utils.resizeCallbacks = [];
    function handleResize() {
        Utils.resizeCallbacks.forEach(cb => { cb() });
    }

    window.addEventListener( 'resize', debounce(handleResize, 100) );



    //////* Screen size *//////
    Utils.screenSize = {};
    Utils.PX_RATIO = window.devicePixelRatio;

    function updateWindowSize() {
        Utils.screenSize.width = window.innerWidth;
        Utils.screenSize.height = window.innerHeight;
    }
    updateWindowSize();
    Utils.resizeCallbacks.push(updateWindowSize);



    //////* Mouse/cursor handler *//////
    Utils.mouseMoveCallbacks = [];

    function handleMouseMove(e) {
        Utils.mouseMoveCallbacks.forEach(cb => { cb(e) });
    }

    window.addEventListener( 'mousemove', throttle(handleMouseMove, 10) )

    //////* Cursor *//////
    Utils.cursor = {
        screenPos: {x: window.innerWidth / 2, y: window.innerHeight / 2},
        glPos: {x: 0, y: 0}
    }

    function updateCursor(e) {
        Utils.cursor.screenPos.x = e.clientX * Utils.PX_RATIO;
        Utils.cursor.screenPos.y = e.clientY * Utils.PX_RATIO;

        Utils.cursor.glPos.x = ((e.clientX / Utils.screenSize.width) * 2)  - 1;
        Utils.cursor.glPos.y = 1 - ((e.clientY / Utils.screenSize.height) * 2);
    }

    Utils.mouseMoveCallbacks.push(updateCursor);




    //////* Miscellaneous *//////
    window.capturer = new CCapture( {
        framerate: 60,
        verbose: true,
        format: 'png',
        timeLimit: 7
    });

}) ();


window.Global = {};