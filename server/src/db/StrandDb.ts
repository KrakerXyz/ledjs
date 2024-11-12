import type { Filter } from 'mongodb';
import { jsonSchemas } from './schema/schemaUtility.js';
import { Db, type UpdateResult } from './Db.js';
import type { Strand } from '../../../core/src/rest/model/Strand.js';
import type { Writeable } from '../../../core/src/services/Writeable.js';
import type { Id } from '../../../core/src/rest/model/Id.js';

export class StrandDb {
    private static _entity: Db<Strand>;

    public constructor() {
        StrandDb._entity ??= new Db<Strand>('strands', jsonSchemas.strand);
    }

    public all(): AsyncGenerator<Strand> {
        return StrandDb._entity.find({}, c => c.project({ js: false, ts: false } as any));
    }

    public byId(id: Id): Promise<Strand | null> {
        const filter: Filter<Writeable<Strand>> = { id };

        const cur = StrandDb._entity.findOneAsync(filter);

        return cur;
    }

    public add(strand: Strand): Promise<void> {
        return StrandDb._entity.insertAsync(strand);
    }

    public replace(strand: Strand): Promise<UpdateResult> {
        return StrandDb._entity.replaceOneAsync(strand);
    }

    public upsert(strand: Strand): Promise<UpdateResult> {
        return StrandDb._entity.replaceOneAsync(strand, { upsert: true });
    }

    public deleteById(strandId: Id): Promise<void> {
        return StrandDb._entity.deleteAsync({ id: strandId });
    }

}