// set up a game environment to contain all of our variables
window.gameEnv = {};
// contain all work in a function scope, using this keyword to access
// window.gameEnv and anything attached to it
(function() {
    var self = this;
    /*
     * Function: initWebGL
     * Initializes the webGL context and, if it fails, leaves us with nothing.
     * The context is stored in this.gl
     */
    function initWebGL(canvas) {
        //Initialize the global variable this.gl to null.
        this.gl = null;

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
    }

    function initCanvas() {
        this.canvas = $("#game-canvas");
        initWebGL.call(this, self.canvas[0]);

        if (self.gl) {
            console.log('GL');
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthFunc(this.gl.LEQUAL);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
        }
        else {
            console.log('No GL');
        }
    }

    /*
     * On ready, initialize the webGL context on the canvas. From there, color
     * in black to make sure it exists.
     */
    $(document).ready(function(){
      initCanvas.call(self);
    });

}).call(window.gameEnv);
