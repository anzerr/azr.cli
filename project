npm init -f && \
	echo '' > README.md && \
	npm i -D eslint && \
	npm i -D git+ssh://git@github.com/anzerr/eslintrc.git && \
	node -e "let a = require('./package.json'); a.eslintConfig = {extends: 'eslint-config-basic'}; require('fs').writeFileSync('./package.json', JSON.stringify(a, null, '\t'));"
