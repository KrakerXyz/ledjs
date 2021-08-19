
import * as WsWebSocket from 'ws';
import { EventEmitter } from 'eventemitter3';
import { Disposable } from '../Disposable';

type Message = { type: string, data: any }
export type WsEvents<TMessage extends Message> = TMessage['type'] | 'connectionChange';
type CallbackType<TMessage extends Message> = { [T in TMessage['type']]: (data: any) => void };
export type WsCallbacks<TMessage extends Message, TMessageCallbacks extends CallbackType<TMessage>> = TMessageCallbacks & {
    'connectionChange': (data: 'connecting' | 'connected' | 'disconnected') => void
}

export class WsConnection<
    TMessage extends Message,
    TMessageCallback extends CallbackType<TMessage>,
    TMessageFrom extends Message | never = never
    > {

    private readonly _url: string;
    private readonly _auth: { auth: string } | undefined;
    private _eventEmitter = new EventEmitter();

    public constructor(type: 'device' | 'client', options?: Partial<WsOptions>) {

        this._url = (options?.baseUrl ?? 'wss://netled.io') + `/ws/${type}`;
        this._auth = options?.auth ? { auth: options.auth } : undefined;

        this.startWebsocket();
    }

    public on<Type extends WsEvents<TMessage>>(type: Type, callback: WsCallbacks<TMessage, TMessageCallback>[Type]): Disposable {
        this._eventEmitter.addListener(type, callback);
        return {
            dispose: () => {
                this._eventEmitter.removeListener('type', callback);
            }
        };
    }

    private _reconnectRetryCount = 0;
    private _postMessage: ((msg: string) => void) | null = null;
    private _ws: WebSocket | null = null;
    private _isConnected: boolean = false;

    public get isConnected() { return this._isConnected; }

    private startWebsocket() {
        if (this._disposed) { throw new Error('This been disposed'); }

        this._eventEmitter.emit('connectionChange', 'connecting');

        const ws = globalThis.WebSocket ? new WebSocket(this._url) : new WsWebSocket(this._url, this._auth) as any as WebSocket;
        this._ws = ws;

        this._postMessage = ws.send.bind(ws);

        ws.addEventListener('open', () => {
            this._reconnectRetryCount = 0;
            this._eventEmitter.emit('connectionChange', 'connected');
            this._isConnected = true;
        });

        ws.addEventListener('error', () => {
            //Just eat it. This will emit if there's an error connecting but a subsequent close will also be emitted which we'll handle. If we don't have this, it'll end up throwing an exception which will crash the app
        });

        ws.addEventListener('close', e => {
            this._isConnected = false;
            //Will happen if the server closes or after an error has occurred while connecting
            if (e.code === 4001) {
                throw new Error('Device not authorized to connect to netled. Check your .env DEVICE_ID/SECRET');
            }

            this._reconnectRetryCount++;

            this._eventEmitter.emit('connectionChange', 'disconnected');

            const retryWaitSecs = Math.min(this._reconnectRetryCount, 15);
            setTimeout(() => {
                if (this._disposed) { return; }
                this.startWebsocket();
            }, retryWaitSecs * 1000);
        });

        ws.addEventListener('message', e => {
            try {
                const message = JSON.parse(e.data) as Message;
                this._eventEmitter.emit(message.type, message.data);
            } catch (e) {
                console.error(`Error parsing incoming WebSocket message - ${e}`);
            }
        });

    }

    public postMessage(msg: TMessageFrom) {
        if (!this._postMessage) { return; }
        const msgJson = JSON.stringify(msg);
        this._postMessage(msgJson);
    }

    private _disposed = false;
    /** Immediately removes all listeners and disposes the websocket */
    public dispose() {
        if (this._disposed) { throw new Error('This WsConnection has already been disposed'); }
        this._disposed = true;
        this._eventEmitter.removeAllListeners();
        this._ws?.close();
        this._ws = null;
    }

}

export interface WsOptions {
    auth: string;
    baseUrl: `ws://${string}` | `wss://${string}`;
}