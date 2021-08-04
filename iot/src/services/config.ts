export const enum EnvKey {
    DeviceId = 'DEVICE_ID',
    DeviceSecret = 'DEVICE_SECRET',
    WsHost = 'WS_HOST'
}

/** Gets value from process.env or throws exception if empty */
export function getRequiredConfig(key: EnvKey): string {
    const value = process.env[key];
    if (!value) { throw new Error(`Missing config for ${key}`); }
    return value;
}

export function getConfig<T extends string | undefined | null = undefined>(key: EnvKey, defaultValue?: T): string | T {
    const value = process.env[key] ?? defaultValue;
    return value as T;
}