import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importx from 'eslint-plugin-import-x';
import blueprint from '@blueprintjs/eslint-plugin';
import noStringIcons from './eslint/rules/no-string-icons.mjs';

// jsxA11y has a `parserOptions` key, which flat config rejects for, moved it under `languageOptions`
const { parserOptions: a11yParserOptions, ...a11yRecommended } = jsxA11y.configs.recommended;

export default tseslint.config(
  { ignores: ['build/**'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  react.configs.flat.recommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    // using the automatic (react-jsx) runtime, so the classic-runtime rules don't apply
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },
  reactHooks.configs.flat['recommended-latest'],
  {
    ...a11yRecommended,
    plugins: { 'jsx-a11y': jsxA11y },
    languageOptions: {
      parserOptions: a11yParserOptions,
    },
    // using all jsxA11y rules but mapping each rule to warn instead of error
    rules: Object.fromEntries(
      Object.entries(jsxA11y.configs.recommended.rules).map(([rule, config]) => [
        rule,
        config === 'off' ? 'off' : Array.isArray(config) ? ['warn', ...config.slice(1)] : 'warn',
      ]),
    ),
  },
  blueprint.flatConfigs.recommended,
  importx.flatConfigs.recommended,
  importx.flatConfigs.react,
  importx.flatConfigs.typescript,
  {
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
  },
  {
    // Sagas can't type yields correctly, so turn off the rule for 'any' assignment
    files: ['src/**/saga.ts', 'src/**/sagas.ts', 'src/sagas/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    plugins: { local: { rules: { 'no-string-icons': noStringIcons } } },
    rules: {
      'local/no-string-icons': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
        },
      ],
      'import-x/first': 'error',
      'import-x/no-amd': 'error',
      'import-x/no-anonymous-default-export': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['external', 'parent', 'sibling'],
          // fixes our react-redux override module counting as 'internal' instead of 'external'
          pathGroups: [{ pattern: 'react-redux', group: 'external' }],
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
);
