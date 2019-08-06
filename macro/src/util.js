
const {spawn} = require('child_process'),
	color = require('console.color');

class Util {

	constructor() {}

	exec(c, o) {
		console.log(color.yellow(c));
		return new Promise((resolve) => {
			const cmd = spawn('sh', ['-c', c], o);
			let data = [];
			cmd.stdout.on('data', (d) => {
				process.stdout.write(color.white(d.toString()));
				data.push(d);
			});
			cmd.stderr.on('data', (d) => {
				process.stderr.write(color.red(d.toString()));
			});
			cmd.on('error', (e) => {
				throw e;
			});
			cmd.on('close', () => {
				resolve(Buffer.concat(data));
			});
		});
	}

}

module.exports = new Util();
