const path = require('path');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: ['dist/**', '.expo/**', 'node_modules/**'],
  },
  {
    // Anchored to this file's own directory so the "@/*" path alias still
    // resolves when eslint is invoked with a different cwd (e.g. lint-staged
    // running from the repo root via --config).
    settings: {
      'import/resolver': {
        typescript: {
          project: path.join(__dirname, 'tsconfig.json'),
        },
      },
    },
  },
  {
    // babel.config.js, metro.config.js, eslint.config.js are plain CommonJS.
    files: ['**/*.config.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'writable',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
