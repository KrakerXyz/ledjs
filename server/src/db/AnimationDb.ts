import { TypedEntity } from '@krakerxyz/typed-base';
import { Animation, Id } from 'netled';

export class AnimationDb {

    private readonly entity = new TypedEntity<Animation>();

    public all(): AsyncGenerator<Animation> {
        return this.entity.find({});
    }

    public byId(id: Id): Promise<Animation | null> {
        return this.entity.findOneAsync({ id });
    }

    public add(animation: Animation): Promise<void> {
        return this.entity.insertAsync(animation);
    }

}