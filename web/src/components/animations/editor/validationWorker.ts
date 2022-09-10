import { parseAsAst, type AstTypes } from '@krakerxyz/netled-core';
import { CodeIssue } from './monacoEditor';

export type ValidationWorkerMessage = {
    name: 'validate',
    ts: string
}

onmessage = async (e: MessageEvent<ValidationWorkerMessage>) => {

    if (e.data.name === 'validate') {

        try {
            const ast = parseAsAst(e.data.ts, { sourceType: 'module', plugins: ['typescript'] });

            const defaultExport = ast.program.body.find(x => x.type === 'ExportDefaultDeclaration') as AstTypes.ExportDefaultDeclaration;
            if (!defaultExport) {
                postMessage({ name: 'issues', issues: [createIssue('Missing default export', 'error', null)] });
                return;
            }

            if (defaultExport.declaration.type !== 'ClassDeclaration') {
                postMessage({ name: 'issues', issues: [createIssue('Expected default export to be a class', 'error', defaultExport.loc)] });
                return;
            }

            const issues: CodeIssue[] = [];

            const cls = defaultExport.declaration as AstTypes.ClassDeclaration;
            if (!cls.implements?.some(x =>
                x.type === 'TSExpressionWithTypeArguments'
                && x.expression.type === 'TSQualifiedName'
                && x.expression.left.type === 'Identifier'
                && x.expression.left.name === 'netled'
                && x.expression.right.type === 'Identifier'
                && x.expression.right.name === 'IAnimationScript')
            ) {
                issues.push(createIssue('Class should implement netled.IAnimationScript', 'warning', cls.loc));
            }

            const classBody = (defaultExport.declaration as AstTypes.ClassDeclaration).body;

            const constructor = classBody.body.find(x => x.type === 'ClassMethod' && x.kind === 'constructor') as AstTypes.ClassMethod;
            if (!constructor) {
                issues.push(createIssue('Class constructor not found', 'error', classBody.loc));
            } else {
                if (!constructor.params.length) {
                    issues.push(createIssue('ILedArray missing from constructor parameters', 'error', constructor.key.loc));
                }
            }

            const interfaceMethods = ['run', 'pause'];
            const missing = interfaceMethods.filter(x => !classBody.body.some(n => n.type === 'ClassMethod' && n.key.type === 'Identifier' && n.key.name === x));
            if (missing.length) {
                issues.push(...missing.map(x => createIssue(`Missing method '${x}'`, 'error', classBody.loc)));
            }

            if (issues.length) {
                postMessage({ name: 'issues', issues });
            }

            console.log('Parsed ast', defaultExport);

        } catch (e: any) {
            // Probably a script error. Just ignore it
            //console.error(`Error validating script: ${e.message ?? e.toString()}`, e);
        }
    }

};

function createIssue(message: string, severity: 'error' | 'warning', loc: AstTypes.SourceLocation | null | undefined): CodeIssue {
    return {
        line: loc?.start.line ?? 0,
        col: loc?.start.column ?? 0,
        severity,
        message
    };
}
