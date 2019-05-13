#!/usr/bin/env node

const {Cli, Map} = require('cli.util');

let cli = new Cli(process.argv, [
		new Map('cwd').alias(['c', 'C']).arg(),
		new Map('dns').alias(['n', 'N']).arg(),
		new Map('user').alias(['u', 'U']).arg(),
		new Map('registry').alias(['r', 'R']).arg(),
		new Map('type').alias(['t', 'T']).arg(),
		new Map('max').alias(['m', 'M']).arg(),
		new Map('host').alias(['h', 'H']).arg(),
		new Map('port').alias(['p', 'P']).arg(),
		new Map('dev').alias(['d', 'D']),
		new Map('version').alias(['v', 'V'])
	]), cwd = process.cwd();

let cmd = ['atom', 'bootstrap', 'git', 'docker', 'git', 'license', 'npm', 'slowloris', 'static', 'sync', 'yaml', 'key'];
for (let i in cmd) {
	let a = require('./src/cli/' + cmd[i] + '.js');
	if (a(cli.argument(), cwd, cli)) {
		return;
	}
}

let bootstraps = ['node'];
console.log([ // update this
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
