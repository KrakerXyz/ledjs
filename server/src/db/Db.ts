

import Ajv, { ValidateFunction } from 'ajv';
import { Filter, FindOptions, FindCursor, ReplaceOptions, UpdateFilter, UpdateOptions, MongoClient, Collection, MongoClientOptions, Document } from 'mongodb';

export interface Options<T> {
    postCleanCallback?: (doc: T) => void,
}

export class Db<T extends { id: string }> {

    private readonly _cleaner: (doc: T) => void;

    public constructor(public readonly collectionName: string, schema: any, options?: Partial<Options<T>>) {
        const ajv = new Ajv.default({
            removeAdditional: true,
            coerceTypes: true,
            allErrors: true,
            allowUnionTypes: true,
            discriminator: true,
            strictTuples: false // without this we get warning about the json schema generated from [string, ...string[]]
        });

        const cleaner = ajv.compile(schema) as ValidateFunction<T>;
        this._cleaner = (doc: T) => {
            cleaner(doc);
            options?.postCleanCallback?.(doc);
        };
        
    }

    public async findOneAsync(query: Filter<T>, options?: FindOptions<T>): Promise<T | null> {
        const col = await getCollectionAsync(this.collectionName);
        const r = await col.findOne<T>(query as Filter<any>, options);
        if (!r) { return null; }
        this._cleaner(r);
        return r;
    }

    public async *find(query: Filter<T>, modify?: (cur: FindCursor<T>) => FindCursor<{ [k in keyof Partial<T>]: any }>, options?: FindOptions<T>): AsyncGenerator<T, void, void> {
        const col = await getCollectionAsync(this.collectionName);
        if (!modify) { modify = (c) => c; }
        const results = modify(col.find<T>(query as Filter<any>, options));
        for await (const r of results) {
            this._cleaner(r);
            yield r;
        }
    }

    public async insertAsync(...docs: T[]): Promise<void> {
        const col = await getCollectionAsync(this.collectionName);
        if (docs.length === 1) {
            docs.forEach(d => this._cleaner(d));
            await col.insertOne(docs[0]);
        } else {
            docs.forEach(d => this._cleaner(d));
            await col.insertMany(docs);
        }
    }

    public async replaceOneAsync(doc: T, options?: ReplaceOptions): Promise<UpdateResult> {
        const col = await getCollectionAsync(this.collectionName);
        this._cleaner(doc);
        const result = await col.replaceOne({ id: doc.id }, doc, options ?? {});
        return {
            updated: result.modifiedCount,
            inserted: result.upsertedCount
        };
    }

    public async updateOneAsync(filter: Filter<T>, doc: UpdateFilter<T>, options?: UpdateOptions): Promise<void> {
        const col = await getCollectionAsync(this.collectionName);
        await col.updateOne(filter as Filter<any>, doc as UpdateFilter<Document>, options ?? {});
    }

    public async deleteAsync(query: Filter<T>): Promise<void> {
        const col = await getCollectionAsync(this.collectionName);
        await col.deleteMany(query as Filter<any>);
    }

    public async deleteOneAsync(id: string): Promise<void> {
        const col = await getCollectionAsync(this.collectionName);
        await col.deleteOne({ id });
    }
}

let _clients: Map<string, MongoClient> | undefined;

function getConfig(): DbConfig {
    if (!_config) { throw new Error('Attempted DB operation without config. Ensure configureDbLocal() has been called before initiating any DB operation.'); }
    return _config;
}

async function getCollectionAsync(name: string): Promise<Collection> {
    if (!_clients) { _clients = new Map(); }
    const config = getConfig();
    let client = _clients.get(config.uri);
    if (!client) {
        client = new MongoClient(config.uri, config.mongoClientOptions);
        _clients.set(config.uri, client);
        await client.connect();
    }
    const db = client.db(config.dbName);
    const col = db.collection(name);
    return col;
}

interface DbConfig {
    uri: string,
    dbName: string,
    mongoClientOptions?: MongoClientOptions,
}

let _config: DbConfig | undefined;
export function configureDbLocal(dbConfig: DbConfig) {
    _config = dbConfig;

}

export interface UpdateResult {inserted: boolean, updated: boolean}
