
const key = require('./key.js'),
	fs = require('fs.promisify'),
	path = require('path'),
	promise = require('promise.util'),
	remove = require('fs.remove'),
	is = require('type.util');

class Version {

	consturctor() {

	}

	package(cwd) {
		return fs.readFile(path.join(cwd, 'package.json')).then((res) => {
			return JSON.parse(res.toString());
		});
	}

	isLocked(src) {
		return fs.access(path.join(src, 'stash.version')).then(() => {
			return true;
		}).catch((err) => {
			return false;
		});
	}

	get(src) {
		return this.isLocked(src).then((lock) => {
			if (lock) {
				throw new Error('stash is present');
			}
			return fs.readdir(src);
		}).then((res) => {
			const map = {};
			return promise.each(res, (file) => {
				return this.package(path.join(src, file)).then((r) => {
					map[r.name] = {
						file: file,
						package: r,
						dependencies: r.dependencies
					};
				}).catch(() => {});
			}).then(() => map);
		}).then((res) => {
			const store = [];
			for (let i in res) {
				store.push({file: res[i].file, dependencies: {...res[i].dependencies}});
				for (let x in res[i].dependencies) {
					if (res[x]) {
						res[i].dependencies[x] = `file:../${res[x].file}`;
					}
				}
			}
			return promise.each(res, (data) => {
				data.package.dependencies = data.dependencies;
				return fs.writeFile(path.join(src, data.file + '/package.json'), JSON.stringify(data.package, null, '\t'));
			}).then(() => {
				return fs.writeFile(path.join(src, 'stash.version'), JSON.stringify(store, null, '\t'));
			});
		});
	}

	restore(src) {
		return fs.readFile(path.join(src, 'stash.version')).then((res) => {
			return JSON.parse(res.toString());
		}).then((res) => {
			return promise.each(res, (file) => {
				return this.package(path.join(src, file.file)).then((r) => {
					r.dependencies = file.dependencies;
					return fs.writeFile(path.join(src, file.file + '/package.json'), JSON.stringify(r, null, '\t'));
				});
			});
		}).then(() => {
			return remove(path.join(src, 'stash.version'));
		});
	}

}

module.exports = (src, restore) => {
	const v = new Version();
	return restore ? v.restore(src) : v.get(src);
};
