const baseConfig = require('@elara/config/eslint-base.cjs');

module.exports = [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
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
