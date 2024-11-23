
export function getLogger(name: string): ILogger {
    return {
        debug(message: string): void {
            console.debug(`[${name}] ${message}`);
        },
        info(message: string): void {
            console.info(`[${name}] ${message}`);
        },
        warn(message: string): void {
            console.warn(`[${name}] ${message}`);
        },
        error(message: string): void {
            console.error(`[${name}] ${message}`);
        }
    };
}

export interface ILogger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}