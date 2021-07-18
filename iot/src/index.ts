
import { useAnimation } from './services/animationService';
import { Leds } from './services/Leds';
import WebSocket from 'ws';

const lastAnimationName = 'Rainbow';
const animation = useAnimation(lastAnimationName);
animation.setNumLeds(8);

const leds = new Leds();
leds.setAnimation(animation);
leds.setInterval(50);

console.log('Starting WS');
const ws = new WebSocket('ws://localhost:3001/api/ws');

ws.addEventListener('open', () => {
    console.log('WS opened');
    ws.send('Hello server');
});

ws.addEventListener('error', e => {
    //Will happen if the server is down. Will subsequently call the close as well
    console.warn(`WS error: ${e.message}`);
});

ws.addEventListener('close', e => {
    //Will happen if the server closes or after an error has occurred while connecting
    console.warn('WS closed', { wasClean: e.wasClean, code: e.code, reason: e.reason });
});

ws.addEventListener('message', e => {
    console.log('Got ws message', e.data);
});
