const baseConfig = require('@elara/config/eslint-base.cjs');

module.exports = [
  ...baseConfig,
  {
    // Double-globstar so this matches whether eslint resolves `files` relative to this
    // config's own directory (normal auto-discovery) or relative to the invoking cwd
    // (lint-staged runs `eslint --config apps/api/eslint.config.js <path>` from the repo
    // root) — with a plain 'src/**/*.ts' the override silently failed to match in the
    // second case, so the base config's autofixing consistent-type-imports rule won and
    // kept reverting NestJS's DI-required value imports back to `import type` on every commit.
    files: ['**/src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // NestJS's DI resolves constructor params via emitDecoratorMetadata at
      // runtime, which needs the real class import — auto-fixing these to
      // `import type` silently breaks injection (Nest falls back to
      // `Object` and can't resolve the provider).
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
