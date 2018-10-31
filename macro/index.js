#!/usr/bin/env node

const {spawn} = require('child_process');

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

console.log('cat', args, process.cwd());
if (args[0] === 'commit') {
	console.log('here');
	util.exec('git branch', {cwd: cwd}).then((res) => {
		let branch = res.toString().match(/\*\s(.*)/)[1];
		return util.exec('git add .').then(() => {
			return util.exec('git commit -m "fast save"');
		}).then(() => {
			return util.exec('git push origin ' + banch);
		});
	})
}