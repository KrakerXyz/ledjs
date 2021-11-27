import { Filter, TypedEntity } from '@krakerxyz/typed-base';
import { AnimationNamedConfig, Id, Writeable } from '@krakerxyz/netled-core';

export class AnimationConfigDb {
    private readonly entity = new TypedEntity<AnimationNamedConfig>();

    public byAnimationId(animationId: string, userId?: string, version?: number): AsyncGenerator<AnimationNamedConfig> {
        const filter: Filter<Writeable<AnimationNamedConfig>> = {
            'animation.id': animationId
        };
        if (userId) { filter['userId'] = userId; }
        if (version !== undefined) { filter['animation.version'] = version; }
        return this.entity.find(filter);
    }

    public byUserId(userId: Id): AsyncGenerator<AnimationNamedConfig> {
        return this.entity.find({ userId });
    }

    public byId(id: Id): Promise<AnimationNamedConfig | null> {
        return this.entity.findOneAsync({ id });
    }

    public add(config: AnimationNamedConfig): Promise<void> {
        return this.entity.insertAsync(config);
    }

    public replace(config: AnimationNamedConfig): Promise<void> {
        return this.entity.replaceOneAsync(config);
    }

    public deleteById(id: Id): Promise<void> {
        return this.entity.deleteOneAsync(id);
    }
}