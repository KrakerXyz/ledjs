import { parse } from '@babel/parser';
import { ClassDeclaration, ClassMethod, ExportDefaultDeclaration } from '@babel/types';

export function parseScript(script: string): ParseResult {

    try {
        const ast = parse(script, { sourceType: 'module' });

        const program = ast.program;

        const exports = program.body.filter(b => b.type === 'ExportDefaultDeclaration');
        if (!exports.length) {
            return {
                valid: false,
                errors: ['No default export found']
            };
        }

        const defaultExport = exports[0] as ExportDefaultDeclaration;
        if (defaultExport.declaration.type !== 'ClassDeclaration') {
            return {
                valid: false,
                errors: ['Default export is not a class']
            };
        }


        const errors: string[] = [];

        const classDeclaration = defaultExport.declaration as ClassDeclaration;

        const nextFrameMethod = classDeclaration.body.body.find(t => t.type === 'ClassMethod' && t.key.type === 'Identifier' && t.key.name === 'nextFrame') as ClassMethod | undefined;
        if (!nextFrameMethod) {
            errors.push('Class does not contain a nextFrame method');
        } else {

            if (nextFrameMethod.async) {
                errors.push('nextFrame method cannot be async');
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