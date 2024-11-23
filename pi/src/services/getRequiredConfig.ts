export const enum EnvKey {
    LEDJS_HOST = 'LEDJS_HOST',
    LEDJS_AUTH = 'LEDJS_AUTH',
    LEDJS_MQTT = 'LEDJS_MQTT',
}

/** Gets value from process.env or throws exception if empty */
export function getRequiredConfig(key: EnvKey): string {
    const value = process.env[key];
    if (!value) { throw new Error(`Missing config for ${key}`); }
    return value;
}