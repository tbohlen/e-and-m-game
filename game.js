var horizAspect = 600.0/800.0
    , allFragShaders
    , allVertShaders
    , shaderProgram
    , squareVerticesBuffer
    , pMatrix = mat4.create()
    , mvMatrix = mat4.create();

/*
 * Function: getShader
 * Retrieve and compile the glsl shaders by the id of the script tag in the
 * dom.
 */
function getShader(gl, title, type) {
    var shader, source, startString = "START " + title, endString = "END " + title;

    if (type === "vert") {
        source = allVertShaders.split(startString)[1].split(endString)[0];
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (type === "frag") {
        source = allFragShaders.split(startString)[1].split(endString)[0];
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else {
        console.log("Unknown file type");
        return null;
    }

    gl.shaderSource(shader, source);
         
      // Compile the shader program
    gl.compileShader(shader);  

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
        return null;
    }

    return shader;
}

/*
 * Function: loadShaders
 * Load the two shader files so that we can later access shader scripts easily
 * without loading each one independently.
 */
function loadShaders(callback) {
    allVertShaders = $("#vert-shaders").text();
    allFragShaders = $("#frag-shaders").text();
    callback(null);
    //var vertGet = $.get("shaders/shaders.vert");

    //vertGet.error(function(){
        //callback("Error retrieving vertex shaders");
    //});
    //vertGet.success(function(vertData){
        //var fragGet = $.get("shaders/shaders/frag");
        //fragGet.error(function(){
            //callback("Error retrieving fragment shaders");
        //});
        //fragGet.success(function(fragData){
            //allVertShaders = vertData;
            //allFragShaders = fragData;
            //console.log("Shaders set");
            //callback(null);
        //});
    //});
}

/*
 * Function: initShaders
 * Load the shaders we will be using using the <getShader> function.
 */
function initShaders() {
    var vertexShader = getShader(gl, "vert-shader", "vert")
        , fragmentShader = getShader(gl, "frag-shader", "frag")
    
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

 
/*
 * Function: initBuffers
 * Initialize the buffer for a square that we will be displaying
 * to screen.
 */
function initBuffers() {
    var vertices = [
        1.0,  1.0,  0.0,
        -1.0, 1.0,  0.0,
        1.0,  -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // perspective
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    // transform matrix
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

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
        gl.viewportWidth = 800;
        gl.viewportHeight = 800;
    }
    catch(e) {
        console.log("error!" + e);
    }

    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }
}

function initCanvas() {
    canvas = $("#game-canvas");
    initWebGL.call(this, self.canvas[0]);

    if (gl) {
        loadShaders(function(error){
            if (error !== null && typeof(error) !== 'undefined') {
                console.log("Error loading shaders.")
                alert("We failed to load all necessary resources from the server. Try refreshing.");
            }
            else {
                initShaders();
                initBuffers();

                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

                drawScene();
            }
        });
    }
}

/*
 * On ready, initialize the webGL context on the canvas. From there, color
 * in black to make sure it exists.
 */
$(document).ready(function(){
  initCanvas.call(self);
});
