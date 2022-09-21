import { Filter, TypedEntity,  UpdateResult } from '@krakerxyz/typed-base';
import { PostProcessor, PostProcessorSummary, ScriptVersion, Id, Writeable } from '@krakerxyz/netled-core';

export class PostProcessorDb {

    private readonly entity = new TypedEntity<PostProcessor>();

    public all(): AsyncGenerator<PostProcessorSummary> {
        return this.entity.find({}, c => c.project({ js: false, ts: false } as any));
    }

    public async latestById(id: Id): Promise<PostProcessor | null> {
        const filter: Filter<Writeable<PostProcessor>> = { id, published: true };

        const cur = this.entity.find(
            filter,
            c => c.sort({ version: -1 }).limit(1)
        );
        for await (const a of cur) { return a; }
        return null;
    }

    public byId(id: Id, version: ScriptVersion): Promise<PostProcessor | null> {
        const filter: Filter<Writeable<PostProcessor>> = { id, version };

        const cur = this.entity.findOneAsync(filter);

        return cur;
    }

    public add(postProcessor: PostProcessor): Promise<void> {
        return this.entity.insertAsync(postProcessor);
    }

    public replace(postProcessor: PostProcessor): Promise<UpdateResult> {
        return this.entity.replaceOneAsync(postProcessor);
    }

    public upsert(postProcessor: PostProcessor): Promise<UpdateResult> {
        return this.entity.replaceOneAsync(postProcessor, { upsert: true });
    }

    public deleteById(postProcessorId: Id, version: ScriptVersion): Promise<void> {
        return this.entity.deleteAsync({ id: postProcessorId, version });
    }

}