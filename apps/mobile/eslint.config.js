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
    // react-hooks' React Compiler rules (bundled via eslint-config-expo) flag
    // react-native-reanimated's `sharedValue.value = ...` as an illegal mutation —
    // that assignment is Reanimated's documented, correct API, not a bug, and this
    // app's animation system (AnimatedPressable, Checkbox, Toggle, ProgressRing,
    // FloatingTabBar, QuickActionFab, ...) relies on it throughout. The Babel React
    // Compiler plugin itself isn't enabled in babel.config.js, so this rule is pure
    // static-analysis noise here.
    rules: {
      'react-hooks/immutability': 'off',
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
