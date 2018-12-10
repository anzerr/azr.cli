
const util = require('../util.js');

module.exports = (arg, cwd) => {
	let bootstraps = ['node'];
	if (arg.is('bootstrap') || arg.is('bs')) {
		for (let i in bootstraps) {
	        if (arg.get() === bootstraps[i]) {
				arg.next();
				let pp = path.join(__dirname, './../project/' + arg.get() + '.sh').replace(/\\/g, '\\\\');
				if (arg.get()) {
					return util.exec('mkdir ' + arg.get()).then(() => {
						return util.exec(pp, {cwd: arg.get()});
					});
				}
	            return util.exec(pp);
	        }
	    }
	    return console.log('not valid project type "' + arg.get() + '" valid are', bootstraps.join(', '));
	}
}
