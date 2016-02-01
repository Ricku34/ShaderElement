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
3 way to map GLSL code to a rendering surface
