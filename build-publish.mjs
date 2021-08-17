
import { execSync } from 'child_process';
import * as fs from 'fs';
import ncp from 'ncp';

if (fs.existsSync('./build')) {
    console.log('Removing existing build folder')
    fs.rmSync('./build', { recursive: true, force: true });
}

console.log('Creating build folder');
fs.mkdirSync('./build');

//*

console.log('Building core');
execSync('npm run --prefix ./core build', { stdio: 'inherit' });

console.log('Building server')
execSync('npm run --prefix ./server build', { stdio: 'inherit' });

console.log('Building web');
execSync('npm run --prefix ./web build', { stdio: 'inherit' });

//*/

console.log('Copy server to build');
console.log('-- dist');
await new Promise((res, rej) => {
    ncp('./server/dist', './build/dist', e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('-- package.json');
await new Promise((res, rej) => {
    ncp('./server/package.json', './build/package.json', e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('-- package-lock.json');
await new Promise((res, rej) => {
    ncp('./server/package-lock.json', './build/package-lock.json', e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('-- node_module');
await new Promise((res, rej) => {
    ncp('./server/node_modules', './build/node_modules', { dereference: true /* Because of core */ }, e => {
        if (e) {
            console.error('Error copying node_modules', e);
            rej();
        } else {
            res();
        }
    });
});

//We can't yet enable this because it re-symlinks core and then for some reason, removes all the dependencies
// console.log('Pruning node_modules')
// execSync('npm prune --prefix ./build --production', { stdio: 'inherit' });

console.log('Copy web to build');
await new Promise((res, rej) => {
    ncp('./web/dist', './build/dist/.web', e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('Copy Dockerfile');
await new Promise((res, rej) => {
    ncp('./Dockerfile', './build/Dockerfile', e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('Building docker image');
await execSync('docker build -t joshkrak/netled .', { cwd: './build', stdio: 'inherit' });

console.log('Publishing docker image');
await execSync('docker push joshkrak/netled', { stdio: 'inherit' });