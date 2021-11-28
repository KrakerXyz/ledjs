import { ParseResult, parseScript } from '.';

describe('services', () => {
    describe('parseScript', () => {

        test('require default export', () => {
            const parseResult: ParseResult = parseScript('export class Test { setNumLeds(num) {} nextFrame() { return[] } }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('default');
            }
        });

        test('script should only have one export', () => {
            const parseResult: ParseResult = parseScript('export default class { setNumLeds(num) {} nextFrame() { return []; } } export function test() {}');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('export');
                expect(parseResult.errors.join('; ')).toContain('one');
            }
        });

        test('require setNumLeds', () => {
            const parseResult: ParseResult = parseScript('export default class { nextFrame() { return[]; } }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('setNumLeds');
            }
        });

        test('setNumLeds should have one parameter', () => {
            let parseResult: ParseResult = parseScript('export default class { setNumLeds() {} nextFrame() { return[]; } }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('setNumLeds');
                expect(parseResult.errors.join('; ')).toContain('parameter');
            }

            parseResult = parseScript('export default class { setNumLeds(one, two) {} nextFrame() { return []; } }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('setNumLeds');
                expect(parseResult.errors.join('; ')).toContain('parameter');
            }
        });

        test('require nextFrame', () => {
            const parseResult: ParseResult = parseScript('export default class { setNumLeds() {} }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('nextFrame');
            }
        });

        test('nextFrame cannot be async', () => {
            const parseResult: ParseResult = parseScript('export default class { setNumLeds() {} async nextFrame() { return []; } }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('async');
            }
        });

        test('nextFrame should return something', () => {
            const parseResult: ParseResult = parseScript('export default class { setNumLeds() {} async nextFrame() { } }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('return');
            }
        });

        test('positive test', () => {
            const parseResult: ParseResult = parseScript('export default class { setNumLeds(num) {} nextFrame() { return []; } }');
            expect(parseResult.valid).toBe(true);
        });

    });
});