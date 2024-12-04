
import { jsonSchemas } from './schema/schemaUtility.js';
import { Db, type UpdateResult } from './Db.js';
import type { Filter } from 'mongodb';
import type { ScriptConfig } from '../../../core/src/rest/model/ScriptConfig.js';
import type { ScriptVersion } from '../../../core/src/rest/model/ScriptVersion.js';
import type { Writeable } from '../../../core/src/services/Writeable.js';
import type { Id } from '../../../core/src/rest/model/Id.js';
import type { ScriptType } from '../../../core/src/rest/model/ScriptConfig.js';

export class ScriptConfigDb {
    private static _entity: Db<ScriptConfig>;

    public constructor() {
        ScriptConfigDb._entity ??= new Db<ScriptConfig>('script-configs', jsonSchemas.scriptConfig);
    }

    public byScriptId(type: ScriptType, scriptId: Id, userId?: Id, version?: ScriptVersion): AsyncGenerator<ScriptConfig> {
        const filter: Filter<Writeable<ScriptConfig>> = {
            'script.id': scriptId,
            type
        };
        if (userId) { filter['userId'] = userId; }
        if (version !== undefined) { filter['script.version'] = version; }
        return ScriptConfigDb._entity.find(filter);
    }

    public byUserId(type: ScriptType, userId: Id): AsyncGenerator<ScriptConfig> {
        return ScriptConfigDb._entity.find({ userId, type });
    }

    public byId(id: Id): Promise<ScriptConfig | null> {
        return ScriptConfigDb._entity.findOneAsync({ id });
    }

    public add(config: ScriptConfig): Promise<void> {
        return ScriptConfigDb._entity.insertAsync(config);
    }

    public replace(config: ScriptConfig): Promise<UpdateResult> {
        return ScriptConfigDb._entity.replaceOneAsync(config);
    }

    public upsert(config: ScriptConfig): Promise<UpdateResult> {
        return ScriptConfigDb._entity.replaceOneAsync(config, { upsert: true });
    }

    public deleteById(id: Id): Promise<void> {
        return ScriptConfigDb._entity.deleteOneAsync(id);
    }
}