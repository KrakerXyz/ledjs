import { Filter } from 'mongodb';
import { User, Id, Writeable } from '../../../core/src/index.js';
import { Db, UpdateResult } from './Db.js';
import { jsonSchemas } from './schema/schemaUtility.js';


export class UserDb {
   private static _entity: Db<User>;

    public constructor() {
        UserDb._entity ??= new Db<User>('users', jsonSchemas.user);
    }

    public byId(id: Id): Promise<User | null> {
        return UserDb._entity.findOneAsync({ id });
    }

    public byEmail(email: string): Promise<User | null> {
        const filter: Filter<Writeable<User>> = { email };
        const ent = UserDb._entity.findOneAsync(filter);
        return ent;
    }

    public add(user: User): Promise<void> {
        return UserDb._entity.insertAsync(user);
    }

    public replace(user: User): Promise<UpdateResult> {
        return UserDb._entity.replaceOneAsync(user);
    }

    public updateLastSeen(userId: Id): Promise<void> {
        return UserDb._entity.updateOneAsync({ id: userId }, { $set: { lastSeen: Date.now() } });
    }

}