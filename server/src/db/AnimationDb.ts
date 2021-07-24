import { Filter, TypedEntity } from '@krakerxyz/typed-base';
import { Animation } from 'netled';

export class AnimationDb {

    private readonly entity = new TypedEntity<Animation>();

    public all(): AsyncGenerator<Animation> {
        return this.entity.find({});
    }

    public async lastedById(id: string, includeDraft: boolean = false): Promise<Animation | null> {
        const filter: Filter<Animation> = { id };
        if (!includeDraft) { (filter as any)['published'] = true; }

        const cur = this.entity.find(
            filter,
            c => c.sort({ version: -1 }).limit(1)
        );
        for await (const a of cur) { return a; }
        return null;
    }

    public add(animation: Animation): Promise<void> {
        return this.entity.insertAsync(animation);
    }

    public replace(animation: Animation): Promise<void> {
        return this.entity.replaceOneAsync(animation);
    }

}