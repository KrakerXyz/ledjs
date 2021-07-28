// eslint-disable-next-line no-undef
module.exports = {
   'env': {
      'es6': true
   },
   'extends': [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended'
   ],
   'globals': {
      'Atomics': 'readonly',
      'SharedArrayBuffer': 'readonly',
      'module': 'readonly',
      'require': 'readonly'
   },
   'parserOptions': {
      'ecmaVersion': 2021,
      'parser': '@typescript-eslint/parser',
      'sourceType': 'module'
   },
   'plugins': [
      '@typescript-eslint'
   ],

   'rules': {

      '@typescript-eslint/explicit-module-boundary-types': [
         //https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-module-boundary-types.md
         'off'
      ],

      '@typescript-eslint/no-explicit-any': [
         'off'
      ],

      '@typescript-eslint/no-inferrable-types': [
         //Disables warning when we do something like 'const t: number = 0' where the type can be inferred
         'off'
      ],

      '@typescript-eslint/no-unused-vars': [
         'error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', ignoreRestSiblings: true }
      ],

      '@typescript-eslint/no-non-null-assertion': [
         'off'
      ],

      'max-lines': [
         //I've never used this before but like the idea of it. Lets see how restrictive or helpful it is and then discuss it. Since vue files have html and code, I could easily see this being too restrictive
         //Actually, I think this might only look at .ts files base on vue having their own max-len (line length). Lets just see how it goes
         'error',
         {
            'max': 500
         }
      ],

      'complexity': [
         //https://eslint.org/docs/rules/complexity
         'error'
      ],

      'indent': [
         //Turning off because I'm not sure how to get it to require initial indent in vue scripts
         'off',
         3
      ],

      'max-depth': [
         'error',
         3
      ],

      'quotes': [
         'error',
         'single'
      ],

      'semi': [
         'error',
         'always'
      ]
   }
};