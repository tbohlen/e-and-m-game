// set up a game environment to contain all of our variables
window.gameEnv = {
    LOGIC_DELAY: 20 // number of millisecond before positions recalculated
    , stepSize: 0.05 // size of each time step calculated by the integrator
    , canvas: null
    , scene: null
    , camera: null
    , renderer: null
    , shipThruster: .01
    , framesPerTurn: 240

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
        this.camera = new THREE.PerspectiveCamera(60, 4/3, 0.1, 10000);
        this.camera.useQuaternion = true;

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(800, 600);

        this.canvas = $(this.renderer.domElement);
        this.canvas.addClass("canvas");
        $('body').append(this.canvas);

        this.initScene();
        this.drawScene()
    },

    initScene: function(gl, vertices, itemSize) {
        for (var i = 0; i < 2; i++) {
            var geometry = new THREE.SphereGeometry(1, 20, 20);
            geometry.computeVertexNormals();
            var material = new THREE.MeshPhongMaterial({color: 0xaa0000});
            var sphere = new THREE.Mesh(geometry, material);
            sphere.position.set( boundedRand(-5, 5), boundedRand(-5, 5), boundedRand(-5, 5));
            sphere.velocity = [0.0, 0.0, 0.0];
            sphere.chargePos = [0.0, 0.0, 0.0];
            sphere.charge = -1;
            sphere.static = true;
            this.scene.add(sphere);
            this.chargeSystem.addCharge(sphere);
        }

        for (var i = 0; i < 2; i++) {
            var geometry = new THREE.SphereGeometry(1, 20, 20);
            geometry.computeVertexNormals();
            var material = new THREE.MeshPhongMaterial({color: 0x0000aa});
            var sphere = new THREE.Mesh(geometry, material);
            sphere.position.set( boundedRand(-5, 5), boundedRand(-5, 5), boundedRand(-5, 5));
            sphere.velocity = [0.0, 0.0, 0.0];
            sphere.chargePos = [0.0, 0.0, 0.0];
            sphere.charge = 1;
            sphere.static = true;
            this.scene.add(sphere);
            this.chargeSystem.addCharge(sphere);
        }


        var shipMaterial = new THREE.MeshPhongMaterial({color: 0x0000AA});
        var shipGeom = new THREE.CubeGeometry(0.5, 0.5, 0.5, 5, 5, 5);
        shipGeom.computeVertexNormals();

        this.ship = new THREE.Mesh(shipGeom, shipMaterial);
        this.ship.position.x = 0;
        this.ship.position.y = 0;
        this.ship.position.z = 5;
        this.ship.velocity = [0.0, 0.0, 0.0];
        this.ship.chargePos = [0.0, 0.0, 0.0];
        this.ship.charge = 1;
        this.ship.useQuaternion = true;
        this.ship.quaterion = (new THREE.Quaternion()).setFromEuler(new THREE.Vector3(0, 0, 0));

        this.scene.add(this.ship);

        this.chargeSystem.addCharge(this.ship);

        // add a directional light for shading
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0, 1 );
        directionalLight.position.set( 5, 5, 8);
        var ambientLight = new THREE.AmbientLight( 0x444444 );
        ambientLight.position.set( 0, 5, 0);
        this.scene.add( directionalLight );
        this.scene.add(ambientLight);
    },

    drawScene: function() {
        // find the camera position
        var newPos = new THREE.Vector3(0, 0, 0);
        var quat = new THREE.Quaternion();
        newPos.copy(window.gameEnv.ship.position);
        quat.copy(window.gameEnv.ship.quaternion);
        var lookDir = new THREE.Vector3(0, 0, 1);

        // transform the -z vector, our look direction, by the quaternion
        quat.multiplyVector3(lookDir);
        lookDir.multiplyScalar(5);

        window.gameEnv.camera.position.add(newPos, lookDir);
        window.gameEnv.camera.quaternion = quat;
        window.gameEnv.camera.updateProjectionMatrix();

        // render the screen
        window.gameEnv.renderer.render(window.gameEnv.scene, window.gameEnv.camera);

        // request that the frame be rendered again in a moment
        requestAnimationFrame(window.gameEnv.drawScene);
    },

    updateGame: function() {
        var self = window.gameEnv
        // do an additional special update for the ship
        
        // if the mouse is offcenter, change the rotation of the ship
        // the left-right portion rotates around the up vector, the up/down
        // rotates around the sideways vector
        var leftRightAngle = 0;
        var upDownAngle = 0;
        // fix mouseX so it is useful
        var screenMouseX = self.mouseX - self.canvas.width() * 0.5;
        // fix mouseY so it is useful
        var screenMouseY = -1 * (self.mouseY - self.canvas.height() * 0.5);
        if (screenMouseX && Math.abs(screenMouseX) > 10) {
            leftRightAngle = (2 * Math.PI * screenMouseX) / (window.gameEnv.canvas.width() * 0.5 * window.gameEnv.framesPerTurn);
        }
        if (screenMouseY && Math.abs(screenMouseY) > 10) {
            upDownAngle = (2 * Math.PI * screenMouseY) / (window.gameEnv.canvas.height() * 0.5 * window.gameEnv.framesPerTurn);
        }
        var leftRight = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0, -1, 0), leftRightAngle);
        var upDown = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(1, 0, 0), upDownAngle);

        var rot = (new THREE.Quaternion()).multiply(leftRight, upDown);
        rot.multiply(leftRight, upDown);
        var existingRotation = self.ship.quaternion;
        self.ship.quaternion.multiply(existingRotation, rot);

        // if the up arrow is being hit, add to the ships velocity
        if (self.goForward) {
            var forward = new THREE.Vector3(0, 0, -1);
            self.ship.quaternion.multiplyVector3(forward);
            var addition = forward.multiplyScalar(self.shipThruster);
            self.ship.velocity = addVectors(self.ship.velocity, [addition.x, addition.y, addition.z]);
        }
        else if (self.goBackward) {
            var forward = new THREE.Vector3(0, 0, 1);
            self.ship.quaternion.multiplyVector3(forward);
            var addition = forward.multiplyScalar(self.shipThruster);
            self.ship.velocity = addVectors(self.ship.velocity, [addition.x, addition.y, addition.z]);
        }

        // update the positions and forces on all charged particles
        trapezoidalStep(self.chargeSystem, self.stepSize);


        
    }
}

/*
 * On ready, initialize the webGL context on the canvas. From there, color
 * in black to make sure it exists.
 */
$(document).ready(function(){
    gameEnv.chargeSystem = new ChargeSystem();
    gameEnv.initCanvas();
    gameEnv.intervalID = window.setInterval(window.gameEnv.updateGame, window.gameEnv.LOGIC_DELAY);

    // set key handlers for the mouse, up, and down, the controls
    // for the ship
    $("body").on("mousemove", function(ev) {
        // find the new offset from the center
        var gameOffset = window.gameEnv.canvas.offset();
        window.gameEnv.mouseX = ev.pageX - gameOffset.left;
        window.gameEnv.mouseY = ev.pageY - gameOffset.top;
    });

    $("body").on("keydown", function(ev) {
        // w goes forward
        if (ev.keyCode === 87) {
            window.gameEnv.goForward = true;
        }
        else if (ev.keyCode === 83) {
            window.gameEnv.goBackward = true;
        }
    });
    $("body").on("keyup", function(ev) {
        if (ev.keyCode === 87) {
            window.gameEnv.goForward = false;
        }
        if (ev.keyCode === 83) {
            window.gameEnv.goBackward = false;
        }
    });
});
