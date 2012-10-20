// set up a game environment to contain all of our variables
window.gameEnv = {
    canvas: null,
    gl: null,
    /*
     * Function: initWebGL
     * Initializes the webGL context and, if it fails, leaves us with nothing.
     * The context is stored in this.gl
     */
    initWebGL: function(canvas) {

        try {
            // Try to grab the standard context. If it fails, fallback
            // to experimental.
            this.gl = canvas.getContext("webgl") ||
                      canvas.getContext("experimental-webgl");
        }
        catch(e) {
            console.log("error!" + e);
        }

        // If we don't have a GL context, give up now
        if (!this.gl) {
            alert("Unable to initialize WebGL. Your browser may not support it.");
        }
    },

    initCanvas: function() {
        this.canvas = $("#game-canvas");
        this.initWebGL(this.canvas[0]);
        var gl = this.gl;

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
    }
}


/*
 * On ready, initialize the webGL context on the canvas. From there, color
 * in black to make sure it exists.
 */
$(document).ready(function(){
  gameEnv.initCanvas();
});

