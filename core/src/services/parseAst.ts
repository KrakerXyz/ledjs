import { parse, type ParseResult } from '@babel/parser';
import type * as AstTypes from '@babel/types';
export type { AstTypes };

export function parseAst(ts: string): ParseResult<AstTypes.File> {
    return parse(ts, { sourceType: 'module', plugins: ['typescript'] });
}