
export class HostWsClient {
    private readonly _ws: WebSocket;

    public constructor(host: string) {
        const ws = new WebSocket(`ws://${host}/ws/client`);
        this._ws = ws;
    }

}

export type DeviceChangeMessage = {
    type: 'connected',
    deviceId: string
} | {
    type: 'disconnected',
    deviceId: string
}