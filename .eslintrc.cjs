module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['dist/', 'node_modules/', '.playtest.html'],
  overrides: [{
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-hooks'],
    rules: {
      'no-undef': 'off', // TypeScript checks names, including DOM and type declarations.
      'no-unused-vars': 'off', // tsc checks unused values and parameters.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error'
    }
  }]
};
