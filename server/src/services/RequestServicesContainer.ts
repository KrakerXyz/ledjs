
import { AnimationDb } from '../db/AnimationDb.js';
import { DeviceDb } from '../db/DeviceDb.js';
import { PostProcessorDb } from '../db/PostProcessorDb.js';
import { ScriptConfigDb } from '../db/ScriptConfigDb.js';
import { StrandDb } from '../db/StrandDb.js';
import { UserDb } from '../db/UserDb.js';
import { MqttClient } from './MqttClient.js';

export class RequestServicesContainer {

    public constructor(readonly mqtt: MqttClient) { 

    }

    private _animationDb: AnimationDb | null = null;
    public get animationDb() {
        return this._animationDb ?? (this._animationDb = new AnimationDb());
    }

    private _postProcessorDb: PostProcessorDb | null = null;
    public get postProcessorDb() {
        return this._postProcessorDb ?? (this._postProcessorDb = new PostProcessorDb());
    }

    private _deviceDb: DeviceDb | null = null;
    public get deviceDb() {
        return this._deviceDb ?? (this._deviceDb = new DeviceDb());
    }

    private _userDb: UserDb | null = null;
    public get userDb() {
        return this._userDb ?? (this._userDb = new UserDb());
    }

    private _strandDb: StrandDb | null = null;
    public get strandDb() {
        return this._strandDb ?? (this._strandDb = new StrandDb());
    }

    private _scriptConfigDb: ScriptConfigDb | null = null;
    public get scriptConfigDb() {
        return this._scriptConfigDb ?? (this._scriptConfigDb = new ScriptConfigDb());
    }

}