# ShaderElement
[ShaderElement](http://ricku34.github.io/ShaderElement/) is JavaScript Library that extended HTML DOM element and makes possible beautiful rendering by writing code [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) without JavaScript or WebGL knowledges


## Sample Usage
```glsl
<shader style="border: none; width: 300px; height: 300px" color="[0.0, 0.0, 1.0, 1.0]">
uniform vec4 color;

void main(void) 
{
	gl_FragColor = color;
}
</shader>
```
## Sample List
 * [Colors.html](http://ricku34.github.io/ShaderElement/samples/Colors.html) : Simple 2D fill shaders without any assets
 * [Images.html](http://ricku34.github.io/ShaderElement/samples/Images.html) : shaders working  vith  images as custom uniform
 * [Sepia.html](http://ricku34.github.io/ShaderElement/samples/Sepia.html) : Sepia filter into an extenal GLSL file, show how to update uniform in **JavaScript** 
 
##How to use it?
First, load the latest version of ShaderElement on your HTML header page
```html
<head> 
	<script type="text/javascript" src="https://ricku34.github.io/ShaderElement/ShaderElement.min.js"></script>
</head> 
```
After that, you can declare **shader rendering surface** , directly in your `<body>` section by adding `<shader>` element
###Where to write [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code ?
3 way to map [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code to an rendering surface
* Write [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code directly inside the `<shader>` element
* Write and share [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code inside the `<script type="x-shader/x-fragment">` element in your `<head>` HTML section, and map it, to an rendering surface by an id through the src attribute 
```html
<head> 
	<script type="text/javascript" src="https://ricku34.github.io/ShaderElement/ShaderElement.min.js"></script>
	<script type="x-shader/x-fragment" id="DisplayImage">
	uniform vec2 resolution;
	uniform sampler2D image;	
	
	void main(void) 
	{
		gl_FragColor = texture2D(image, gl_FragCoord.xy/resolution);
	} 
	</script>
</head> 
<body>
  <shader src="DisplayImage"
	style="border: none; width: 300px; height: 300px"
	image="{ href : './assets/image1.png' }"></shader>
	
  <shader src="DisplayImage"
	style="border: none; width: 300px; height: 300px"
	image="{ href : './assets/image2.png' }"></shader>
</body>  
```
* Write and share [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code into external file 
```html
<shader src="https://ricku34.github.io/ShaderElement/samples/Sepia.glsl"
	style="border: none; width: 300px; height: 300px"
	image="{ href : './assets/image1.png' }"
	intensity="0.2"></shader>
```
###Uniforms
they are 2 kind of Uniforms::
####Built-in Uniforms
the built-in Uniforms are automatically managed for you, to use it you just need to declare it in [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code   

Uniforms | Description
-------- | -----------
`uniform float time;` | elapsed time in seconds
`uniform vec2 resolution;` | the dimensions in pixel of the rendering surface

####Custom Uniforms
Custom Uniforms can be initialized directly by DOM attibut inside the shader tag, the attribut value must be a valide JSON.
follow the correspondence table of types below :

GSL | JavaScript | HTML 
--- | ---------- | ----
`bool` | `Boolean` | `<shader shadow="false"/>`
`float` | `Number` | `<shader inrensity="0.8"/>`
`vec2` | `Array` | `<shader UpVector="[0, -1]"/>`
`vec3` | `Array` | `<shader AtVector="[0, 0, 1]"/>`
`mat4` | `Array` | `<shader  model="[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]"/>`


