import { ParseResult, parseScript } from '.';

describe('services', () => {
    describe('parseScript', () => {

        test('require default export', () => {
            const parseResult: ParseResult = parseScript('export class Test { setNumLeds(num) {} nextFrame() {} }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('default');
            }
        });

        test('require setNumLeds', () => {
            const parseResult: ParseResult = parseScript('export default class { nextFrame() {} }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('setNumLeds');
            }
        });

        test('setNumLeds should have one parameter', () => {
            let parseResult: ParseResult = parseScript('export default class { setNumLeds() {} nextFrame() {} }');
            expect(parseResult.valid).toBe(false);
            if (parseResult.valid === false) {
                expect(parseResult.errors.join('; ')).toContain('setNumLeds');
                expect(parseResult.errors.join('; ')).toContain('parameter');
            }

            parseResult = parseScript('export default class { setNumLeds(one, two) {} nextFrame() {} }');
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

    });
});