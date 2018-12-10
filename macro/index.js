#!/usr/bin/env node

const util = require('./src/util.js'),
	Cli = require('cli.util'),
	fs = require('fs.promisify');

let cli = new Cli(process.argv, {}), arg = null, cwd = process.cwd();

if (cli.argument().is('commit')) {
	return util.exec('git branch', {cwd: cwd}).then((res) => {
        let branch = res.toString().match(/\*\s(.*)/);
        branch = (branch) ? branch[1] : 'master';

        return util.exec('git add .', {cwd: cwd}).then(() => {
            return util.exec('git commit -m "fast save"', {cwd: cwd});
        }).then(() => {
            return util.exec('git push origin ' + branch, {cwd: cwd});
        });
    }).catch(console.log);
}

if (cli.argument().is('npm')) {
    return util.exec('rm -Rf node_modules package-lock.json && npm i');
}

let bootstraps = ['node'];
arg = cli.argument();
if (arg.is('bootstrap') || arg.is('bs')) {
	for (let i in bootstraps) {
        if (arg.get() === bootstraps[i]) {
			arg.next();
			let pp = path.join(__dirname, './../project/' + arg.get() + '.sh').replace(/\\/g, '\\\\');
			if (arg.get()) {
				return util.exec('mkdir ' + arg.get()).then(() => {
					return util.exec(pp, {cwd: arg.get()});
				});
			}
            return util.exec(pp);
        }
    }
    return console.log('not valid project type "' + arg.get() + '" valid are', bootstraps.join(', '));
}

arg = cli.argument();
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

console.log([
    'command:',
    '\tcommit',
	'\t  commit changes to with git\n',
    '\tnpm',
	'\t  remove node_modules and reinstall them\n',
    '\tbootstrap [' + bootstraps.join(', ') + ']',
	'\t  setup a clean project\n',
    '\tatom [backup, restore]',
	'\t  back up atomc config'
].join('\n'));