
const util = require('../util.js'),
	fs = require('fs.promisify'),
	path = require('path');

const get = (cwd) => {
	return fs.readFile(path.join(cwd, 'package.json')).then((res) => {
		let json = JSON.parse(res.toString()),
			name = (json.name.match(/\/(.*?)$/) || json.name.match(/(.*?)$/))[1].replace(/[^a-zA-A0-9\-_]/g, '-');
		return {version: json.version, name: name};
	});
};

module.exports = (arg, cwd, cli) => {
	if (arg.is('docker')) {
		if (arg.is('build')) {
			return get(cwd).then((res) => {
				const user = cli.get('user') || 'anzerr',
					base = user + '/' + res.name + ':' + res.version;
				console.log(base);
				return util.exec('docker build --no-cache -t ' + base + ' .');
			}).catch(console.log);
		}
		if (arg.is('tag')) {
			return get(cwd).then((res) => {
				const user = cli.get('user') || 'anzerr',
					registry = cli.get('registry') || 'none',
					base = user + '/' + res.name + ':' + res.version;
				console.log(base + ' ' + registry + '/' + base);
				return util.exec('docker tag ' + base + ' ' + registry + '/' + base);
			}).catch(console.log);
		}
		if (arg.is('push')) {
			return get(cwd).then((res) => {
				const user = cli.get('user') || 'anzerr',
					registry = cli.get('registry') || 'none',
					base = user + '/' + res.name + ':' + res.version;
				console.log('push ' + registry + '/' + base);
				return util.exec('docker push ' + registry + '/' + base);
			}).catch(console.log);
		}
	}
	return false;
};
