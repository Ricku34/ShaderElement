(function ()
{
	var Shaders = [];
	var VertexShaderSource = [ 
	"attribute vec2 vertex;",
	"void main(void)", 
	"{",
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
	
	function IsVideo(src)
	{
		var res = false;
		[ ".mp4", ".ogv", ".webm"].
		forEach(function(ext)
		{
			if(src.endsWith(ext))
				res=true;
		})
		return res
	}
	
	function InitShader(canvas,source)
	{

		canvas.gl.disable( canvas.gl.CULL_FACE );
		canvas.gl.enable( canvas.gl.BLEND );
		canvas.gl.blendEquation( canvas.gl.FUNC_ADD );
		canvas.gl.blendFunc( canvas.gl.SRC_ALPHA, canvas.gl.ONE_MINUS_SRC_ALPHA );
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
		canvas.gl.shaderSource(fragmentShader,"precision highp float;\n" + source.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&') );
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
		var _pixelSampling=1;
		Object.defineProperty(canvas,"pixelSampling",
		{  enumerable : true,
			get : function() { return _pixelSampling;},
			set : function (val)
			{
				_pixelSampling = val
				this.resizeShader();
			}
		});	
		
		
		canvas.renderShader = function ()
		{
			this.gl.clear(this.gl.COLOR_BUFFER_BIT);
			this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
			this.needRender = false;
		};
		
		canvas.resizeShader = function ()
		{
			canvas.width = Math.floor(canvas.scrollWidth/_pixelSampling);
			canvas.height = Math.floor(canvas.scrollHeight/_pixelSampling);
			canvas.gl.viewport(0.0, 0.0, canvas.width, canvas.height);
			
			if(canvas.uniforms["resolution"] && canvas.uniforms["resolution"].type == "vec2")
			{
				canvas.uniforms.resolution.value = [canvas.width, canvas.height];
			}
		};
		canvas.resizeShader();
		canvas.needRender = true;
		
		if(canvas.uniforms["mouse"] && canvas.uniforms["mouse"].type == "vec4")
		{
			canvas.addEventListener('mousemove', function(evt) 
			{
				 var rect = canvas.getBoundingClientRect();
				 if(evt.buttons)
					console.log(evt.buttons);
				 canvas.uniforms.mouse.value = [evt.clientX - rect.left, rect.bottom - evt.clientY, 0, evt.buttons];
			},false)
			
			function UpdaeButtonsState(evt) 
			{
				 var v = canvas.uniforms.mouse.value;
				 v[3] = evt.buttons;
				 canvas.uniforms.mouse.value = v;
			}
			canvas.addEventListener('mousedown',UpdaeButtonsState,false)
			canvas.addEventListener('mouseup',UpdaeButtonsState,false)
			
		}
		
		Shaders.push(canvas);
		return true;
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
											canvas.gl.activeTexture(canvas.gl.TEXTURE0 + this.textureIndex);
											if(val.sample)
											{
												var media = document.getElementById(val.sample);
												if(typeof val.sample === 'string' && media)
												{
													if(!this._playingLoop && media.toString()=="[object HTMLVideoElement]")
													{
														this._playingLoop=true;
														(function (shader,name)
														{
															shader.addEventListener('frame',function()
															{
																shader.uniforms[name].value = { sample :  media} ;
															},false)
															
														})(canvas,info.name)
													}
													canvas.gl.texImage2D(canvas.gl.TEXTURE_2D, 0, canvas.gl.RGBA, canvas.gl.RGBA, canvas.gl.UNSIGNED_BYTE, media);
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
												if(typeof val.href === 'string' && !IsVideo(val.href))
												{
													(function (shader,name)
													{
														var image = new Image();
														image.onload = function()
														{
															val.sample = image;
															shader.uniforms[name].value = val;
														};
														image.crossOrigin = '';
														image.src = val.href;
													})(canvas,info.name)
												}
												else
												{
													var sources = val.href
													if(typeof val.href === 'string')
														sources = [val.href];
													(function (shader,sources,name)
													{
														var video = document.createElement('video');
														video.autoplay = true;
														video.loop= true;
														["./assets/sintel.mp4", "./assets/sintel.ogv"].forEach(function(src)
														{
															var source = document.createElement('source');
															source.src = src;
															video.appendChild(source);
														})
														shader.addEventListener('frame',function()
														{
															shader.uniforms[name].value = { sample :  video} ;
														},false)
														
													})(canvas,sources,info.name)
												}
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
					
					case canvas.gl.SAMPLER_CUBE :
						var uniform = Object.create(Object.prototype,
						{ 
							type :  { value : "samplerCube", enumerable : true },
							textureIndex :  { value : canvas.textureCount++, enumerable : true },
							location :  { value : canvas.gl.getUniformLocation(canvas.shaderProgram, info.name),enumerable : true },
							value :  {  enumerable : true,
										get : function() { return this._value;},
										set : function (val)
										{
											this._value = val;
											canvas.gl.activeTexture(canvas.gl.TEXTURE0 + this.textureIndex);
											if(val.sample && val.sample.length==6)
											{
												if(typeof val.sample[0] === 'string' && document.getElementById(val.sample[0]))
												{
													for (var i = 0; i < 6; i++)
														gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById(val.sample[i]));
													canvas.needRender = true;
												}
												else
												{
													for (var i = 0; i < 6; i++)
														gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, val.sample[i]);
													canvas.needRender = true;
												}
											}
											else if(val.href && val.href.length==6)
											{
												val.sample = new Array(6);
												val.cubeCount = 0;
												for (var i = 0; i < 6; i++)
												(function (shader,cubeIndex,val,name)
												{
													var image = new Image();
													image.onload = function()
													{
														val.sample[cubeIndex] = image;
														val.cubeCount++;
														if(val.cubeCount == 6)
														{
															shader.uniforms[name].value = val;
														}
													};
													image.crossOrigin = '';
													image.src = val.href[i];
												})(canvas,i,val,info.name)
												
											}
											if(val.magFilter)
											{	
												canvas.gl.texParameteri(canvas.gl.TEXTURE_CUBE_MAP, canvas.gl.TEXTURE_MAG_FILTER, canvas.gl[val.magFilter]);
												canvas.needRender = true;
											}
											if(val.minFilter)
											{	
												canvas.gl.texParameteri(canvas.gl.TEXTURE_CUBE_MAP, canvas.gl.TEXTURE_MIN_FILTER, canvas.gl[val.minFilter]);
												canvas.needRender = true;
											}
											if(val.wrapS)
											{	
												canvas.gl.texParameteri(canvas.gl.TEXTURE_CUBE_MAP, canvas.gl.TEXTURE_WRAP_S, canvas.gl[val.wrapS]);
												canvas.needRender = true;
											}
											if(val.wrapT)
											{	
												canvas.gl.texParameteri(canvas.gl.TEXTURE_CUBE_MAP, canvas.gl.TEXTURE_WRAP_T, canvas.gl[val.wrapT]);
												canvas.needRender = true;
											}
										}
									}
						});
						canvas.uniforms[info.name] = uniform;
						canvas.gl.activeTexture(canvas.gl.TEXTURE0 + uniform.textureIndex);
						canvas.gl.bindTexture(canvas.gl.TEXTURE_CUBE_MAP, canvas.gl.createTexture());
						canvas.gl.texParameteri(canvas.gl.TEXTURE_CUBE_MAP, canvas.gl.TEXTURE_MAG_FILTER, canvas.gl.LINEAR);
						canvas.gl.texParameteri(canvas.gl.TEXTURE_CUBE_MAP, canvas.gl.TEXTURE_MIN_FILTER, canvas.gl.LINEAR);  
						canvas.gl.texParameteri(canvas.gl.TEXTURE_CUBE_MAP, canvas.gl.TEXTURE_WRAP_S, canvas.gl.CLAMP_TO_EDGE);
						canvas.gl.texParameteri(canvas.gl.TEXTURE_CUBE_MAP, canvas.gl.TEXTURE_WRAP_T, canvas.gl.CLAMP_TO_EDGE);
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
			var shader = shadertags[0];
			var canvas = document.createElement('canvas');
			(function(canvas,shader)
			{
				var errorElt;
				for (var i = 0; i < shader.children.length; i++) 
				{
					if(shader.children[i].hasAttribute("class") && shader.children[i].getAttribute("class").indexOf('ShaderElement-Error')>=0)
						errorElt = shader.children[i];
					shader.children[i].remove();
				}
				var initEvent = new CustomEvent('init', { 'detail': canvas });
				for(var i=0;i<shader.attributes.length;i++)
				{
					canvas.setAttribute(shader.attributes[i].nodeName,shader.attributes[i].value);
				}
				var shaderSource = shader.innerHTML;
				shader.parentNode.replaceChild(canvas,shader);
				
				canvas.gl =	canvas.getContext("webgl", { depth : false }) ||
							canvas.getContext("experimental-webgl", { depth : false });
				
				function DisplayError(txt)
				{
					var div = errorElt || document.createElement('div');
					for(var p in canvas.style)
						div.style[p] = canvas.style[p];
					if(!errorElt)
					{
						div.style.display = "inline-block";
						div.style.backgroundColor ="black";
						div.style.color ="red";
						div.style.textAlign = "center";
						div.innerHTML=txt;
					}
					canvas.parentNode.replaceChild(div,canvas);
				}
				
				if (!canvas.gl) 
				{
					console.error("This browser does not support WebGL!");
					DisplayError("This browser does not support WebGL!")
				}
				else
				{
					if(canvas.hasAttribute('src') && document.getElementById(canvas.getAttribute('src')))
					{
						if(InitShader(canvas,document.getElementById(canvas.getAttribute('src')).textContent))
							shader.dispatchEvent(initEvent);
						else
							DisplayError("An error occurred compiling this Shader")
					}
					else if(canvas.hasAttribute('src'))
					{
						
							var xhr = new XMLHttpRequest();
							xhr.onreadystatechange = function() 
							{
								if ( xhr.readyState == 4 ) 
								{
									if ( xhr.status == 200 || xhr.status == 0 ) 
									{
										if(InitShader(canvas,xhr.responseText))
											shader.dispatchEvent(initEvent);
										else
											DisplayError("An error occurred compiling this Shader")
									}		
									else if(InitShader(canvas,shaderSource))
										shader.dispatchEvent(initEvent);
									else
										DisplayError("An error occurred compiling this Shader")
								}
							};
							try
							{
								xhr.open( "GET", canvas.getAttribute('src'), true );
								xhr.send( null );
							} 
							catch (error)
							{
								console.error(error);
							}
						
					}
					else if(InitShader(canvas,shaderSource))
							shader.dispatchEvent(initEvent);
					else
							DisplayError("An error occurred compiling this Shader")
				}
			})(canvas,shader)
		}
					
		RenderLoop();
	});
	
	
	window.addEventListener("resize",function()
	{
		Shaders.forEach(function (shader)
		{
			if(shader.width != shader.scrollWidth || shader.height != shader.scrollHeight)
				shader.resizeShader();
		})
	},false)
	
	var StartTime = Date.now();
	var LastTime = null;
	
	function RenderLoop()
	{
		var event = new Event('frame');
		requestAnimationFrame(RenderLoop);
		var currentTime = (Date.now()-StartTime)/1000;
		for(var i=0;i<Shaders.length;i++)
		{	
			Shaders[i].dispatchEvent(event);
			if(Shaders[i].uniforms["time"])
				Shaders[i].uniforms.time.value = currentTime;
				
			if(Shaders[i].needRender)
			{
				Shaders[i].renderShader();	
			}
		}
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