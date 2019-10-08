
const key = require('./key.js'),
	is = require('type.util');

module.exports = (package) => {
	let out = {};
	for (let i in key) {
		if (package[key[i]]) {
			out[key[i]] = package[key[i]];
			if (is.array(out[key[i]])) {
				out[key[i]] = out[key[i]].sort();
			}
		}
	}
	for (let i in package) {
		if (!out[i]) {
			out[i] = package[i];
			if (is.array(out[key[i]])) {
				out[key[i]] = out[key[i]].sort();
			}
		}
	}
	return out;
};
