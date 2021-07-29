
import { initConfig, Leds, useRestClient } from './services';
import WebSocket from 'ws';
import { WsMessage } from 'netled';

(async () => {

    console.log('Initializing config');
    const config = await initConfig();

    const myArgs = process.argv.splice(2);
    const remoteAddress = myArgs[0] ?? config.host ?? 'localhost:3000';

    useRestClient(remoteAddress);

    console.log('Initializing leds');
    const leds = new Leds();

    console.log(`Starting WebSocket @ ${remoteAddress}`);
    const ws = new WebSocket(`ws://${remoteAddress}/ws?device-id=raspi-netled-1&token=raspi-netled-1`);

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
            const message = JSON.parse(e.data) as WsMessage;
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