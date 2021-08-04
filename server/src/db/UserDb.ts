import { Filter, TypedEntity } from '@krakerxyz/typed-base';
import { User } from 'netled';
import { Writeable } from '.';

export class UserDb {

    private readonly entity = new TypedEntity<User>();

    public byId(id: string): Promise<User | null> {
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

    public replace(user: User): Promise<void> {
        return this.entity.replaceOneAsync(user);
    }

}