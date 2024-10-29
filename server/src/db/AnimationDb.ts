
import { Db, type UpdateResult } from './Db.js';
import type { Filter } from 'mongodb';
import { jsonSchemas } from './schema/schemaUtility.js';
import type { Id } from '../../../core/src/index.js';
import type { Animation, AnimationSummary } from '../../../core/src/rest/model/Animation.js';
import type { ScriptVersion } from '../../../core/src/rest/model/ScriptVersion.js';
import type { Writeable } from '../../../core/src/services/Writeable.js';


export class AnimationDb {
    private static _entity: Db<Animation>;

    public constructor() {
        AnimationDb._entity ??= new Db<Animation>('animations', jsonSchemas.animation);
    }


    public all(): AsyncGenerator<AnimationSummary> {
        return AnimationDb._entity.find({}, c => c.project({ js: false, ts: false } as any));
    }

    public async latestById(id: Id): Promise<Animation | null> {
        const filter: Filter<Writeable<Animation>> = { id, published: true };

        const cur = AnimationDb._entity.find(
            filter,
            c => c.sort({ version: -1 }).limit(1)
        );
        for await (const a of cur) { return a; }
        return null;
    }

    public byId(id: Id, version: ScriptVersion): Promise<Animation | null> {
        const filter: Filter<Writeable<Animation>> = { id, version };

        const cur = AnimationDb._entity.findOneAsync(filter);

        return cur;
    }

    public add(animation: Animation): Promise<void> {
        return AnimationDb._entity.insertAsync(animation);
    }

    public replace(animation: Animation): Promise<UpdateResult> {
        return AnimationDb._entity.replaceOneAsync(animation);
    }

    public upsert(animation: Animation): Promise<UpdateResult> {
        return AnimationDb._entity.replaceOneAsync(animation, { upsert: true });
    }

    public deleteById(animationId: Id, version: ScriptVersion): Promise<void> {
        return AnimationDb._entity.deleteAsync({ id: animationId, version });
    }

}