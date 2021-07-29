import { Filter, TypedEntity } from '@krakerxyz/typed-base';
import { Animation, AnimationMeta } from 'netled';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class AnimationDb {

    private readonly entity = new TypedEntity<Animation>();

    public all(): AsyncGenerator<AnimationMeta> {
        return this.entity.find({}, c => c.project({ script: false } as any));
    }

    public async latestById(id: string, includeDraft: boolean = false): Promise<Animation | null> {
        const filter: Filter<Writeable<Animation>> = { id };
        if (!includeDraft) { filter.published = true; }

        const cur = this.entity.find(
            filter,
            c => c.sort({ version: -1 }).limit(1)
        );
        for await (const a of cur) { return a; }
        return null;
    }

    public byId(id: string, version: number): Promise<Animation | null> {
        const filter: Filter<Writeable<Animation>> = { id, version };

        const cur = this.entity.findOneAsync(
            filter
        );

        return cur;
    }


    public add(animation: Animation): Promise<void> {
        return this.entity.insertAsync(animation);
    }

    public replace(animation: Animation): Promise<void> {
        return this.entity.replaceOneAsync(animation);
    }

}