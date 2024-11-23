
# Testing isolated-vm
```ts
import Isolate from 'isolated-vm';
import { netledGlobal } from '../../core/src/netledGlobal.js';

const cjsScriptParts = [
    `const netled = { animation: { ${netledGlobal.animation.defineAnimation.toString()} }};`,
    seg.js.replace('export default', 'const cls =') + ';\n'
] 

const cjsScript = cjsScriptParts.join('\n');

logger.info('Loading isolate');
const isolate = new Isolate.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();

const script = await isolate.compileScript(cjsScript);
script.runSync(context);

const services = context.evalSync('JSON.stringify(cls.services)');
console.log(services);
```