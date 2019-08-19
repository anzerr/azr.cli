
const util = require('../util.js'),
	fs = require('fs.promisify'),
	color = require('console.color'),
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
		if (arg.is('compose')) {
			return util.exec('azr yaml docker-compose.json', {cwd: cwd}).then(() => {
				return util.exec('docker-compose up', {cwd: cwd});
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('dns')) {
			let dns = cli.get('dns') || '8.8.8.8';
			return util.exec('docker-machine ssh default "echo \\"search home\nnameserver ' + dns + '\\" | sudo tee /etc/resolv.conf > /dev/null"').then(() => {
				return util.exec('docker-machine ssh default "cat /etc/resolv.conf"');
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('build')) {
			return get(cwd).then((res) => {
				const user = cli.get('user') || 'anzerr',
					base = user + '/' + res.name + ':' + res.version;
				console.log(base);
				return util.exec('docker build --no-cache -t ' + base + ' .');
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('machine')) {
			return util.exec('docker-machine rm -f default && docker-machine create -d virtualbox --virtualbox-cpu-count "4" --virtualbox-memory 8192 --virtualbox-disk-size "32000" default', {cwd: cwd}).then(() => {
				console.log('eval $(docker-machine env default)');
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('tag')) {
			return get(cwd).then((res) => {
				const user = cli.get('user') || 'anzerr',
					registry = cli.get('registry') || 'none',
					base = user + '/' + res.name + ':' + res.version;
				console.log(base + ' ' + registry + '/' + base);
				return util.exec('docker tag ' + base + ' ' + registry + '/' + base);
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('push')) {
			return get(cwd).then((res) => {
				const user = cli.get('user') || 'anzerr',
					registry = cli.get('registry') || 'none',
					base = user + '/' + res.name + ':' + res.version;
				console.log('push ' + registry + '/' + base);
				return util.exec('docker push ' + registry + '/' + base);
			}).catch((err) => console.log(color.red(err)));
		}
		return get(cwd).then((res) => {
			const user = cli.get('user') || 'anzerr',
				base = user + '/' + res.name + ':' + res.version;
			console.log(base);
		}).catch((err) => console.log(color.red(err)));
	}
	return false;
};
