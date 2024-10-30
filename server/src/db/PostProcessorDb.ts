import type { Filter } from 'mongodb';
import { jsonSchemas } from './schema/schemaUtility.js';
import { Db, type UpdateResult } from './Db.js';
import type { PostProcessor, PostProcessorSummary } from '../../../core/src/rest/model/PostProcessor.js';
import type { ScriptVersion } from '../../../core/src/rest/model/ScriptVersion.js';
import type { Writeable } from '../../../core/src/services/Writeable.js';
import type { Id } from '../../../core/src/rest/model/Id.js';

export class PostProcessorDb {
    private static _entity: Db<PostProcessor>;

    public constructor() {
        PostProcessorDb._entity ??= new Db<PostProcessor>('postProcessors', jsonSchemas.postProcessor);
    }

    public all(): AsyncGenerator<PostProcessorSummary> {
        return PostProcessorDb._entity.find({}, c => c.project({ js: false, ts: false } as any));
    }

    public async latestById(id: Id): Promise<PostProcessor | null> {
        const filter: Filter<Writeable<PostProcessor>> = { id, published: true };

        const cur = PostProcessorDb._entity.find(
            filter,
            c => c.sort({ version: -1 }).limit(1)
        );
        for await (const a of cur) { return a; }
        return null;
    }

    public byId(id: Id, version: ScriptVersion): Promise<PostProcessor | null> {
        const filter: Filter<Writeable<PostProcessor>> = { id, version };

        const cur = PostProcessorDb._entity.findOneAsync(filter);

        return cur;
    }

    public add(postProcessor: PostProcessor): Promise<void> {
        return PostProcessorDb._entity.insertAsync(postProcessor);
    }

    public replace(postProcessor: PostProcessor): Promise<UpdateResult> {
        return PostProcessorDb._entity.replaceOneAsync(postProcessor);
    }

    public upsert(postProcessor: PostProcessor): Promise<UpdateResult> {
        return PostProcessorDb._entity.replaceOneAsync(postProcessor, { upsert: true });
    }

    public deleteById(postProcessorId: Id, version: ScriptVersion): Promise<void> {
        return PostProcessorDb._entity.deleteAsync({ id: postProcessorId, version });
    }

}