CJS=java -jar ../yuicompressor-2.4.7.jar


all: 
	@git.exe archive --output="master.tar" --format=tar --verbose remotes/origin/master
	@tar -xvf master.tar
	@del /F master.tar
	@$(CJS) src\ShaderElement.js -o ShaderElement.min.js --charset utf-8
