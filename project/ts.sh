npm init -f && \
	curl -o README.md https://raw.githubusercontent.com/anzerr/azr.cli/master/template/README.md && \
	curl -o .gitignore https://raw.githubusercontent.com/anzerr/azr.cli/master/template/.gitignore && \
	curl -o tsconfig.json https://raw.githubusercontent.com/anzerr/azr.cli/master/template/tsconfig.json && \
	curl -o tslint.json https://raw.githubusercontent.com/anzerr/azr.cli/master/template/tslint.json && \
	npm i -D git+https://git@github.com/anzerr/eslintrc.git && \
	npm i -D eslint && \
	npm i -D tslint && \
	npm i -D tslint-config-airbnb && \
	npm i -D ts-node && \
	npm i -D typescript && \
	npm i -P reflect-metadata && \
	echo '' > index.ts && \
	node -e "let a = require('./package.json'); \
		a.scripts = { \
			build: 'tsc -p ./', \
			clean: 'find ./src -regex \".*\\.\\(js\\|map\\|d\\.ts\\)\" -type f -delete && rm -Rf ./dist' \
		}; \
		a.main = 'dist/index.js'; \
		a.eslintConfig = {extends: 'eslint-config-basic'}; \
		require('fs').writeFileSync('./package.json', JSON.stringify(a, null, '\t'));" &&
	git init
