
import { Leds, LedsSetup } from './services';
import WebSocket from 'ws';

console.log('Initializing leds');
const leds = new Leds();
leds.setup({
    animationName: 'Rainbow',
    interval: 50,
    numLeds: 8
});

console.log('Starting WebSocket');
const ws = new WebSocket('ws://localhost:3001/api/ws?device-id=raspi-netled-1&token=raspi-netled-1');

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
                console.log('Updating Leds setup');
                leds.setup(message.setup);
            }
        }
    } catch (e) {
        console.error(`Error parsing incoming WebSocket message - ${e}`);
    }
});


type WsMessage = {
    type: 'ledSetup',
    setup: LedsSetup
}
