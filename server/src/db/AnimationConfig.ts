import { Filter, TypedEntity } from '@krakerxyz/typed-base';
import { AnimationConfig, AnimationVersion, Id, Writeable } from '@krakerxyz/netled-core';

export class AnimationConfigDb {
    private readonly entity = new TypedEntity<AnimationConfig>();

    public byAnimationId(animationId: Id, userId?: Id, version?: AnimationVersion): AsyncGenerator<AnimationConfig> {
        const filter: Filter<Writeable<AnimationConfig>> = {
            'animation.id': animationId
        };
        if (userId) { filter['userId'] = userId; }
        if (version !== undefined) { filter['animation.version'] = version; }
        return this.entity.find(filter);
    }

    public byUserId(userId: Id): AsyncGenerator<AnimationConfig> {
        return this.entity.find({ userId });
    }

    public byId(id: Id): Promise<AnimationConfig | null> {
        return this.entity.findOneAsync({ id });
    }

    public add(config: AnimationConfig): Promise<void> {
        return this.entity.insertAsync(config);
    }

    public replace(config: AnimationConfig): Promise<void> {
        return this.entity.replaceOneAsync(config);
    }

    public deleteById(id: Id): Promise<void> {
        return this.entity.deleteOneAsync(id);
    }
}