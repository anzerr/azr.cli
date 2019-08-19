npm init -f && \
	curl -o README.md https://raw.githubusercontent.com/anzerr/azr.cli/master/template/README.md && \
	curl -o .gitignore https://raw.githubusercontent.com/anzerr/azr.cli/master/template/.gitignore && \
	curl -o tsconfig.json https://raw.githubusercontent.com/anzerr/azr.cli/master/template/tsconfig.json && \
	npm i -D git+https://git@github.com/anzerr/eslint-config-typescript.git && \
	npm i -D @types/node ts-node typescript && \
	npm i -P reflect-metadata && \
	echo '' > index.ts && \
	node -e "let a = require('./package.json'); \
		a.scripts = { \
			build: 'tsc -p ./', \
			clean: 'find ./src -regex \".*\\.\\(js\\|map\\|d\\.ts\\)\" -type f -delete && rm -Rf ./dist' \
		}; \
		a.main = 'dist/index.js'; \
		a.eslintConfig = {extends: 'eslint-config-typescript'}; \
		require('fs').writeFileSync('./package.json', JSON.stringify(a, null, '\t'));" &&
	git init
