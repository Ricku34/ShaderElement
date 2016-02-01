(function ()
{
	var Shaders = [];
	var VertexShaderSource = [ 
	"attribute vec2 vertex;",
//	"varying vec2 position;",
	"void main(void)", 
	"{",
//	"	position = vertex;",
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
	
	function InitShader(canvas,source)
	{
		canvas.gl =	canvas.getContext("webgl", { depth : false }) ||
					canvas.getContext("experimental-webgl", { depth : false });
		if (!canvas.gl) 
		{
			console.error("Your navigator don't support WebGL!");
			return false;
		}
		
		canvas.gl.disable( canvas.gl.CULL_FACE );
		canvas.gl.pixelStorei(canvas.gl.PACK_ALIGNMENT,                     1);
		canvas.gl.pixelStorei(canvas.gl.UNPACK_ALIGNMENT,                   1);
		canvas.gl.pixelStorei(canvas.gl.UNPACK_FLIP_Y_WEBGL,                true);
		canvas.gl.pixelStorei(canvas.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,     false);
		canvas.gl.pixelStorei(canvas.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, canvas.gl.NONE);

		canvas.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		
		var vertexShader = canvas.gl.createShader(canvas.gl.VERTEX_SHADER);
		canvas.gl.shaderSource(vertexShader, VertexShaderSource);
		canvas.gl.compileShader(vertexShader);			
		
		var fragmentShader = canvas.gl.createShader(canvas.gl.FRAGMENT_SHADER);
		canvas.gl.shaderSource(fragmentShader,"precision highp float;\n" + source );
		canvas.gl.compileShader(fragmentShader);			
		if(!canvas.gl.getShaderParameter(fragmentShader, canvas.gl.COMPILE_STATUS)) 
		{
			console.error("An error occurred compiling the PixelShaders: " + canvas.gl.getShaderInfoLog(fragmentShader));
			return false;
		}
		canvas.shaderProgram = canvas.gl.createProgram();
		canvas.gl.attachShader(canvas.shaderProgram, vertexShader);
		canvas.gl.attachShader(canvas.shaderProgram, fragmentShader);
		canvas.gl.linkProgram(canvas.shaderProgram);
		
		// activation des shaders 
		canvas.gl.useProgram(canvas.shaderProgram);
		
		canvas.shaderProgram.vertexPositionAttribute = canvas.gl.getAttribLocation(canvas.shaderProgram, "vertex");
		canvas.gl.enableVertexAttribArray(canvas.shaderProgram.vertexPositionAttribute);
		
		BuildUniforms(canvas);
		
		var vertexBuffer = canvas.gl.createBuffer();
		canvas.gl.bindBuffer(canvas.gl.ARRAY_BUFFER, vertexBuffer);
		canvas.gl.bufferData(canvas.gl.ARRAY_BUFFER, QuadVertexBuffer,  canvas.gl.STATIC_DRAW);

		canvas.gl.vertexAttribPointer(canvas.shaderProgram.vertexPositionAttribute, 2, canvas.gl.FLOAT, false, 0, 0);
		
		canvas.renderShader = function ()
		{
			this.gl.clear(this.gl.COLOR_BUFFER_BIT);
			this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
			this.needRender = false;
		};
		
		canvas.resizeShader = function ()
		{
			canvas.width = canvas.scrollWidth;
			canvas.height = canvas.scrollHeight;
			canvas.gl.viewport(0.0, 0.0, canvas.width, canvas.height);
			
			if(canvas.uniforms["resolution"] && canvas.uniforms["resolution"].type == "vec2")
			{
				canvas.uniforms.resolution.value = [canvas.width, canvas.height];
			}
		};
		
		canvas.resizeShader();
		canvas.needRender = true;
		
		Shaders.push(canvas);
		
	}
	
	function BuildUniforms(canvas)
	{
		var gl = canvas.gl;
		canvas.uniforms = {};
		canvas.textureCount = 0;
		var index=0;
		while(true)
		{
			try
			{
				var info = canvas.gl.getActiveUniform(canvas.shaderProgram,index++);
				if(!info)
					break;
				
				switch(info.type)
				{
					case gl.BOOL :
						canvas.uniforms[info.name] = Object.create(Object.prototype,
						{ 
							type :  { value : "bool", enumerable : true },
							location : { value : gl.getUniformLocation(canvas.shaderProgram, info.name), enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											gl.uniform1i(this.location,val? 1 : 0);
											canvas.needRender = true;
										}
									}	
						});
						break;
					
					case gl.INT :
						canvas.uniforms[info.name] = Object.create(Object.prototype,
						{ 
							type :  { value : "int", enumerable : true },
							location :   { value : gl.getUniformLocation(canvas.shaderProgram, info.name), enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											gl.uniform1i(this.location,val);
											canvas.needRender = true;
										}
									}	
						});
						break;
						
					case canvas.gl.SAMPLER_2D :
						var uniform = Object.create(Object.prototype,
						{ 
							type :  { value : "sampler2D", enumerable : true },
							textureIndex :  { value : canvas.textureCount++, enumerable : true },
							location :  { value : canvas.gl.getUniformLocation(canvas.shaderProgram, info.name),enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											console.log(val,this.textureIndex);
											canvas.gl.activeTexture(canvas.gl.TEXTURE0 + this.textureIndex);
											if(val.sample)
											{
												if(typeof val.sample === 'string' && document.getElementById(val.sample))
												{
													canvas.gl.texImage2D(canvas.gl.TEXTURE_2D, 0, canvas.gl.RGBA, canvas.gl.RGBA, canvas.gl.UNSIGNED_BYTE, document.getElementById(val.sample));
													canvas.needRender = true;
												}
												else
												{
													canvas.gl.texImage2D(canvas.gl.TEXTURE_2D, 0, canvas.gl.RGBA, canvas.gl.RGBA, canvas.gl.UNSIGNED_BYTE, val.sample);
													canvas.needRender = true;
												}
											}
											else if(val.href)
											{
												var image = new Image();
												image.textIndex= uniform.textureIndex;
												//image.Location = 
												//console.log(val.href, uniform.textureIndex);	
												image.onload = function()
												{
													//uniform.value.sample = image;
													console.log(image.src, image.textIndex);
													
													canvas.gl.activeTexture(canvas.gl.TEXTURE0 + image.textIndex);
													canvas.gl.texImage2D(canvas.gl.TEXTURE_2D, 0, canvas.gl.RGBA, canvas.gl.RGBA, canvas.gl.UNSIGNED_BYTE, image);
													//canvas.gl.uniform1i(image.Location, image.textIndex);
													canvas.needRender = true;
												};
												image.crossOrigin = '';
												image.src = val.href;
												
											}
											if(val.magFilter)
											{	
												canvas.gl.texParameteri(canvas.gl.TEXTURE_2D, canvas.gl.TEXTURE_MAG_FILTER, canvas.gl[val.magFilter]);
												canvas.needRender = true;
											}
											if(val.minFilter)
											{	
												canvas.gl.texParameteri(canvas.gl.TEXTURE_2D, canvas.gl.TEXTURE_MIN_FILTER, canvas.gl[val.minFilter]);
												canvas.needRender = true;
											}
											if(val.wrapS)
											{	
												canvas.gl.texParameteri(canvas.gl.TEXTURE_2D, canvas.gl.TEXTURE_WRAP_S, canvas.gl[val.wrapS]);
												canvas.needRender = true;
											}
											if(val.wrapT)
											{	
												canvas.gl.texParameteri(canvas.gl.TEXTURE_2D, canvas.gl.TEXTURE_WRAP_T, canvas.gl[val.wrapT]);
												canvas.needRender = true;
											}
										}
									}
						});
						canvas.uniforms[info.name] = uniform;
						canvas.gl.activeTexture(canvas.gl.TEXTURE0 + uniform.textureIndex);
						canvas.gl.bindTexture(canvas.gl.TEXTURE_2D, canvas.gl.createTexture());
						canvas.gl.texParameteri(canvas.gl.TEXTURE_2D, canvas.gl.TEXTURE_MAG_FILTER, canvas.gl.LINEAR);
						canvas.gl.texParameteri(canvas.gl.TEXTURE_2D, canvas.gl.TEXTURE_MIN_FILTER, canvas.gl.LINEAR);  
						canvas.gl.texParameteri(canvas.gl.TEXTURE_2D, canvas.gl.TEXTURE_WRAP_S, canvas.gl.CLAMP_TO_EDGE);
						canvas.gl.texParameteri(canvas.gl.TEXTURE_2D, canvas.gl.TEXTURE_WRAP_T, canvas.gl.CLAMP_TO_EDGE);
						canvas.gl.uniform1i(uniform.location, uniform.textureIndex);
						break;
					
					case canvas.gl.FLOAT :
						canvas.uniforms[info.name] = Object.create(Object.prototype,
						{ 
							type :  { value : "float", enumerable : true },
							location : { value : gl.getUniformLocation(canvas.shaderProgram, info.name), enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											canvas.gl.uniform1f(this.location,val);
											canvas.needRender = true;
										}
									}
						});
						break;
					
					case canvas.gl.FLOAT_VEC4 :
						canvas.uniforms[info.name] = Object.create(Object.prototype,
						{
							type :  { value : "vec4", enumerable : true },
							location : { value : gl.getUniformLocation(canvas.shaderProgram, info.name), enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											canvas.gl.uniform4fv(this.location,val);
											canvas.needRender = true;
										}
									}
							
						});
						break;
						
					case canvas.gl.FLOAT_VEC3 :
						canvas.uniforms[info.name] = Object.create(Object.prototype,
						{ 
							type :  { value : "vec3", enumerable : true },
							location : { value : gl.getUniformLocation(canvas.shaderProgram, info.name), enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											canvas.gl.uniform3fv(this.location,val);
											canvas.needRender = true;
										}
									}
						});
						break;
					
					case canvas.gl.FLOAT_VEC2 :
						canvas.uniforms[info.name] = Object.create(Object.prototype,
						{
							type :  { value : "vec2", enumerable : true },
							location : { value : gl.getUniformLocation(canvas.shaderProgram, info.name), enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											canvas.gl.uniform2fv(this.location,val);
											canvas.needRender = true;
										}
									}
						});
						break;
					
					case canvas.gl.FLOAT_MAT4 :
						canvas.uniforms[info.name] = Object.create(Object.prototype,
						{ 
							type :  { value : "mat4", enumerable : true },
							location : { value : gl.getUniformLocation(canvas.shaderProgram, info.name), enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											canvas.gl.uniformMatrix4fv(this.location,false,val);
											canvas.needRender = true;
										}
									}
						});
						break;
					
					case canvas.gl.FLOAT_MAT3:
						canvas.uniforms[info.name] = Object.create(Object.prototype,
						{ 
							type :  { value : "mat3", enumerable : true },
							location : { value : gl.getUniformLocation(canvas.shaderProgram, info.name), enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											canvas.gl.uniformMatrix3fv(this.location,false,val);
											canvas.needRender = true;
										}
									}
						});
						break;
					
					case canvas.gl.FLOAT_MAT2 :
						canvas.uniforms[info.name] = Object.create(Object.prototype,
						{ 
							type :  { value : "mat2", enumerable : true },
							location : { value : gl.getUniformLocation(canvas.shaderProgram, info.name), enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											canvas.gl.uniformMatrix2fv(this.location,false,val);
											canvas.needRender = true;
										}
									}
							
						});
						break;
					
					default:
						break;
				}
				
				if(canvas.hasAttribute(info.name) && canvas.uniforms[info.name])
				{
					var data;
					try
					{
						data = eval("(" + canvas.getAttribute(info.name) + ")");
					}
					catch(err)
					{
						data =  canvas.getAttribute(info.name)
					}
					canvas.uniforms[info.name].value = data;
				}
				
			}
			catch(error)
			{
				break;
			}
		}	
	}
	
	
	
	//Init all shader tag 
	window.addEventListener('load',function ()
	{
		var shadertags = document.getElementsByTagName('shader');
		while(shadertags.length)
		{	
			var canvas = document.createElement('canvas');
			for(var i=0;i<shadertags[0].attributes.length;i++)
			{
				canvas.setAttribute(shadertags[0].attributes[i].nodeName,shadertags[0].attributes[i].value);
			}
			var shaderSource = shadertags[0].innerHTML;
			shadertags[0].parentNode.replaceChild(canvas,shadertags[0]);
			
			if(canvas.hasAttribute('src') && document.getElementById(canvas.getAttribute('src')))
				InitShader(canvas,document.getElementById(canvas.getAttribute('src')).textContent);
			else if(canvas.hasAttribute('src'))
			{
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() 
				{
					if ( xhr.readyState == 4 ) 
					{
						if ( xhr.status == 200 || xhr.status == 0 ) 
							InitShader(canvas,xhr.responseText);
						 else 
							InitShader(canvas,shaderSource);
					}
				};
				try
				{
					xhr.open( "GET", canvas.getAttribute('src'), false );
					xhr.send( null );
				} 
				catch (error)
				{
					console.error(error);
				}
			}
			else
				InitShader(canvas,shaderSource);
		}
					
		RenderLoop();
	});
	
	var StartTime = (new Date()).getTime();
	var LastTime = null;
	
	function RenderLoop()
	{
		requestAnimationFrame(RenderLoop);
		var currentTime = ((new Date()).getTime()-StartTime)/1000;
		var deltaTime = (LastTime!==null)? currentTime-LastTime : 0;
		for(var i=0;i<Shaders.length;i++)
		{	
			if(Shaders[i].uniforms["time"])
				Shaders[i].uniforms.time.value = currentTime;
			
			if(Shaders[i].uniforms["deltatime"])
				Shaders[i].uniforms.deltatime.value = deltaTime;
				
			if(Shaders[i].needRender)
			{
				Shaders[i].renderShader();	
			}
		}
		LastTime = currentTime;
	}

	
	// requestAnimationFrame polyfill by Erik Möller
	// fixes from Paul Irish and Tino Zijdel
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'RequestCancelAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
	
}());