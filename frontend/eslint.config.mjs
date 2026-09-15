import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importx from 'eslint-plugin-import-x';
import blueprint from '@blueprintjs/eslint-plugin';

export default tseslint.config(
  { ignores: ['build/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'import-x': importx,
      '@blueprintjs': blueprint,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // using jsxA11y but mapping each rule to warn instead of error
      ...Object.fromEntries(
        Object.entries(jsxA11y.configs.recommended.rules).map(([rule, config]) => [
          rule,
          config === 'off' ? 'off' : Array.isArray(config) ? ['warn', ...config.slice(1)] : 'warn',
        ]),
      ),
      ...blueprint.flatConfigs.recommended.rules,
      'import-x/first': 'error',
      'import-x/no-amd': 'error',
      'import-x/no-anonymous-default-export': 'warn',
      'import-x/order': [
        'error',
        {
          groups: ['external', 'parent', 'sibling'],
          pathGroups: [{ pattern: '^\\.\\/index$', group: 'sibling', position: 'after' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'react/prop-types': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['memo'],
              message: 'Do not use React.memo — components are not memoized.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='React'][callee.property.name='memo']",
          message: 'Do not use React.memo — components are not memoized.',
        },
      ],
    },
  },
  {
    // Sagas can't type yields correctly, so turn off the rule for 'any' assignment
    files: ['src/**/saga.ts', 'src/**/sagas.ts', 'src/sagas/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
        },
      ],
    },
  },
);
