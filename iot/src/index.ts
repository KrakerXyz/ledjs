
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { EnvKey, getConfig, getRequiredConfig, Leds, useRestClient } from './services';
import WebSocket from 'ws';
import { ToDeviceMessage } from 'netled';

if (!getConfig(EnvKey.DeviceId) || !getConfig(EnvKey.DeviceSecret)) {
    console.error('Missing config - deviceId/secret. Quitting');
    process.exit();
}

(async () => {

    const remoteAddress = getConfig(EnvKey.WsHost, 'localhost:3001');

    useRestClient(remoteAddress);

    console.log('Initializing leds');
    const leds = new Leds();

    console.log(`Starting WebSocket @ ${remoteAddress}`);
    const authToken = `${getRequiredConfig(EnvKey.DeviceId)}:${getRequiredConfig(EnvKey.DeviceSecret)}`;
    const ws = new WebSocket(`ws://${remoteAddress}/ws/device`, { auth: authToken });

    ws.addEventListener('open', () => {
        console.log('WebSocket opened');
    });

    ws.addEventListener('error', e => {
        //Will happen if the server is down. Will subsequently call the close as well
        console.warn(`WebSocket error: ${e.message}`);
    });

    ws.addEventListener('close', e => {
        //Will happen if the server closes or after an error has occurred while connecting
        console.warn('WebSocket closed', { wasClean: e.wasClean, code: e.code, reason: e.reason });
    });

    ws.addEventListener('message', e => {
        try {
            const message = JSON.parse(e.data) as ToDeviceMessage;
            console.log(`Incoming WebSocket message: ${message.type}`);
            switch (message.type) {
                case 'ledSetup': {
                    leds.setup(message.data);
                    break;
                }
            }
        } catch (e) {
            console.error(`Error parsing incoming WebSocket message - ${e}`);
        }
    });

})();