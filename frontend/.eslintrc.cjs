// Copyright © 2024 Navarrotech

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist',
    'vite-env.d.ts',
    '.eslintrc.cjs',
    'node_modules',
    '.json'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react-refresh',
    'header',
    '@stylistic/js'
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    //////////////////////////////////////////
    // Typescript rules:

    // Allow any https://typescript-eslint.io/rules/no-explicit-any/
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow ts-ignore https://typescript-eslint.io/rules/ban-ts-comment/
    '@typescript-eslint/ban-ts-comment': 'off',
    // Allow banned types https://typescript-eslint.io/rules/ban-types/
    '@typescript-eslint/ban-types': 'off',

    //////////////////////////////////////////
    // Enforcing consistency

    // Enforce single quotes https://eslint.org/docs/latest/rules/quotes
    quotes: ['error', 'single'],
    // Enforce 2 spaces https://eslint.org/docs/latest/rules/indent
    indent: ['error', 2],
    // Enforce no comma dangling https://eslint.org/docs/latest/rules/comma-dangle
    'comma-dangle': ['error', 'never'],
    // Camel case! https://eslint.org/docs/latest/rules/camelcase
    camelcase: 'warn',
    // No unused vars https://eslint.org/docs/latest/rules/no-unused-vars
    'no-unused-vars': 'warn',
    // No useless escape https://eslint.org/docs/latest/rules/no-useless-escape
    'no-useless-escape': 'error',
    // Disable vars https://eslint.org/docs/latest/rules/no-var
    'no-var': 'error',
    // Disable yoda https://eslint.org/docs/latest/rules/yoda
    yoda: 'error',
    // Disable semi colons https://eslint.org/docs/latest/rules/semi
    semi: ['error', 'never'],
    // Ensure that we're using curly braces for all lines https://eslint.org/docs/latest/rules/curly
    "curly": ["error", "all"],
    // No single-line magic: https://eslint.org/docs/latest/rules/brace-style
    "brace-style": ["error", "stroustrup", { "allowSingleLine": false }],
    // End of line https://eslint.style/packages/js
    // Depreciated original package: (https://eslint.org/docs/latest/rules/eol-last)
    '@stylistic/js/eol-last': ['error', 'always'],
    // Enforce spacing https://eslint.org/docs/latest/rules/keyword-spacing
    'keyword-spacing': ['error', { before: true, after: true }],
    // Array and object spacing https://eslint.org/docs/latest/rules/array-bracket-spacing
    'array-bracket-spacing': [
      'error',
      'always',
      {
        objectsInArrays: false,
        arraysInArrays: false,
      },
    ],
    // Object curly spacing https://eslint.org/docs/latest/rules/object-curly-spacing
    'object-curly-spacing': [
      'error',
      'always',
      {
        objectsInObjects: false,
        arraysInObjects: false,
      },
    ],

    //////////////////////////////////////////
    // Best practices

    // Disable no console https://eslint.org/docs/latest/rules/no-console
    // We should be using an official logger like log4js:
    'no-console': 'warn',

    // Custom plugin: https://www.npmjs.com/package/eslint-plugin-header
    // We should be enforcing a copyright header on all files
    'header/header': ['error', 'line', [
      {
        pattern: 'Copyright © \\d{4} 2024 Navarrotech',
        template: 'Copyright © 2024 2024 Navarrotech'
      }
    ]],
  },
};
