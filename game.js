// set up a game environment to contain all of our variables
window.gameEnv = {};
// contain all work in a function scope, using this keyword to access
// window.gameEnv and anything attached to it
(function() {
    /*
     * Function: initWebGL
     * Initializes the webGL context and, if it fails, leaves us with nothing.
     * The context is stored in gl
     */
    function initWebGL(canvas) {
        //Initialize the global variable gl to null.
        gl = null;

        try {
            // Try to grab the standard context. If it fails, fallback
            // to experimental.
            gl = canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl");
        }
        catch(e) {
            console.log("error!" + e);
        }

        // If we don't have a GL context, give up now
        if (!gl) {
            alert("Unable to initialize WebGL. Your browser may not support it.");
        }
    }

    /*
     * On ready, initialize the webGL context on the canvas. From there, color
     * in black to make sure it exists.
     */
    $(document).ready(function(){
        this.canvas = $("#game-canvas");
        initWebGL(this.canvas[0]);

        console.log("Created " + gl);

        if (gl) {
            console.log('GL');
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        }
        else {
            console.log('No GL');
        }
    });

}).call(window.gameEnv);
