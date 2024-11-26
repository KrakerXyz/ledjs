export const enum EnvKey {
    LEDJS_HOST = 'LEDJS_HOST',
    LEDJS_AUTH = 'LEDJS_AUTH'
}

/** Gets value from process.env or throws exception if empty */
export function getRequiredConfig(key: EnvKey): string {
    const value = process.env[key];
    if (!value) { throw new Error(`Missing config for ${key}`); }
    return value;
}

export function getOptionalConfig<T extends string | undefined = undefined>(key: EnvKey, defaultValue?: T): string | T {
    return (process.env[key] ?? defaultValue) as T;
}