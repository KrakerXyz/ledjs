
import * as WebSocket from 'ws';
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

    public constructor(type: 'device' | 'host', options?: Partial<WsOptions>) {
        this._url = `${options?.protocol ?? 'wss'}://${options?.host ?? 'netled.io'}/ws/${type}`;
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

    private startWebsocket() {

        this._eventEmitter.emit('connectionChange', 'connecting');

        const ws = new WebSocket(this._url, this._auth);

        this._postMessage = ws.send.bind(ws);

        ws.addEventListener('open', () => {
            this._reconnectRetryCount = 0;
            this._eventEmitter.emit('connectionChange', 'connected');
        });

        ws.addEventListener('error', () => {
            //Just eat it. This will emit if there's an error connecting but a subsequent close will also be emitted which we'll handle. If we don't have this, it'll end up throwing an exception which will crash the app
        });

        ws.addEventListener('close', e => {
            //Will happen if the server closes or after an error has occurred while connecting
            if (e.code === 4001) {
                throw new Error('Device not authorized to connect to netled. Check your .env DEVICE_ID/SECRET');
            }

            this._reconnectRetryCount++;

            this._eventEmitter.emit('connectionChange', 'disconnected');

            const retryWaitSecs = Math.min(this._reconnectRetryCount, 15);
            setTimeout(() => {
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

}

export interface WsOptions {
    auth: string;
    /** Protocol to use for connection */
    protocol: 'ws' | 'wss';
    /** Server origin. Defaults to netled.io */
    host: string;
}