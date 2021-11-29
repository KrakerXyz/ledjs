import { DeviceWsClient } from '@krakerxyz/netled-core';

type LogMethods = 'fatal' | 'error' | 'warn' | 'info' | 'debug';
export type Logger = Record<LogMethods, (msg: string, data?: Record<string, any>) => void> & { readonly name: string };

let deviceWs: DeviceWsClient | undefined;
export function setLoggerDeviceWsClient(client: DeviceWsClient) {
    deviceWs = client;
}

export function getLogger(name: string, parentLogger?: Logger): Logger {

    name = parentLogger ? parentLogger.name + '.' : '' + name;

    const log = (level: number, msg: string, data?: Record<string, any>) => {
        const now = new Date();
        const time = now.getTime();
        const consoleMsg = `${now.toLocaleTimeString()}: ${msg} [${name}]`;
        if (data) {
            console.log(consoleMsg, data);
        } else {
            console.log(consoleMsg);
        }
        if (deviceWs) {
            deviceWs.postMessage({
                type: 'log',
                data: {
                    level,
                    msg,
                    name,
                    time,
                    ...data ?? {}
                }
            });
        }
    };

    return {
        name,
        debug: (msg, data) => log(20, msg, data),
        info: (msg, data) => log(30, msg, data),
        warn: (msg, data) => log(40, msg, data),
        error: (msg, data) => log(50, msg, data),
        fatal: (msg, data) => log(60, msg, data),
    };

}