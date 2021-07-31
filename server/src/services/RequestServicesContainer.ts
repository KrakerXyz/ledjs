import { WebSocketManager } from './WebSocketManager';

export class RequestServicesContainer {

    public constructor(public readonly webSocketManager: WebSocketManager) { }

}