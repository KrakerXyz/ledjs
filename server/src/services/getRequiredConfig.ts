export const enum EnvKey {
    NodeEnv = 'NODE_ENV',
    DbConnectionString = 'DB_CONNECTION_STRING',
    GoogleClientId = 'GOOGLE_CLIENT_ID',
    JwtSecret = 'JWT_SECRET',
    MqttBroker = 'MQTT_BROKER',
    MqttBrokerWs = 'MQTT_BROKER_WS',
    MqttPrefix = 'MQTT_PREFIX',
    MqttClientId = 'MQTT_CLIENT_ID',
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