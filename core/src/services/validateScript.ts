import type {  ParseResult } from '@babel/parser';
import type * as AstTypes from '@babel/types';

export function validateScript(ast: ParseResult<AstTypes.File>): CodeIssue[] {

    const codeIssues: CodeIssue[] = [];
        
    try {

        const defaultExport = ast.program.body.find(x => x.type === 'ExportDefaultDeclaration') as AstTypes.ExportDefaultDeclaration;
        if (!defaultExport) {
            return [createIssue('Missing default export', 'error', null)];
        }

        if (defaultExport.declaration.type !== 'ClassDeclaration') {
            return [createIssue('Expected default export to be a class', 'error', defaultExport.loc)];
        }

        const cls = defaultExport.declaration as AstTypes.ClassDeclaration;
        if (!cls.implements?.some(x =>
            x.type === 'TSExpressionWithTypeArguments'
                && x.expression.type === 'TSQualifiedName'
                && x.expression.left.type === 'Identifier'
                && x.expression.left.name === 'netled'
                && x.expression.right.type === 'Identifier'
                && x.expression.right.name === 'IAnimationScript')
        ) {
            codeIssues.push(createIssue('Class should implement netled.IAnimationScript', 'warning', cls.loc));
        }

        const classBody = (defaultExport.declaration as AstTypes.ClassDeclaration).body;

        const constructor = classBody.body.find(x => x.type === 'ClassMethod' && x.kind === 'constructor') as AstTypes.ClassMethod;
        if (!constructor) {
            codeIssues.push(createIssue('Class constructor not found', 'error', classBody.loc));
        } else {
            if (!constructor.params.length) {
                codeIssues.push(createIssue('ILedSegment missing from constructor parameters', 'error', constructor.key.loc));
            }
        }

        const interfaceMethods = ['run', 'pause'];
        const missing = interfaceMethods.filter(x => !classBody.body.some(n => n.type === 'ClassMethod' && n.key.type === 'Identifier' && n.key.name === x));
        if (missing.length) {
            codeIssues.push(...missing.map(x => createIssue(`Missing method '${x}'`, 'error', classBody.loc)));
        }

        // not sure what postMessage was used for. After the upgrade, it was causing build errors
        // if (codeIssues.length) {
        //     postMessage({ name: 'issues', codeIssues });
        // }

    } catch {
        // Probably a script error. Just ignore it
        //console.error(`Error validating script: ${e.message ?? e.toString()}`, e);
    }

    return codeIssues;
}


function createIssue(message: string, severity: 'error' | 'warning', loc: AstTypes.SourceLocation | null | undefined): CodeIssue {
    return {
        line: loc?.start.line ?? 0,
        col: loc?.start.column ?? 0,
        severity,
        message
    };
}

export interface CodeIssue {
    severity: 'error' | 'warning',
    line: number,
    col: number,
    message: string,
}