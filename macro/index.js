#!/usr/bin/env node

const Cli = require('cli.util');

let cli = new Cli(process.argv, {}), cwd = process.cwd();

let cmd = ['atom', 'bootstrap', 'git', 'docker', 'git', 'license', 'npm', 'slowloris', 'static', 'sync', 'yaml'];
for (let i in cmd) {
	let a = require('./src/cli/' + cmd[i] + '.js');
	if (a(cli.argument(), cwd, cli)) {
		return;
	}
}

let bootstraps = ['node'];
console.log([
	'command:',
	'\tcommit',
	'\t  commit changes to with git\n',
	'\tnpm',
	'\t  remove node_modules and reinstall them\n',
	'\tbootstrap [' + bootstraps.join(', ') + ']',
	'\t  setup a clean project\n',
	'\tatom [backup, restore]',
	'\t  back up atomc config\n',
	'\tdocker [build]',
	'\t  docker macros'
].join('\n'));
