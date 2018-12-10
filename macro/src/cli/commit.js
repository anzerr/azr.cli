
const util = require('../util.js');

module.exports = (arg, cwd) => {
	if (arg.is('commit')) {
		return util.exec('git branch', {cwd: cwd}).then((res) => {
	        let branch = res.toString().match(/\*\s(.*)/);
	        branch = (branch) ? branch[1] : 'master';

	        return util.exec('git add .', {cwd: cwd}).then(() => {
	            return util.exec('git commit -m "fast save"', {cwd: cwd});
	        }).then(() => {
	            return util.exec('git push origin ' + branch, {cwd: cwd});
	        });
	    }).catch(console.log);
	}
}