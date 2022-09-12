import { Filter, TypedEntity, UpdateResult } from '@krakerxyz/typed-base';
import { Id, User, Writeable } from '@krakerxyz/netled-core';

export class UserDb {

    private readonly entity = new TypedEntity<User>();

    public byId(id: Id): Promise<User | null> {
        return this.entity.findOneAsync({ id });
    }

    public byEmail(email: string): Promise<User | null> {
        const filter: Filter<Writeable<User>> = { email };
        const ent = this.entity.findOneAsync(filter);
        return ent;
    }

    public add(user: User): Promise<void> {
        return this.entity.insertAsync(user);
    }

    public replace(user: User): Promise<UpdateResult> {
        return this.entity.replaceOneAsync(user);
    }

    public updateLastSeen(userId: Id): Promise<void> {
        return this.entity.updateOneAsync({ id: userId }, { $set: { lastSeen: Date.now() } });
    }

}