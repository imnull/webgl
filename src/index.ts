import { $V, makePerspective } from './sylvester.js'
import {
	getContext,
	glCreateFragmentShader,
	glCreateVertexShader,
	glCreateProgram,
	glAttachShader,
	glActiveProgram,
	glBindVertexData,
	exMatrix,
	glSetMatrixUniforms,
} from './webgl'

var glCtx = getContext('#test');
var fragScript = `
void main(void){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
} 
`
var vertScript = `
attribute vec3 aVertexPosition;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix; 
void main(void) {
	gl_PointSize = 5.0;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`

var fragShader = glCreateFragmentShader(glCtx)(fragScript)
var vertShader= glCreateVertexShader(glCtx)(vertScript)

var program = glCreateProgram(glCtx)()
glAttachShader(glCtx, program)(vertShader, fragShader)
glActiveProgram(glCtx, program)()

var vertex = $V([0.0, 0.0, -4.0]);
var vertices = new Float32Array([  
	 1.0,	 1.0,	0.0,  
	-1.0,	 1.0,	0.0,  
	-1.0,	-1.0,	0.0,
	//-1.5,	-0.2,	1.0,
	 1.0,	-1.0,	0.0
]);
var mvMatrix = exMatrix();
mvMatrix = mvMatrix.trans(vertex);//.rotate(30, [0, 1, 0]);

var perspectiveMatrix = makePerspective(45, glCtx.canvas.width/glCtx.canvas.height, 0.1, 100.0);
var beginMode = 'POINTS';
/* BeginMode 
const GLenum POINTS                         = 0x0000;
const GLenum LINES                          = 0x0001;
const GLenum LINE_LOOP                      = 0x0002;
const GLenum LINE_STRIP                     = 0x0003;
const GLenum TRIANGLES                      = 0x0004;
const GLenum TRIANGLE_STRIP                 = 0x0005;
const GLenum TRIANGLE_FAN                   = 0x0006;
*/

glBindVertexData(glCtx, program)('aVertexPosition', vertices);

glCtx.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
glCtx.clearDepth(1.0);                 // Clear everything
glCtx.enable(glCtx.DEPTH_TEST);           // Enable depth testing
glCtx.depthFunc(glCtx.LEQUAL);            // Near things obscure far things
glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT);

glSetMatrixUniforms(glCtx, program)("uPMatrix", perspectiveMatrix)
glSetMatrixUniforms(glCtx, program)("uMVMatrix", mvMatrix)

setInterval(function(){
	glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT);
	mvMatrix = mvMatrix.rotate(2, [1, 1, 1]);
	glSetMatrixUniforms(glCtx, program)("uMVMatrix", mvMatrix)
	glCtx.drawArrays(glCtx[beginMode], 0, 4);
	glCtx.drawArrays(glCtx['LINE_LOOP'], 0, 4);
}, 20)