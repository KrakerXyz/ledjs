import tsj from 'ts-json-schema-generator';
import { writeFileSync } from 'fs';

const dbSchemas = {
    '../core/src/rest/model/Animation': ['Animation'],
    '../core/src/rest/model/ScriptConfig': ['ScriptConfig'],
    '../core/src/rest/model/Device': ['Device'],
    '../core/src/rest/model/PostProcessor': ['PostProcessor', 'PostProcessorPost'],
    '../core/src/rest/model/User': ['User'],
    '../core/src/rest/model/Strand': ['Strand', 'StrandPost'],
};

for (const entry of Object.entries(dbSchemas)) {

    const [path, types] = entry;
    for (const typeName of types) {

        const config = {
            path,
            tsconfig: 'tsconfig.json',
            type: typeName,
            jsDoc: 'none',
            topRef: false,
            expose: 'none',
            additionalProperties: undefined, // without this, types that are "anyOf" (from a union) will just match the first that contains all the listed properties. Seems to have to be undefined not false (didn't research what it actually means)
        };

        console.log(`Generating JSON Schema for ${typeName} from ${path}`);
        const schema = tsj.createGenerator(config).createSchema(typeName);
        writeFileSync(`./src/db/schema/${typeName}.schema.json`, JSON.stringify(schema, null, 2));
    }
}