
const util = require('../util.js'),
	fs = require('fs.promisify'),
	path = require('path'),
	YAML = require('json.to.yaml');

const get = (cwd) => {
	return fs.readFile(path.join(cwd, 'package.json')).then((res) => {
		let json = JSON.parse(res.toString()),
			name = (json.name.match(/\/(.*?)$/) || json.name.match(/(.*?)$/))[1].replace(/[^a-zA-A0-9\-_]/g, '-');
		return {version: json.version, name: name};
	});
};

module.exports = (arg, cwd, cli) => {
	if (arg.is('docker')) {
		if (arg.is('compose')) {
			return fs.readFile(path.join(cwd, 'docker-compose.json')).then((res) => {
				return fs.writeFile(path.join(cwd, 'docker-compose.yaml'), YAML.stringify(JSON.parse(res.toString())));
			}).then(() => {
				return util.exec('docker-compose up', {cwd: cwd});
			}).catch(console.log);
		}
		if (arg.is('dns')) {
			let dns = cli.get('dns') || '8.8.8.8';
			return util.exec('docker-machine ssh default "echo \\"search home\nnameserver ' + dns + '\\" | sudo tee /etc/resolv.conf > /dev/null"').then(() => {
				return util.exec('docker-machine ssh default "cat /etc/resolv.conf"');
			}).catch(console.log);
		}
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
		return get(cwd).then((res) => {
			const user = cli.get('user') || 'anzerr',
				base = user + '/' + res.name + ':' + res.version;
			console.log(base);
		}).catch(console.log);
	}
	return false;
};
