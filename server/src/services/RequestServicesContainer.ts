
import { AnimationConfigDb } from '../db/AnimationConfigDb.js';
import { AnimationDb } from '../db/AnimationDb.js';
import { DeviceDb } from '../db/DeviceDb.js';
import { DeviceLogDb } from '../db/DeviceLogDb.js';
import { PostProcessorDb } from '../db/PostProcessorDb.js';
import { StrandDb } from '../db/StrandDb.js';
import { UserDb } from '../db/UserDb.js';
import type { WebSocketManager } from './ws/WebSocketManager.js';

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

    private _postProcessorDb: PostProcessorDb | null = null;
    public get postProcessorDb() {
        return this._postProcessorDb ?? (this._postProcessorDb = new PostProcessorDb());
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

    private _strandDb: StrandDb | null = null;
    public get strandDb() {
        return this._strandDb ?? (this._strandDb = new StrandDb());
    }

}