import { Filter, TypedEntity } from '@krakerxyz/typed-base';
import { AnimationNamedConfig } from 'netled';

export class AnimationConfigDb {
    private readonly entity = new TypedEntity<AnimationNamedConfig>();

    public byAnimationId(animationId: string, userId: string, version?: number): AsyncGenerator<AnimationNamedConfig> {
        const filter: Filter<AnimationNamedConfig> = {
            userId,
            animation: {
                id: animationId
            }
        };
        if (version !== undefined) { filter.animation!.version = version; }
        return this.entity.find(filter);
    }

    public byId(id: string): Promise<AnimationNamedConfig | null> {
        return this.entity.findOneAsync({ id });
    }

    public add(config: AnimationNamedConfig): Promise<void> {
        return this.entity.insertAsync(config);
    }

    public replace(config: AnimationNamedConfig): Promise<void> {
        return this.entity.replaceOneAsync(config);
    }
}