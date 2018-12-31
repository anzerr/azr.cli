
const sync = require('sync.folder'),
	path = require('path');

module.exports = (arg, cwd, cli) => {
	if (arg.is('sync')) {
		if (arg.is('client')) {
			let client = new sync.Client(path.join(cwd, cli.get('cwd')), cli.has('host') ? cli.get('host') : 'localhost:5935');
			client.on('remove', (r) => console.log('removed', r));
			client.on('add', (r) => console.log('add', r));
			return true;
		}

		let server = new sync.Server(path.join(cwd, cli.get('cwd')), cli.has('host') ? cli.get('host') : '0.0.0.0:5935');
		server.on('remove', (r) => console.log('removed', r));
		server.on('add', (r) => console.log('add', r));
		return true;
	}
	return false;
};
