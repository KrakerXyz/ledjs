/** Get a proxy function that will save at most, every 500ms */

export function useThrottledProxy<T>(callback: (...args: T[]) => any, options?: ThrottleOptions) {

    let toSave: T[];
    let isQueued = false;

    const timeout = options?.timeout ?? 500
    let nextCallTime = Date.now();

    return (...args: T[]) => {
        toSave = args;
        if (isQueued) { return; }
        isQueued = true;
        setTimeout(() => {
            try {
                callback(...toSave);
                toSave = undefined as any;
            } finally {
                nextCallTime = Date.now() + timeout;
                isQueued = false;
            }
        }, nextCallTime - Date.now());

    };
}

export type ThrottleOptions = Partial<{ timeout: number }>;