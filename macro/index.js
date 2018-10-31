#!/usr/bin/env node

const {spawn} = require('child_process'),
	path = require('path');

class Util {

	constructor() {}

	exec(c, o) {
		return new Promise((resolve) => {
			const cmd = spawn('sh', ['-c', c], o);
			let data = [];
			cmd.stdout.on('data', (d) => {
				process.stdout.write(d);
				data.push(d);
			});
			cmd.stderr.pipe(process.stderr);
			cmd.on('close', (code) => {
			  	resolve(Buffer.concat(data));
			});
		});
	}

};

const [,, ...args] = process.argv, cwd = process.cwd(), util = new Util();

if (args[0] === 'commit') {
	return util.exec('git branch', {cwd: cwd}).then((res) => {
		let branch = res.toString().match(/\*\s(.*)/)[1];
		return util.exec('git add .', {cwd: cwd}).then(() => {
			return util.exec('git commit -m "fast save"', {cwd: cwd});
		}).then(() => {
			return util.exec('git push origin ' + branch, {cwd: cwd});
		});
	});
}

if (args[0] === 'bootstrap') {
	return util.exec(path.join(__dirname, './../project.sh').replace(/\\/g, '\\\\'));
}