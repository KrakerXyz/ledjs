
import Ajv, { type ValidateFunction } from 'ajv';


const formats = {
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
};

const ajvCompilers: Record<'body' | 'params' | 'querystring' | 'entity', Ajv.default> = {
    body: new Ajv.default({
        removeAdditional: false,
        coerceTypes: false,
        allErrors: true,
        allowUnionTypes: true,
        discriminator: true,
        strictTuples: false, // without this we get warning about the json schema generated from [string, ...string[]]
        formats
    }),
    params: new Ajv.default({
        removeAdditional: false,
        coerceTypes: true,
        allErrors: true,
        allowUnionTypes: true, // needed for when we have ScriptVersions as part of the path
        formats
    }),
    querystring: new Ajv.default({
        removeAdditional: false,
        coerceTypes: true,
        allErrors: true,
        formats
    }),
    entity: new Ajv.default({
        removeAdditional: true,
        coerceTypes: true,
        allErrors: true,
        allowUnionTypes: true,
        discriminator: true,
        strictTuples: false, // without this we get warning about the json schema generated from [string, ...string[]]
        formats
    })
};

export const jsonSchemas = {
    animation: await import('./Animation.schema.json', { with: { type: 'json' } }).then(x => x.default),
    animationConfig: await import('./AnimationConfig.schema.json', { with: { type: 'json' } }).then(x => x.default),
    device: await import('./Device.schema.json', { with: { type: 'json' } }).then(x => x.default),
    postProcessor: await import('./PostProcessor.schema.json', { with: { type: 'json' } }).then(x => x.default),
    postProcessorPost: await import('./PostProcessorPost.schema.json', { with: { type: 'json' } }).then(x => x.default),
    user: await import('./User.schema.json', { with: { type: 'json' } }).then(x => x.default),
    strand: await import('./Strand.schema.json', { with: { type: 'json' } }).then(x => x.default),
    strandPost: await import('./StrandPost.schema.json', { with: { type: 'json' } }).then(x => x.default),
};

const validators = new Map<string, ValidateFunction>();
export function getSchemaValidator(type: keyof typeof ajvCompilers, schema: any) {
    const key = `${type}:${JSON.stringify(schema)}`;
    let validator = validators.get(key);
    if (validator) { return validator; }
    const compiler = ajvCompilers[type];
    validator = compiler.compile(schema);
    validators.set(key, validator);
    return validator;
}
