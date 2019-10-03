
const util = require('../util.js'),
	fs = require('fs.promisify'),
	color = require('console.color'),
	path = require('path'),
	promise = require('promise.util');

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

			let package = false, changes = [], updated = {};
			return fs.readFile(path.join(cwd, 'package.json')).then((json) => {
				package = true;
				let a = JSON.parse(json.toString());
				if (a.scripts && a.scripts.build && a.scripts.build.match(/tsc/)) {
					if (a.scripts.clean) {
						return util.exec('npm run clean && npm run build', {cwd: cwd});
					}
					return util.exec('npm run build', {cwd: cwd});
				}
			}).catch(() => {}).then(() => {
				return util.exec('git diff --name-only HEAD', {cwd: cwd});
			}).then((r) => {
				changes = r.toString().split('\n');
				for (let i in changes) {
					if (changes[i].match(/^package(-lock)*\.json$/)) {
						updated.dep = true;
					}
					if (changes[i].match(/\.(js|ts)$/)) {
						updated.code = true;
					}
				}

				return util.exec('git add .', {cwd: cwd});
			}).then(() => {
				let name = arg.get() || (updated.dep && !updated.code ? 'update dependency' : 'dump'),
					t = (cli.has('type') ? type[cli.get('type')] : '') || type.wip;
				return util.exec(`git commit -m "${t} ${name}"`, {cwd: cwd});
			}).then(() => {
				if (!cli.has('version') && package && (updated.code || updated.dep)) {
					return util.exec('npm version patch', {cwd: cwd});
				}
				return Promise.resolve();
			}).then(() => {
				return util.exec(`git pull origin ${branch}`, {cwd: cwd});
			}).then(() => {
				return util.exec(`git push origin ${branch}`, {cwd: cwd});
			}).then(() => {
				return util.exec('git push origin --tags');
			});
		}).catch((err) => console.log(color.red(err)));
	}

	if (arg.is('sub')) {
		return fs.readFile('.gitmodules').then((res) => {
			let modules = res.toString().match(/submodule\s"(.*)"/g).map((r) => {
				return r.match(/submodule\s"(.*)"/)[1];
			});

			if (cli.has('filter')) {
				const filter = cli.get('filter');
				modules = modules.filter((a) => a.match(filter));
			}

			const cmd = arg.get();
			console.log('run on', modules, cmd);
			return promise.each(modules, (m) => {
				return util.exec(cmd, {
					cwd: path.join(cwd, m)
				}).catch((err) => console.log(color.red(err)));
			}, cli.get('count'));
		});
	}

	if (arg.is('clone')) {
		let name = arg.get() || 'none', file = arg.next().get() || '';
		if (!name.match(/^(ssh:\/\/){0,1}git@/)) {
			console.log('WARNING CLONING A REPO WITHOUT SSH');
		}
		return util.exec(`git clone --recurse --progress --verbose ${name} ${file}`.trim(), {cwd: cwd}).catch((err) => console.log(color.red(err)));
	}

	if (arg.is('pull')) {
		return util.exec('git branch', {cwd: cwd}).then((res) => {
			let branch = res.toString().match(/\*\s(.*)/);
			branch = (branch) ? branch[1] : 'master';

			return util.exec(`git pull origin ${branch}`, {cwd: cwd});
		}).catch((err) => console.log(color.red(err)));
	}

	return false;
};
