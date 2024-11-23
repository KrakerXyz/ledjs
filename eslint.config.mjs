import krakerxyz from '@krakerxyz/eslint-config';


/** @type {import('eslint').Linter.Config[]} */
export default [
    ...krakerxyz,
    {
        languageOptions: {
            globals: {
                'netled': 'readonly',
            },
        }
    }
];