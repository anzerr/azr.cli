
const util = require('../util.js'),
	fs = require('fs.promisify'),
	path = require('path');

const type = {
	info: '🔧',
	feature: '✨',
	bug: '🐛',
	doc: '📚',
	perf: '🐎',
	test: '🚨',
	wip: '🚧'
};

module.exports = (arg, cwd, cli) => {
	if (arg.is('commit')) {
		return util.exec('git branch', {cwd: cwd}).then((res) => {
			let branch = res.toString().match(/\*\s(.*)/);
			branch = (branch) ? branch[1] : 'master';

			return fs.readFile(path.join(cwd, 'package.json')).then((json) => {
				let a = JSON.parse(json.toString());
				if (a.scripts && a.scripts.build && a.scripts.build.match(/^tsc/)) {
					if (a.scripts.clean) {
						return util.exec('npm run clean && npm run build', {cwd: cwd});
					}
					return util.exec('npm run build', {cwd: cwd});
				}
			}).catch(() => {}).then(() => {
				return util.exec('git add .', {cwd: cwd});
			}).then(() => {
				let name = arg.get() || 'dump',
					t = (cli.has('type') ? type[cli.get('type')] : '') || type.wip;
				return util.exec(`git commit -m "${t} ${name}"`, {cwd: cwd});
			}).then(() => {
				if (!cli.has('version')) {
					return util.exec('npm version patch', {cwd: cwd});
				}
				return Promise.resolve();
			}).then(() => {
				return util.exec(`git pull origin ${branch}`, {cwd: cwd});
			}).then(() => {
				return util.exec('git push origin --tags');
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
