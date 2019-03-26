npm init -f && \
	echo $'\n'"### \`Intro\`"$'\n' > README.md && \
	npm i -D eslint@5.11.1 && \
	npm i -D git+http://git@github.com/anzerr/eslintrc.git && \
	echo '' > index.js && \
	echo "node_modules"$'\n'"node_modules/*"$'\n'".tag*"$'\n' > .gitignore &&
	node -e "let a = require('./package.json'); a.eslintConfig = {extends: 'eslint-config-basic'}; require('fs').writeFileSync('./package.json', JSON.stringify(a, null, '\t'));" &&
	git init
