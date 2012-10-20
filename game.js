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
        this.canvas = $("#game-canvas")[0];
        this.initWebGL(this.canvas);
        var gl = this.gl;

        if (gl) {
            console.log('GL');
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

            this.initShaders(gl);
            this.initBuffers(gl);
            this.drawScene(gl);
        }
        else {
            console.log('No GL');
        }
    },

    initBuffer: function(gl, vertices, itemSize) {
      var buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      buffer.itemSize = itemSize;
      buffer.numItems = vertices.length / itemSize;
      return buffer;
    },

    initTriangle: function(gl) {
      var vertices = [
        0.0, 1.0, 0.0,
       -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0];
      return this.initBuffer(gl, vertices, 3);
    },

    initSquare: function(gl) {
      var vertices = [
           1.0,  1.0,  0.0,
          -1.0,  1.0,  0.0,
           1.0, -1.0,  0.0,
          -1.0, -1.0,  0.0
      ];
      return this.initBuffer(gl, vertices, 3);
    },

    initBuffers: function(gl) {
      this.initSquare(gl);
    },

    getShader: function(gl, sel) {
      var shader;
      var shaderScript = $(sel);
      if (shaderScript) {
        var str = shaderScript.text();
        var shaderType = (shaderScript.attr("type") == "x-shader/x-fragment") ?
                          gl.FRAGMENT_SHADER : gl.VERTEX_SHADER;
        shader = gl.createShader(shaderType);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
        }
      }

      return shader;
    },

    initShaders: function(gl) {
      var vertexShader   = this.getShader(gl, "#shader-vs");
      var fragmentShader = this.getShader(gl, "#shader-fs");

      this.shaderProgram = gl.createProgram();
      gl.attachShader(this.shaderProgram, vertexShader);
      gl.attachShader(this.shaderProgram, fragmentShader);
      gl.linkProgram(this.shaderProgram);

      if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
      }

      gl.useProgram(this.shaderProgram);

      this.vertexPosAttr = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
      gl.enableVertexAttribArray(this.vertexPosAttr);

      // grab the uPMatrix and uMVMatrix values from the shader program
      this.pMatrixU = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
      this.mvMatrixU = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");

      console.log("shaders initialized.");
    },

    setMatrixUniforms: function(gl) {
      // set uniforms to the values of pMatrix and mvMatrix
      gl.uniformMatrix4fv(this.pMatrixU, false, this.pMatrix);
      gl.uniformMatrix4fv(this.mvMatrixU, false, this.mvMatrix);
    },

    drawScene: function(gl) {
      this.mvMatrix = mat4.create(); // moodel-view matrix
      this.pMatrix = mat4.create(); // perspective matrix

      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      var aspectRatio = this.canvas.width / this.canvas.height;
      console.log(aspectRatio);
      mat4.perspective(45, aspectRatio, 
                       0.1, 100.0, this.pMatrix);

      mat4.identity(this.mvMatrix);
      mat4.translate(this.mvMatrix, [-1.5, 0.0, -7.0]); // move left

      this.setMatrixUniforms(gl);

      // specify current buffer
      var triangleVB = this.initTriangle(gl);
      console.log(triangleVB);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleVB);
      // set the vertex buffer to point at PosAttr to get vertices
      // step through the array, itemSize elem chunks at a time
      gl.vertexAttribPointer(this.vertexPosAttr,
                             triangleVB.itemSize, gl.FLOAT, false, 0, 0);

      // draw the vertexes we just pointed to, treating them as triangle
      // positions
      gl.drawArrays(gl.TRIANGLES, 0, triangleVB.numItems);

      mat4.identity(this.mvMatrix);
      mat4.translate(this.mvMatrix, [1.5, 0.0, -8.0]); // move right

      this.setMatrixUniforms(gl);
      
      var squareVB = this.initSquare(gl);
      gl.bindBuffer(gl.ARRAY_BUFFER, squareVB);
      gl.vertexAttribPointer(this.vertexPosAttr,
                             squareVB.itemSize, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVB.numItems);
    }
}

/*
 * On ready, initialize the webGL context on the canvas. From there, color
 * in black to make sure it exists.
 */
$(document).ready(function(){
  gameEnv.initCanvas();
});
