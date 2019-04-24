
const key = require('unique.util');

const type = {
	long: () => key.long(),
	number: () => key.number(),
	random: () => key.random(),
	plain: () => key.plain(),
	short: () => key.short(),
	simple: () => key.simple(),
	token: () => `@T${key.short()}-${key.plain()}`
};

module.exports = (arg, cwd, cli) => {
	if (arg.is('key')) {
		let t = cli.get('type') || 'token';
		if (!type[t]) {
			throw new Error('not a valid type given');
		}
		console.log(type[t]());
		return true;
	}
	return false;
};
