
const util = require('../util.js');

module.exports = (arg, cwd) => {
	if (arg.is('commit')) {
		return util.exec('git branch', {cwd: cwd}).then((res) => {
			let branch = res.toString().match(/\*\s(.*)/);
			branch = (branch) ? branch[1] : 'master';

			return util.exec('git add .', {cwd: cwd}).then(() => {
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
