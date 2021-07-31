import { DeviceDb } from '../db/DeviceDb';
import { WebSocketManager } from './WebSocketManager';

export class RequestServicesContainer {

    public constructor(public readonly webSocketManager: WebSocketManager) { }

    private _deviceDb: DeviceDb | null = null;
    public get deviceDb() {
        return this._deviceDb ?? (this._deviceDb = new DeviceDb());
    }

}