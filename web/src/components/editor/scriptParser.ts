import { computed, Ref } from 'vue';
import { parse } from '@babel/parser';
import { ClassDeclaration, File } from '@babel/types';

export function useScriptParser(script: Ref<string>): Ref<ParsedScript | ParseError> {

    const ast = computed(() => {
        try {
            return parse(script.value);
        } catch (e) {
            return {
                error: e
            };
        }
    });

    const result: Ref<ParsedScript | ParseError> = computed(() => {

        if (isParseError(ast.value)) {
            return ast.value;
        } else {

            const program = (ast.value as File).program;

            const classDefinitions = program.body.filter(b => b.type === 'ClassDeclaration');
            const className = !classDefinitions.length
                ? {
                    value: 'Class definition not found',
                    comment: '',
                    isInvalid: true
                }
                : classDefinitions.length > 1 ? {
                    value: 'More than one class definition found',
                    comment: '',
                    isInvalid: true
                } : {
                    value: (classDefinitions[0] as ClassDeclaration).id.name,
                    comment: classDefinitions[0].leadingComments?.map(c => c.value).join(' ').trim() ?? '',
                    isInvalid: false
                };

            if (className.comment.startsWith('*')) { className.comment = className.comment.substring(1).trim(); }

            return {
                className
            }
        }

    });

    return result;

}

export interface ParsedScript {
    className: ParseResult;
}

export interface ParseError {
    error: string;
}

function isParseError(x: File | ParseError): x is ParseError {
    return (x as ParseError).error !== undefined;
}

export interface ParseResult {
    value: string;
    comment: string;
    isInvalid: boolean;
}