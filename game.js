// set up a game environment to contain all of our variables
window.gameEnv = {
    canvas: null
    , scene: null
    , camera: null
    , renderer: null
    , charges: []

    // triangle and square vertex buffers
    /*
     * Function: initWebGL
     * Initializes the webGL context and, if it fails, leaves us with nothing.
     * The context is stored in this.gl
     */
    , initWebGL: function(canvas) {

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
        this.canvas = this.renderer.domElement;
        $('body').append(this.canvas);

        this.initScene();
        this.drawScene()
    },

    initScene: function(gl, vertices, itemSize) {
        var geometry = new THREE.SphereGeometry(2, 20, 20);
        geometry.computeVertexNormals();
        var material = new THREE.MeshPhongMaterial({color: 0x880088});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.vel = [0.0, 0.0, 0.0];
        sphere.chargePos = [0.0, 0.0, 0.0];

        var shipGeom = new THREE.SphereGeometry(0.5);
        shipGeom.computeVertexNormals();

        var ship = new THREE.Mesh(shipGeom, material);
        ship.position.x = 4;
        ship.vel = [0.0, 0.0, 0.0];
        ship.chargePos = [0.0, 0.0, 0.0];

        this.scene.add(sphere);
        this.scene.add(ship);

        this.charges.push(sphere);
        this.charges.push(ship);

        this.camera.position.z = 5;

        // add a directional light for shading
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9, 1 );
        directionalLight.position.set( 5, 5, 8);
        this.scene.add( directionalLight );
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
