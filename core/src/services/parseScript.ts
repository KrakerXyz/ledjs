import { parse } from '@babel/parser';
import { ClassDeclaration } from '@babel/types';

export function parseScript(script: string): ParsedScript | ParseError {

    try {
        const ast = parse(script);


        const program = ast.program;

        const classDefinitions = program.body.filter(b => b.type === 'ClassDeclaration');
        const className: ParseResult = !classDefinitions.length
            ? {
                value: 'Class definition not found',
                comment: '',
                isValid: false
            }
            : classDefinitions.length > 1 ? {
                value: 'More than one class definition found',
                comment: '',
                isValid: false
            } : {
                value: (classDefinitions[0] as ClassDeclaration).id.name,
                comment: classDefinitions[0].leadingComments?.map(c => c.value).join(' ').trim() ?? '',
                isValid: true
            };

        if (className.comment.startsWith('*')) { className.comment = className.comment.substring(1).trim(); }

        return {
            className
        };

    } catch (e) {
        return {
            error: e
        };
    }

}

export interface ParsedScript {
    className: ParseResult;
}

export interface ParseError {
    error: string;
}

export function isParseError(x: File | ParseError): x is ParseError {
    return (x as ParseError).error !== undefined;
}

export interface ParseResult {
    value: string;
    comment: string;
    isValid: boolean;
}