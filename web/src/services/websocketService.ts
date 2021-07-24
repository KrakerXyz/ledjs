import { Config } from 'netled';

class WebsocketService {
    private readonly _ws: WebSocket;

    public constructor() {
        console.log('Starting WebSocketService');
        const ws = new WebSocket(`ws://${window.location.host}/api/ws`);
        this._ws = ws;

        ws.addEventListener('open', e => {
            console.log('WebSocketService connected', e);
        });

        ws.addEventListener('message', e => {
            console.log('Got WebSocket message', e);
        });
    }

    public sendMessage(msg: WsMessage) {
        this._ws.send(JSON.stringify(msg));
    }
}

const ws = new WebsocketService();
export function useWebSocket() {
    return ws;
}

export type WsMessage = {
    type: 'ledSetup',
    setup: WsLedsSetup
}

export interface WsLedsSetup {
    animationName: string;
    animationConfig?: Config<any>;
    numLeds: number;
    interval: number;
}
