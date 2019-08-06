
const util = require('../util.js'),
	fs = require('fs.promisify'),
	color = require('console.color'),
	path = require('path');

let getPackage = (cwd) => {
	return fs.readFile(path.join(cwd, 'package.json')).then((res) => {
		return JSON.parse(res.toString());
	});
};

let nextVersion = (cwd) => {
	return getPackage(cwd).then((json) => {
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
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('update')) {
			return getPackage(cwd).then(async (res) => {
				let repo = (await util.exec('git remote get-url origin')).toString().slice(0, -1);
				repo = {
					ssl: repo,
					https: ('https://github.com/' + repo.split(':')[1]).replace(/\.git$/, '')
				};

				/* if (res.devDependencies && res.devDependencies.eslint) {
					res.devDependencies.eslint = '5.11.1';
				}*/
				res.repository = {
					type: 'git',
					url: repo.ssl
				};
				res.engines = {
					node: '>= 0.10.0'
				};
				if (!res.types) {
					res.types = res.main.replace(/\.js$/, '.d.ts');
				}
				res.author = 'anzerr';
				res.license = 'MIT';
				res.bugs = {
					url: repo.https + '/issues'
				};
				res.homepage = repo.https + '#readme';
				console.log(res);
				await util.exec('azr license --type MIT', {cwd: cwd});
				await fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify(res, null, '\t') + '\n');
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('push')) {
			return nextVersion(cwd).then((res) => {
				return util.exec([
					'azr npm version',
					cli.has('clean') ? 'rm -Rf node_modules package-lock.json && npm i' : 'echo "skip new lock"',
					'azr commit "update to version ' + res.version + '"'
				].join(' && '));
			}).catch((err) => console.log(color.red(err)));
		}
		return util.exec('rm -Rf node_modules package-lock.json && npm i' + (cli.has('dev') ? ' --only=dev' : ''));
	}
	return false;
};
