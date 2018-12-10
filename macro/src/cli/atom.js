
const util = require('../util.js'),
	fs = require('fs.promisify');

module.exports = (arg, cwd) => {
	if (arg.is('atom')) {
		let key = Math.random().toString(36).substring(2), workdir = path.join(cwd, key);

		if (arg.is('backup')) {
			return util.exec('git clone git@github.com:anzerr/atom.config.git ' + key, {cwd: cwd}).then(async (res) => {
				let dir = (await util.exec('cd ~/.atom && pwd'))
					.toString()
					.trim()
					.replace(/^\/([a-z]){1}\/(.*)$/, "$1:/$2");

				let files = await fs.readdir(dir), wait = [];
				for (let i in files) {
					if (files[i].match(/^(.+?)\.(json|cson|coffee|less)$/)) {
						wait.push(fs.copyFile(path.join(dir, files[i]), path.join(key, files[i])));
					}
				}
				wait.push(util.exec('apm list --installed --bare > packages.list', {cwd: workdir}));
				return Promise.all(wait);
			}).then(() => {
				return util.exec('azr commit', {cwd: workdir});
			}).then(() => {
				return util.exec('rm -Rf ' + key, {cwd: cwd});
			}).then(() => {
				console.log('atom backup done');
			}).catch(console.log);
		}

		if (arg.is('restore')) {
			return util.exec('git clone git@github.com:anzerr/atom.config.git ' + key, {cwd: cwd}).then(async () => {
				let dir = (await util.exec('cd ~/.atom && pwd'))
					.toString()
					.trim()
					.replace(/^\/([a-z]){1}\/(.*)$/, "$1:/$2");

				let files = await fs.readdir(dir),wait = [];
				for (let i in files) {
					if (files[i].match(/^(.+?)\.(json|cson|coffee|less)$/)) {
						wait.push(fs.copyFile(path.join(key, files[i]), path.join(dir, files[i])));
					}
				}
				return Promise.all(wait);
			}).then(() => {
				return util.exec('apm install --packages-file packages.list', {cwd: workdir});
			}).then(() => {
				return util.exec('rm -Rf ' + key, {cwd: cwd});
			}).then(() => {
				console.log('restored atom');
			}).catch(console.log);
		}
	}
}
