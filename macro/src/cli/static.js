
const Server = require('static.http');

module.exports = (arg, cwd, cli) => {
	if (arg.is('yaml')) {
		return new Server(Number(cli.get('port') || 3000), cli.get('cwd') || cwd)
			.on('log', console.log)
			.create().then(() => {
				console.log('Server started');
			});
	}
	return false;
};
