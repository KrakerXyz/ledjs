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

        const classDeclaration = defaultExport.declaration as ClassDeclaration;

        const nextFrameMethod = classDeclaration.body.body.find(t => t.type === 'ClassMethod' && t.key.type === 'Identifier' && t.key.name === 'nextFrame') as ClassMethod | undefined;
        if (!nextFrameMethod) {
            return {
                valid: false,
                errors: ['Class does not contain a nextFrame method']
            };
        }

        if (nextFrameMethod.async) {
            return {
                valid: false,
                errors: ['nextFrame method cannot be async']
            };
        }

        const setNumLedsMethod = classDeclaration.body.body.find(t => t.type === 'ClassMethod' && t.key.type === 'Identifier' && t.key.name === 'setNumLeds') as ClassMethod | undefined;

        if (!setNumLedsMethod) {
            return {
                valid: false,
                errors: ['Class does not contain a setNumLeds method']
            };
        }

        if (setNumLedsMethod.params.length !== 1) {
            return {
                valid: false,
                errors: ['setNumLeds should have one parameter']
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