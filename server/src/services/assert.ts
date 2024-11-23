
export function assertTruthy(v: any): asserts v {
    if (!v) {
        console.assert(false);
        throw new Error('Assertion failed');
    }
}