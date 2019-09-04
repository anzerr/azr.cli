
const util = require('../util.js'),
	fs = require('fs.promisify'),
	color = require('console.color'),
	path = require('path');

let getPackage = (cwd) => {
	return fs.readFile(path.join(cwd, 'package.json')).then((res) => {
		return JSON.parse(res.toString());
	});
};

let nextVersion = (cwd) => {
	return getPackage(cwd).then((json) => {
		let version = json.version.split('.');
		version[version.length - 1] = Number(version[version.length - 1]) + 1;
		json.version = version.join('.');
		return json;
	});
};

let	scan = (dir, filter, out = []) => {
	if (filter && dir.match(filter)) {
		return Promise.resolve();
	}
	return fs.stat(dir).then(async (res) => {
		if (res.isDirectory()) {
			let list = await fs.readdir(dir), p = Promise.resolve();
			for (let i in list) {
				((file) => {
					p = p.then(() => scan(file, filter, out));
				})(path.join(dir, list[i]));
			}
			return p;
		}
		out.push(dir);
	}).then(() => out);
};

module.exports = (arg, cwd, cli) => {
	if (arg.is('npm')) {
		if (arg.is('used')) {
			const projectPath = path.join(cwd, cli.get('cwd') || '.');
			let pack = null;
			return getPackage(cwd).then((res) => {
				pack = res;
				const wait = [scan(projectPath, new RegExp(cli.get('filter') || 'node_modules'))];

				for (let i in pack.dependencies) {
					wait.push(scan(path.join(projectPath, `node_modules/${i}`)));
				}

				for (let i in pack.devDependencies) {
					wait.push(scan(path.join(projectPath, `node_modules/${i}`)));
				}

				return Promise.all(wait);
			}).then((res) => {
				return [].concat(...res);
			}).then((res) => {
				res = res.filter((a) => a.match(/\.(ts|js)$/));
				let out = {}, p = Promise.resolve();
				for (let i in res) {
					((file) => {
						p = p.then(() => {
							return fs.readFile(file);
						}).then((data) => {
							let list = (data.toString().match(/import(\s.*?\sfrom){0,1}\s('|")[@a-zA-Z0-9\._\-\\\/]+?('|")/g) || [])
								.concat((data.toString().match(/require\(('|")([@a-zA-Z0-9\._\-\\\/]+?)('|")\)/g) || []));
							for (let x in list) {
								if (list[x]) {
									try {
										let k = list[x].match(/('|")(.*?)('|")/)[2];
										if (!file.match(k)) {
											if (!out[k]) {
												out[k] = {
													count: 0,
													file: {}
												};
											}
											out[k].count += 1;
											out[k].file[file.replace(cwd, '').replace(/\\/g, '/')] = true;
										}
									} catch (e) {
									//
									}
								}
							}
						});
					})(res[i]);
				}
				return p.then(() => {
					return {pack: {dep: pack.dependencies, dev: pack.devDependencies}, imports: out};
				});
			}).then(({pack, imports}) => {
				for (let i in pack) {
					for (let x in pack[i]) {
						pack[i][x] = {count: 0, file: {}};
					}
				}
				for (let i in pack) {
					for (let x in pack[i]) {
						let reg = new RegExp(`^${x}($|(\\/|\\\\).*?)`);
						for (let v in imports) {
							if (v.match(/^\.{1,2}(\/|\\)/)) {
								continue;
							}
							if (v.match(reg)) {
								pack[i][x].count += imports[v].count;
								for (let y in imports[v].file) {
									pack[i][x].file[y] = imports[v].file[y];
								}
							}
						}
					}
				}
				console.log('\n------    dev    ------');
				for (let x in pack.dep) {
					let count = pack.dep[x].count, c = (a) => color[count ? 'green' : 'red'](a);
					console.log(x, c(pack.dep[x].count), count ? '\n' : '', c(Object.keys(pack.dep[x].file)));
				}
				console.log('\n------    dev    ------');
				for (let x in pack.dev) {
					let count = pack.dev[x].count, c = (a) => color[count ? 'green' : 'red'](a);
					console.log(x, c(pack.dev[x].count) + count ? '\n' : '', c(Object.keys(pack.dev[x].file)));
				}
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('version')) {
			return nextVersion(cwd).then((res) => {
				return fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify(res, null, '\t'));
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('update')) {
			return getPackage(cwd).then(async (res) => {
				let repo = (await util.exec('git remote get-url origin')).toString().slice(0, -1);
				repo = {
					ssl: repo,
					https: ('https://github.com/' + repo.split(':')[1]).replace(/\.git$/, '')
				};

				/* if (res.devDependencies && res.devDependencies.eslint) {
					res.devDependencies.eslint = '5.11.1';
				}*/
				res.repository = {
					type: 'git',
					url: repo.ssl
				};
				res.engines = {
					node: '>= 0.10.0'
				};
				if (!res.main) {
					res.main = 'index.js';
				}
				if (!res.types) {
					res.types = (res.main || 'index.js').replace(/\.js$/, '.d.ts');
				}
				if (!res.author) {
					res.author = 'anzerr';
				}
				if (!cli.has('simple')) {
					res.license = cli.get('license') || 'MIT';
				}
				res.bugs = {
					url: repo.https + '/issues'
				};
				res.homepage = repo.https + '#readme';
				console.log(res);
				if (!cli.has('simple')) {
					await util.exec(`azr license --type ${res.license}`, {cwd: cwd});
				}
				await fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify(res, null, '\t') + '\n');
			}).catch((err) => console.log(color.red(err)));
		}
		if (arg.is('push')) {
			return nextVersion(cwd).then((res) => {
				return util.exec([
					'azr npm version',
					cli.has('clean') ? 'rm -Rf node_modules package-lock.json && npm i' : 'echo "skip new lock"',
					'azr commit "update to version ' + res.version + '"'
				].join(' && '));
			}).catch((err) => console.log(color.red(err)));
		}
		return util.exec('rm -Rf node_modules package-lock.json && npm i' + (cli.has('dev') ? ' --only=dev' : ''));
	}
	return false;
};
