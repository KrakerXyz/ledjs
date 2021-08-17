import { Writeable } from './Writeable';

/** Creates a deep clone of the given object. */
export function deepClone<T>(src: T): Writeable<T> {

    if (typeof src !== 'object') {
        // JRH 7-21-2021 - leaving as console.warn() for now to catch missed cases. Will be changed to error in the future.
        console.warn('For performance reasons, non-objects should not use deepClone');
    }

    if (!src) { return src; }

    const parsed = JSON.parse(JSON.stringify(src, (key, val) => {
        if (typeof val === 'function') {
            throw new Error(`Value for property '${key}' is a function and cannot be cloned`);
        }
        return val;
    }));

    return parsed;
}
