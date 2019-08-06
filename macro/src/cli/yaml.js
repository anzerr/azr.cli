
const fs = require('fs.promisify'),
	YAML = require('json.to.yaml'),
	color = require('console.color'),
	path = require('path');

module.exports = (arg, cwd) => {
	if (arg.is('yaml')) {
		let n = arg.get(), p = path.parse(n);
		return fs.readFile(path.join(cwd, n)).then((res) => {
			return fs.writeFile(path.join(cwd, `${p.name}.yaml`), YAML.stringify(JSON.parse(res.toString())));
		}).catch((err) => console.log(color.red(err)));
	}
	return false;
};
