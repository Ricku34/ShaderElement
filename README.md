# ShaderElement
Write PixelShader in GLSL directly inside an HTML document, using WebGL context of an canvas 


## Sample Usage
```html
<shader style="border: none; width: 300px; height: 300px" color="[0.0, 0.0, 1.0, 1.0]">
```
```glsl
uniform vec4 color;

void main(void) 
{
	gl_FragColor = color;
}
```
```html
</shader>
```

##How to use it?
First, load the latest version of ShaderElement on your HTML header page
```html
<head> 
	<script type="text/javascript" src="https://ricku34.github.io/ShaderElement/ShaderElement.min.js"></script>
</head> 
```
After that, you can declare **shader rendering surface** , directly in your `<body>` section by adding `<shader>` element
###Where to write GLSL code ?
3 way to map GLSL code to an rendering surface
* Write GLSL code directly inside the `<shader>` element
* Write and share GLSL code inside the `<script type="x-shader/x-fragment">` element in your `<head>` HTML section, and map it, to an rendering surface by an id through the src attribute 
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
* Write and share GLSL code into external file 
```html
<shader src="https://ricku34.github.io/ShaderElement/samples/Sepia.glsl"
	style="border: none; width: 300px; height: 300px"
	image="{ href : './assets/image1.png' }"
	intensity="0.2"></shader>
```
###Uniforms
they have 2 sorte of Uniforms:
####Built-in Uniforms
the built-in Uniforms are automatically managed for you, to use it you just need to declare it in GLSL code   
Uniforms | Description
-------- | -----------
`uniform float time;`| elapsed time in seconds
`uniform vec2 resolution;` | the dimensions in pixel of the rendering surface

First Header | Second Header
------------ | -------------
Content from cell 1 | Content from cell 2
Content in the first column | Content in the second column

