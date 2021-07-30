export const enum EnvKey {
    DbConnectionString = 'DB_CONNECTION_STRING',
    GoogleClientId = 'GOOGLE_CLIENT_ID',
    JwtSecret = 'JWT_SECRET'
}

/** Gets value from process.env or throws exception if empty */
export function getRequiredConfig(key: EnvKey): string {
    const value = process.env[key];
    if (!value) { throw new Error(`Missing config for ${key}`); }
    return value;
}