import { User } from 'netled';
import { UserDb } from '../db';

export class RequestUser {

    public constructor(
        public readonly id: string,
        public readonly tokenId: string
    ) {
        if (!id) { throw new Error('id required for RequestUser'); }
        if (!tokenId) { throw new Error('tokenId required for RequestUser'); }
    }

    private _userProm: Promise<User | null> | undefined;
    public loadUser(): Promise<User | null> {
        if (this._userProm) { return this._userProm; }
        const userDb = new UserDb();
        return (this._userProm = userDb.byId(this.id));
    }
}