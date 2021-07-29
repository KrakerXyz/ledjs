import { WsMessage } from '..';

export class HostClient {
    private readonly _ws: WebSocket;

    public constructor(host: string) {
        const ws = new WebSocket(`ws://${host}/ws`);
        this._ws = ws;

        // ws.addEventListener('open', e => {
        //     console.log('WebSocketService connected', e);
        // });

        // ws.addEventListener('message', e => {
        //     console.log('Got WebSocket message', e);
        // });
    }

    public sendMessage(msg: WsMessage) {
        this._ws.send(JSON.stringify(msg));
    }
}
