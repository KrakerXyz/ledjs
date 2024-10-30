
import { jsonSchemas } from './schema/schemaUtility.js';
import { Db, type UpdateResult } from './Db.js';
import type { Filter } from 'mongodb';
import type { AnimationConfig } from '../../../core/src/rest/model/AnimationConfig.js';
import type { ScriptVersion } from '../../../core/src/rest/model/ScriptVersion.js';
import type { Writeable } from '../../../core/src/services/Writeable.js';
import type { Id } from '../../../core/src/rest/model/Id.js';

export class AnimationConfigDb {
    private static _entity: Db<AnimationConfig>;

    public constructor() {
        AnimationConfigDb._entity ??= new Db<AnimationConfig>('animationConfigs', jsonSchemas.animationConfig);
    }

    public byAnimationId(animationId: Id, userId?: Id, version?: ScriptVersion): AsyncGenerator<AnimationConfig> {
        const filter: Filter<Writeable<AnimationConfig>> = {
            'animation.id': animationId
        };
        if (userId) { filter['userId'] = userId; }
        if (version !== undefined) { filter['animation.version'] = version; }
        return AnimationConfigDb._entity.find(filter);
    }

    public byUserId(userId: Id): AsyncGenerator<AnimationConfig> {
        return AnimationConfigDb._entity.find({ userId });
    }

    public byId(id: Id): Promise<AnimationConfig | null> {
        return AnimationConfigDb._entity.findOneAsync({ id });
    }

    public add(config: AnimationConfig): Promise<void> {
        return AnimationConfigDb._entity.insertAsync(config);
    }

    public replace(config: AnimationConfig): Promise<UpdateResult> {
        return AnimationConfigDb._entity.replaceOneAsync(config);
    }

    public upsert(config: AnimationConfig): Promise<UpdateResult> {
        return AnimationConfigDb._entity.replaceOneAsync(config, { upsert: true });
    }

    public deleteById(id: Id): Promise<void> {
        return AnimationConfigDb._entity.deleteOneAsync(id);
    }
}