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

    /*
     * On ready, initialize the webGL context on the canvas. From there, color
     * in black to make sure it exists.
     */
    $(document).ready(function(){
        self.canvas = $("#game-canvas");
        initWebGL.call(self, self.canvas[0]);

        if (self.gl) {
            console.log('GL');
            self.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            self.gl.enable(self.gl.DEPTH_TEST);
            self.gl.depthFunc(self.gl.LEQUAL);
            self.gl.clear(self.gl.COLOR_BUFFER_BIT|self.gl.DEPTH_BUFFER_BIT);
        }
        else {
            console.log('No GL');
        }
    });

}).call(window.gameEnv);
