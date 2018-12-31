
const fs = require('fs.promisify'),
	YAML = require('json.to.yaml'),
	path = require('path');

module.exports = (arg, cwd) => {
	if (arg.is('yaml')) {
		let n = arg.get(), p = path.parse(n);
		return fs.readFile(path.join(cwd, n)).then((res) => {
			return fs.writeFile(path.join(cwd, p.name, '.yaml'), YAML.stringify(JSON.parse(res.toString())));
		}).catch(console.log);
	}
	return false;
};
