const baseConfig = require('./packages/config/eslint-base.cjs');

/**
 * Covers packages/* (which have no eslint.config.js of their own) and any
 * root-level scripts. apps/api and apps/mobile own their own eslint.config.js
 * and are intentionally excluded here to avoid two configs disagreeing about
 * the same files — lint-staged and each app's `npm run lint` target those
 * directly via --config.
 */
module.exports = [
  {
    ignores: ['apps/**', 'node_modules/**', '**/dist/**', '**/.expo/**', '**/coverage/**'],
  },
  ...baseConfig,
];
