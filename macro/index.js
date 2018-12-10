#!/usr/bin/env node

const {
    spawn
} = require('child_process'),
    path = require('path'),
    fs = require('fs'),
    u = require('util');

class Util {

    constructor() {}

    exec(c, o) {
        return new Promise((resolve) => {
            const cmd = spawn('sh', ['-c', c], o);
            let data = [];
            cmd.stdout.on('data', (d) => {
                process.stdout.write(d);
                data.push(d);
            });
            cmd.stderr.pipe(process.stderr);
            cmd.on('error', (e) => {
                throw e;
            });
            cmd.on('close', (code) => {
                resolve(Buffer.concat(data));
            });
        });
    }

    copy(a, b) {
        return u.promisify(fs.copyFile)(a, b);
    }

    ls(a) {
        return u.promisify(fs.readdir)(a);
    }

};

const [, , ...args] = process.argv, cwd = process.cwd(), util = new Util();

if (args[0] === 'commit') {
    return util.exec('git branch', {
        cwd: cwd
    }).then((res) => {
        let branch = res.toString().match(/\*\s(.*)/);
        branch = (branch) ? branch[1] : 'master';
        return util.exec('git add .', {
            cwd: cwd
        }).then(() => {
            return util.exec('git commit -m "fast save"', {
                cwd: cwd
            });
        }).then(() => {
            return util.exec('git push origin ' + branch, {
                cwd: cwd
            });
        });
    }).catch(console.log);
}

if (args[0] === 'npm') {
    return util.exec('rm -Rf node_modules package-lock.json && npm i');
}

let bootstraps = ['node'];
if (args[0] === 'bootstrap') {
    for (let i in bootstraps) {
        if (args[1] === bootstraps[i]) {
            return util.exec(path.join(__dirname, './../project/' + args[1] + '.sh').replace(/\\/g, '\\\\'));
        }
    }
    return console.log('not valid project type "' + args[1] + '" valid are', bootstraps.join(', '));
}

if (args[0] === 'atom') {
    let key = Math.random().toString(36).substring(2),
        workdir = path.join(cwd, key);
    if (args[1] === 'backup') {
        return util.exec('git clone git@github.com:anzerr/atom.config.git ' + key, {
            cwd: cwd
        }).then(async (res) => {
            let dir = (await util.exec('cd ~/.atom && pwd'))
                .toString()
                .trim()
                .replace(/^\/([a-z]){1}\/(.*)$/, "$1:/$2");
            let files = await util.ls(dir),
                wait = [];
            for (let i in files) {
                if (files[i].match(/^(.+?)\.(json|cson|coffee|less)$/)) {
                    wait.push(util.copy(path.join(dir, files[i]), path.join(key, files[i])));
                }
            }
            wait.push(util.exec('apm list --installed --bare > packages.list', {
                cwd: workdir
            }));
            return Promise.all(wait);
        }).then(() => {
            return util.exec('azr commit', {
                cwd: workdir
            });
        }).then(() => {
            return util.exec('rm -Rf ' + key, {
                cwd: cwd
            });
        }).then(() => {
            console.log('atom backup done');
        }).catch(console.log);
    }
    if (args[1] === 'restore') {
        return util.exec('git clone git@github.com:anzerr/atom.config.git ' + key, {
            cwd: cwd
        }).then(async () => {
            let dir = (await util.exec('cd ~/.atom && pwd'))
                .toString()
                .trim()
                .replace(/^\/([a-z]){1}\/(.*)$/, "$1:/$2");
            let files = await util.ls(dir),
                wait = [];
            for (let i in files) {
                if (files[i].match(/^(.+?)\.(json|cson|coffee|less)$/)) {
                    wait.push(util.copy(path.join(key, files[i]), path.join(dir, files[i])));
                }
            }
            return Promise.all(wait);
        }).then(() => {
            return util.exec('apm install --packages-file packages.list', {
                cwd: workdir
            });
        }).then(() => {
            return util.exec('rm -Rf ' + key, {
                cwd: cwd
            });
        }).then(() => {
            console.log('restored atom');
        }).catch(console.log);
    }
}

console.log([
    'command:',
    '\tcommit',
	'\t  commit changes to with git\n',
    '\tnpm',
	'\t  remove node_modules and reinstall them\n',
    '\tbootstrap [' + bootstraps.join(', ') + ']',
	'\t  setup a clean project\n',
    '\tatom [backup, restore]',
	'\t  back up atomc config'
].join('\n'));