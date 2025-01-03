
import { execSync } from 'child_process';
import * as fs from 'fs';
import ncp from 'ncp';
import { tmpdir } from 'os';
import { join } from 'path';

const buildDir = join(tmpdir(), 'netled-build');
console.log(`Build directory: ${buildDir}`);

if (fs.existsSync(buildDir)) {
    console.log('Removing existing build folder')
    fs.rmSync(buildDir, { recursive: true, force: true });
}

console.log('Creating build folder');
fs.mkdirSync(buildDir);

console.log('Building server')
execSync('npm run --prefix ./server build', { stdio: 'inherit' });

console.log('Building web');
execSync('npm run --prefix ./web build', { stdio: 'inherit' });

//*/

console.log('Copy server to build');
console.log('-- dist');
await new Promise((res, rej) => {
    ncp('./server/dist', `${buildDir}/dist`, e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('-- package.json');
await new Promise((res, rej) => {
    ncp('./server/package.json', `${buildDir}/package.json`, e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('-- package-lock.json');
await new Promise((res, rej) => {
    ncp('./server/package-lock.json', `${buildDir}/package-lock.json`, e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('-- node_module');
await new Promise((res, rej) => {
    ncp('./server/node_modules', `${buildDir}/node_modules`, { dereference: true /* Because of core */ }, e => {
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
// execSync('npm prune --omit=dev', { cwd: buildDir, stdio: 'inherit' });

console.log('Copy web to build');
await new Promise((res, rej) => {
    ncp('./web/dist', `${buildDir}/dist/.web`, e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('Copy Dockerfile');
await new Promise((res, rej) => {
    ncp('./Dockerfile', `${buildDir}/Dockerfile`, e => {
        if (e) {
            rej();
        } else {
            res();
        }
    });
});

console.log('Building docker image');
await execSync('docker build -t joshkrak/netled .', { cwd: buildDir, stdio: 'inherit' });

console.log('Publishing docker image');
await execSync('docker push joshkrak/netled', { stdio: 'inherit' });