import { DeviceDb, AnimationConfigDb, AnimationDb, UserDb, DeviceLogDb } from '../db';
import { WebSocketManager } from './WebSocketManager';

export class RequestServicesContainer {

    public constructor(public readonly webSocketManager: WebSocketManager) { }

    private _animationDb: AnimationDb | null = null;
    public get animationDb() {
        return this._animationDb ?? (this._animationDb = new AnimationDb());
    }

    private _animationConfigDb: AnimationConfigDb | null = null;
    public get animationConfigDb() {
        return this._animationConfigDb ?? (this._animationConfigDb = new AnimationConfigDb());
    }

    private _deviceDb: DeviceDb | null = null;
    public get deviceDb() {
        return this._deviceDb ?? (this._deviceDb = new DeviceDb());
    }

    private _deviceLogDb: DeviceLogDb | null = null;
    public get deviceLogDb() {
        return this._deviceLogDb ?? (this._deviceLogDb = new DeviceLogDb());
    }

    private _userDb: UserDb | null = null;
    public get userDb() {
        return this._userDb ?? (this._userDb = new UserDb());
    }

}