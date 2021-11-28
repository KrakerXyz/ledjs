import { parse } from '@babel/parser';
import { ClassDeclaration, ClassMethod, ExportDefaultDeclaration, ReturnStatement } from '@babel/types';

export function parseScript(script: string): ParseResult {

    try {
        const ast = parse(script, { sourceType: 'module' });

        const program = ast.program;

        const defaultExports = program.body.filter(b => b.type === 'ExportDefaultDeclaration');
        if (!defaultExports.length) {
            return {
                valid: false,
                errors: ['No default export found']
            };
        }

        if (defaultExports.length > 1) {
            //This shouldn't actually be possible
            return {
                valid: false,
                errors: ['More than one default export found']
            };
        }

        const defaultExport = defaultExports[0] as ExportDefaultDeclaration;
        if (defaultExport.declaration.type !== 'ClassDeclaration') {
            return {
                valid: false,
                errors: ['Default export is not a class']
            };
        }

        const errors: string[] = [];

        if (program.body.some(b => b.type !== 'ExportDefaultDeclaration' && b.type.includes('Export'))) {
            errors.push('More than one export found');
        }

        const classDeclaration = defaultExport.declaration as ClassDeclaration;

        const nextFrameMethod = classDeclaration.body.body.find(t => t.type === 'ClassMethod' && t.key.type === 'Identifier' && t.key.name === 'nextFrame') as ClassMethod | undefined;
        if (!nextFrameMethod) {
            errors.push('Class does not contain a nextFrame method');
        } else {

            if (nextFrameMethod.async) {
                errors.push('nextFrame method cannot be async');
            }

            const returnStatement = nextFrameMethod.body.body.find(b => b.type === 'ReturnStatement') as ReturnStatement;

            if (!returnStatement || !returnStatement.argument) {
                errors.push('nextFrame does not return anything');
            }

        }

        const setNumLedsMethod = classDeclaration.body.body.find(t => t.type === 'ClassMethod' && t.key.type === 'Identifier' && t.key.name === 'setNumLeds') as ClassMethod | undefined;

        if (!setNumLedsMethod) {
            errors.push('Class does not contain a setNumLeds method');
        } else {
            if (setNumLedsMethod.params.length !== 1) {
                errors.push('setNumLeds should have one parameter');
            }
        }

        if (errors.length) {
            return {
                valid: false,
                errors: errors as [string, ...string[]]
            };
        }

        return {
            valid: true
        };

    } catch (e: any) {
        return {
            valid: false,
            errors: ['Script parsing failed', e.toString()]
        };
    }

}

export type ParseResult = {
    valid: true
} | {
    valid: false;
    errors: [string, ...string[]];
}