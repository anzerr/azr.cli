
const util = require('../util.js'),
	path = require('path');

module.exports = (arg, cwd) => {
	let bootstraps = ['node'];
	if (arg.is('bootstrap') || arg.is('bs')) {
		for (let i in bootstraps) {
	        if (arg.get() === bootstraps[i]) {
				let pp = path.join(__dirname, './../../../project/' + arg.get() + '.sh').replace(/\\/g, '\\\\');
				arg.next();
				if (arg.get()) {
					return util.exec('mkdir -p ' + arg.get(), {cwd: cwd}).then(() => {
						return util.exec(pp, {cwd: path.join(cwd, arg.get())});
					});
				}
	            return util.exec(pp);
	        }
	    }
	    return console.log('not valid project type "' + arg.get() + '" valid are', bootstraps.join(', '));
	}
}
