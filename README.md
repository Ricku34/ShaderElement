# ShaderElement
Write PixelShader in GLSL directly inside an HTML document, using WebGL context of an canvas 


## Sample Usage
```html
<shader style="border: none; width: 300px; height: 300px" color="[0.0, 0.0, 1.0, 1.0]">
```glsl
uniform vec4 color;

void main(void) 
{
	gl_FragColor = color;
}
```html
</shader>
```