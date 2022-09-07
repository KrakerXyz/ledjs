
export function assertTrue(condition: any): asserts condition {
    if (!condition) {
        throw new Error('condition was falsy');
    }
}