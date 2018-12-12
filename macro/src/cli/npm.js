
const util = require('../util.js'),
	fs = require('fs.promisify'),
	path = require('path');

let nextVersion = (cwd) => {
	return fs.readFile(path.join(cwd, 'package.json')).then((res) => {
		let json = JSON.parse(res.toString());
		let version = json.version.split('.');
		version[version.length - 1] = Number(version[version.length - 1]) + 1;
		json.version = version.join('.');
		return json;
	});
};

module.exports = (arg, cwd, cli) => {
	if (arg.is('npm')) {
		if (arg.is('version')) {
			return nextVersion(cwd).then((res) => {
				return fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify(res, null, '\t'));
			}).catch(console.log);
		}
		if (arg.is('push')) {
			return nextVersion(cwd).then((res) => {
				return util.exec([
					'azr npm version',
					cli.has('clean') ? 'rm -Rf node_modules package-lock.json && npm i' : 'echo "skip new lock"',
					'azr commit "update to version ' + res.version + '"'
				].join(' && '));
			}).catch(console.log);
		}
		return util.exec('rm -Rf node_modules package-lock.json && npm i');
	}
	return false;
};
