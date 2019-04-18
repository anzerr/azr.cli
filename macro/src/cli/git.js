
const util = require('../util.js'),
	fs = require('fs.promisify'),
	path = require('path');

module.exports = (arg, cwd) => {
	if (arg.is('commit')) {
		return util.exec('git branch', {cwd: cwd}).then((res) => {
			let branch = res.toString().match(/\*\s(.*)/);
			branch = (branch) ? branch[1] : 'master';

			return fs.readFile(path.join(cwd, 'package.json')).then((res) => {
				let a = JSON.parse(res.toString());
				if (a.scripts && a.scripts.build && a.scripts.build.match(/^tsc/)) {
					if (a.scripts.clean) {
						return util.exec('npm run clean && npm run build', {cwd: cwd});
					}
					return util.exec('npm run build', {cwd: cwd});
				}
			}).catch(() => {}).then(() => {
				return util.exec('git add .', {cwd: cwd});
			}).then(() => {
				let name = arg.get() || 'dump';
				return util.exec(`git commit -m "${name}"`, {cwd: cwd});
			}).then(() => {
				return util.exec(`git pull origin ${branch}`, {cwd: cwd});
			}).then(() => {
				return util.exec(`git push origin ${branch}`, {cwd: cwd});
			});
		}).catch(console.log);
	}

	if (arg.is('clone')) {
		let name = arg.get() || 'none', file = arg.next().get() || '';
		if (!name.match(/^(ssh:\/\/){0,1}git@/)) {
			console.log('WARNING CLONING A REPO WITHOUT SSH');
		}
		return util.exec(`git clone --recurse --progress --verbose ${name} ${file}`.trim(), {cwd: cwd}).catch(console.log);
	}

	if (arg.is('pull')) {
		return util.exec('git branch', {cwd: cwd}).then((res) => {
			let branch = res.toString().match(/\*\s(.*)/);
			branch = (branch) ? branch[1] : 'master';

			return util.exec(`git pull origin ${branch}`, {cwd: cwd});
		}).catch(console.log);
	}

	return false;
};
