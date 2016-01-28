(function ()
{
	var Shaders = [];
	var VertexShaderSource = [ 
	"attribute vec2 vertex;",
	"varying vec2 position;",
	"void main(void)", 
	"{",
	"	position = vertex;",
	"	gl_Position.xy = vertex;",
	"	gl_Position.z = 0.0;",
	"	gl_Position.w = 1.0;", 
	"}" ].join('\n');
	
	var QuadVertexBuffer = new Float32Array(
	[ //  x     y
		-1.0, -1.0, //sommet bas gauche
		-1.0,  1.0, //sommet haut gauche
		 1.0, -1.0, //sommet bas droit
		 1.0,  1.0  //sommet haut droit 
	]);
	
}());