
const util = require('../util.js');

module.exports = (arg) => {
	if (arg.is('npm')) {
		return util.exec('rm -Rf node_modules package-lock.json && npm i');
	}
	return false;
};
