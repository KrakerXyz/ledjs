
export type AjvSchema<T = any> = {
    type: 'object' | 'array',
    properties: Record<keyof T, AjvPropertyType>
    required: (keyof T)[],
    additionalProperties: boolean
}

export type AjvPropertyTypeNames = 'number' | 'integer' | 'string' | 'boolean' | 'array' | 'object';

export type AjvPropertyType = {
    type: AjvPropertyTypeNames | AjvPropertyTypeNames[];
    nullable?: boolean;
    uniqueItems?: boolean;
    items?: AjvPropertyType[];
} | AjvSchema;