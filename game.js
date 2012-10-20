// set up a game environment to contain all of our variables
window.gameEnv = {
    canvas: null,
    gl: null,

    // triangle and square vertex buffers
    triangleVB: null,
    squareVB: null,
    shaderProgram: null,
    vertexPosAttr: null,
    vertexColorAttr: null,
    pMatrix: null,
    pMatrixU: null,
    mvMatrix: null,
    mvMatixU: null,
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
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 4/3, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(800, 600);
        $('body').append(this.renderer.domElement);

        this.initScene();
        this.drawScene()
    },

    initScene: function(gl, vertices, itemSize) {
        var geometry = new THREE.CubeGeometry(1,1,1);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        this.camera.position.z = 5;
    },

    drawScene: function() {
        requestAnimationFrame(window.gameEnv.drawScene);
        window.gameEnv.renderer.render(window.gameEnv.scene, window.gameEnv.camera);
    }
}

/*
 * On ready, initialize the webGL context on the canvas. From there, color
 * in black to make sure it exists.
 */
$(document).ready(function(){
  gameEnv.initCanvas();
});
