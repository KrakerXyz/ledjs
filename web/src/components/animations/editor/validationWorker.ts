//import { validateScript, parseAst } from '@krakerxyz/netled-core';


export interface ValidationWorkerMessage {
    name: 'validate',
    ts: string,
}

onmessage = async (e: MessageEvent<ValidationWorkerMessage>) => {

    if (e.data.name === 'validate') {

        //const ast = parseAst(e.data.ts);
        //const issues = validateScript(ast);
        //postMessage({ name: 'issues', issues: issues });
        
    }

};
