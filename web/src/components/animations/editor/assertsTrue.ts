export function assertTrue(condition: boolean): asserts condition {
    if (!condition) {
        throw new Error('Assertion failed'); // assertion error
    }
}