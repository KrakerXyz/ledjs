import { TypedEntity } from '@krakerxyz/typed-base';
import { AnimationNamedConfig } from 'netled';

export class AnimationConfigDb {
    private readonly entity = new TypedEntity<AnimationNamedConfig>();

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