import { WsMessage } from '..';

export class HostWsClient {
    private readonly _ws: WebSocket;

    public constructor(host: string) {
        const ws = new WebSocket(`ws://${host}/ws`);
        this._ws = ws;
    }

    public sendMessage(msg: WsMessage) {
        this._ws.send(JSON.stringify(msg));
    }
}
