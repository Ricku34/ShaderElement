uniform vec2 resolution;
uniform float intensity;
uniform sampler2D image;

const mat4 YIQMatrix = mat4(   
	0.299,  0.596,  0.212, 0.000,
	0.587, -0.275, -0.523, 0.000,
	0.114, -0.321,  0.311, 0.000,
	0.000,  0.000,  0.000, 1.000
);	

const mat4 inverseYIQ = mat4(
	1.0,    1.0,    1.0,    0.0,
	0.956, -0.272, -1.10,  0.0,
	0.621, -0.647,  1.70,   0.0,
	0.0,    0.0,    0.0,    1.0
);

void main(void) 
{
	vec4 rgbaColor = texture2D(image, gl_FragCoord.xy/resolution);
	vec4 yiqaColor = YIQMatrix * rgbaColor;
	yiqaColor.y = intensity; 
    yiqaColor.z = 0.0;
	gl_FragColor =  inverseYIQ * yiqaColor;
	
} 


