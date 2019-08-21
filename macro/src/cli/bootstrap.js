
const util = require('../util.js'),
	path = require('path');

module.exports = (arg, cwd) => {
	let bootstraps = ['node', 'ts'];
	if (arg.is('bootstrap') || arg.is('bs')) {
		if (arg.get() === 'api') {
			arg.next();
			let pp = [
				'git clone git@github.com:anzerr/template.api.git .',
				'rm -Rf dist .git package-lock.json && git init',
				`node -e "let a = require('./package.json'); a.name = '${arg.get() || 'tmp'}'; a.version = '1.0.0'; require('fs').writeFileSync('./package.json', JSON.stringify(a, null, '\t'));"`,
				'npm i'
			].join(' && ');
			if (arg.get()) {
				return util.exec('mkdir -p ' + arg.get(), {cwd: cwd}).then(() => {
					return util.exec(pp, {cwd: path.join(cwd, arg.get())});
				}).then(() => {
					return util.exec('azr npm update', {cwd: path.join(cwd, arg.get())});
				});
			}
			return util.exec(pp).then(() => {
				return util.exec('azr npm update', {cwd: path.join(cwd, arg.get())});
			});
		}
		for (let i in bootstraps) {
			if (arg.get() === bootstraps[i]) {
				let pp = path.join(__dirname, './../../../project/' + arg.get() + '.sh').replace(/\\/g, '\\\\');
				arg.next();
				if (arg.get()) {
					return util.exec('mkdir -p ' + arg.get(), {cwd: cwd}).then(() => {
						return util.exec(pp, {cwd: path.join(cwd, arg.get())});
					});
				}
				return util.exec(pp);
			}
		}
		return console.log('not valid project type "' + arg.get() + '" valid are', bootstraps.join(', '));
	}
	return false;
};
