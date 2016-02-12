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
 * [Colors](http://ricku34.github.io/ShaderElement/samples/Colors.html) : Simple 2D fill shaders without any assets
 * [Images](http://ricku34.github.io/ShaderElement/samples/Images.html) : shaders working  with  images as custom uniform
 * [Sepia](http://ricku34.github.io/ShaderElement/samples/Sepia.html) : Sepia filter into an extenal GLSL file, show how to update uniform in **JavaScript** 
 * [SkyBox](http://ricku34.github.io/ShaderElement/samples/SkyBox.html) : SkyBox sample using **samplerCube** 
 * [Fire](http://ricku34.github.io/ShaderElement/samples/Fire.html) : Flame effect using  noise function.
 * [La Calanque](http://ricku34.github.io/ShaderElement/samples/Calanque.html) : Nice real-time raytracing of calanque place (shader written by **XT95**) .
 * [Videos](http://ricku34.github.io/ShaderElement/samples/Video.html) : some effects on video
 * [DisoluteVideo](http://ricku34.github.io/ShaderElement/samples/DisoluteVideo.html) : Disolute effect on video
 * [Mouse](http://ricku34.github.io/ShaderElement/samples/mouse.html) : Display disc on the coordinate of the mouse and animate it when left button is push
 * [Landscape](http://ricku34.github.io/ShaderElement/samples/Landscape.html) : Free fly through nice procedural landscape (by David Hoskins) with FPS camera style.
 
##How to use it?
First, load the latest version of ShaderElement on your HTML header page
```html
<head> 
	<script type="text/javascript" src="http://ricku34.github.io/ShaderElement/build/ShaderElement.min.js"></script>
</head> 
```
After that, you can declare **shader rendering surface** , directly in your `<body>` section by adding `<shader>` element
###Where to write [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code ?
3 way to map [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code to an rendering surface
* Write [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code directly inside the `<shader>` element
* Write and share [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code inside the `<script type="x-shader/x-fragment">` element in your `<head>` HTML section, and map it, to an rendering surface by an id through the src attribute 
```html
<head> 
	<script type="text/javascript" src="http://ricku34.github.io/ShaderElement/build/ShaderElement.min.js"></script>
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
they are 2 kind of Uniforms:
####Built-in Uniforms
the built-in Uniforms are automatically managed for you, to use it you just need to declare it in [GLSL](https://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf) code   

Uniforms | Description
-------- | -----------
`uniform float time;` | elapsed time in seconds
`uniform vec2 resolution;` | the dimensions in pixel of the rendering surface
`uniform vec4 mouse` | XY : the coordinate in pixel, W : buttons states


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
`sampler2D` | `Object` | `<shader image="{ href : './image.png' , wrapS : 'MIRRORED_REPEAT' , wrapT : 'REPEAT' }"/>`

####Sampler Javascript Object
Here is the list of properties expected for a Sampler JSON :

Name | Type | default value | description
---- | ---- | ------------- | -----------
**sample** | `Image` | n/a | Image in RGBA
**sample** | `canvas` | n/a | the rasterize result of an canvas
**sample** | `String` | n/a |  the id of an existing DOM Image or canvas Element
**href** | `String` | n/a | the location of an image 
**wrapS** | `String` | 'CLAMP_TO_EDGE' | must be one of this :  'CLAMP_TO_EDGE', 'REPEAT' or 'MIRRORED_REPEAT'
**wrapT** | `String` | 'CLAMP_TO_EDGE' | must be one of this :  'CLAMP_TO_EDGE', 'REPEAT' or 'MIRRORED_REPEAT'
**magFilter** | `String` | 'LINEAR' | must be one of this :  'LINEAR' or 'NEAREST'
**minFilter** | `String` | 'LINEAR' | must be one of this :  'LINEAR' or 'NEAREST'


## Task List

- [x] samplerCube uniform support
- [x] Video support
- [x] add  mouse event as built-in uniform
- [ ] add  touch event as built-in uniform
- [ ] add  gamepad event as built-in uniform
- [ ] add  keyboard event as built-in uniform

