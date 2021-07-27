import { Matrix, $V } from './sylvester'

export const GL_CONTEXT_TOKEN = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl']

export const getContext = (selector: string) => {
    const cvs = document.querySelector(selector) as HTMLCanvasElement
    if(!cvs) {
        return null
    }
	for(let i = 0; i < GL_CONTEXT_TOKEN.length; i++){
		const gl = cvs.getContext(GL_CONTEXT_TOKEN[i], { antialias : true, stencil : true }) as WebGL2RenderingContext
		if(gl) return gl
	}
	return null
}

/*
 * 创建 vertex shader 对象
 */
export const glCreateVertexShader = (gl: WebGL2RenderingContext) => (script: string) => {
	var shader = gl.createShader(gl.VERTEX_SHADER)
	gl.shaderSource(shader, script)
	gl.compileShader(shader)
	return shader
}

/*
 * 创建 fragment shader 对象
 */
export const glCreateFragmentShader = (gl: WebGL2RenderingContext) => (script: string) => {
	var shader = gl.createShader(gl.FRAGMENT_SHADER)
	gl.shaderSource(shader, script)
	gl.compileShader(shader)
	return shader
}

/*
 * 创建 program 对象
 */
export const glCreateProgram = (gl: WebGL2RenderingContext) => () => {
	return gl.createProgram()
}

/*
 * attach shader to program
 */
export const glAttachShader = (gl: WebGL2RenderingContext, program: WebGLProgram) => (vShader: WebGLShader, fShader: WebGLShader) => {
	gl.attachShader(program, vShader)
	gl.attachShader(program, fShader)
}

/*
 * link and use program
 */
export const glActiveProgram = (gl: WebGL2RenderingContext, program: WebGLProgram) => () => {
	gl.linkProgram(program)
	gl.useProgram(program)
}

/*
 * bind vertex data
 */
export const glBindVertexData = (gl: WebGL2RenderingContext, program: WebGLProgram) => (attr: string, data: BufferSource) => {
	var pos = gl.getAttribLocation(program, attr);
	if(pos < 0) return;
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(pos);
	buffer = null;
}

export const glSetMatrixUniforms = (gl: WebGL2RenderingContext, program: WebGLProgram) => (name: string, matrix: any) => {
	var uniform = gl.getUniformLocation(program, name);
	if(!uniform) return;
	gl.uniformMatrix4fv(uniform, false, new Float32Array(matrix.flatten()));
}

export function exMatrix(mat?: Matrix){
	var matrix = mat || Matrix.I(4);
	matrix.rotate = function(deg: number, axis: any){
		var m = Matrix.Rotation(deg * Math.PI / 180.0, $V(axis)).ensure4x4();
		return exMatrix(this.x(m));
	}
	matrix.trans = function(vertex: any){
		return exMatrix(this.x(Matrix.Translation($V(vertex)).ensure4x4()));
	}
	return matrix;
}