
import { transformFromAstAsync } from '@babel/core';
import type { ParseResult } from '@babel/parser';
import type { File } from '@babel/types';

/** Transpiles TypeScript animation script into node compatible JavaScript */
export async function buildScript(ast: ParseResult<File>) {

    const js = await transformFromAstAsync(ast, undefined, {
        presets: ['@babel/preset-typescript'],
        filename: 'script.ts'
    });
    return js?.code ?? null;

}