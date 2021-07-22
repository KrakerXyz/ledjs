import { TypedEntity } from '@krakerxyz/typed-base';
import { Animation } from 'netled';

export class AnimationDb {

    private readonly entity = new TypedEntity<Animation>();

    public all(): AsyncGenerator<Animation> {
        return this.entity.find({});
    }

    public add(animation: Animation): Promise<void> {
        return this.entity.insertAsync(animation);
    }

}