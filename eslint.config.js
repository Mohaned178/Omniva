import js from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const WEB_FILES = ['apps/web/**/*.{ts,tsx}'];

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/generated/**',
      '**/next-env.d.ts',
      'graphify-out/**',
      '**/*.config.{js,mjs}',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['packages/*/vitest.config.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // CODING_STANDARDS §4: exhaustive switches end in a `never` check.
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: false }],
      // Abstract classes double as DI tokens for plain values (AppConfig), and NestJS declares
      // its option bags as classes; neither is ever checked with `instanceof`.
      '@typescript-eslint/no-unsafe-class-instance-assignment': 'off',
    },
  },
  {
    // Plain JavaScript tooling scripts have no TypeScript project to type-check against.
    files: ['scripts/**/*.mjs', 'apps/*/scripts/**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    // NestJS modules are classes that exist only to carry decorators.
    files: ['apps/api/src/**/*.module.ts'],
    rules: { '@typescript-eslint/no-extraneous-class': 'off' },
  },
  ...nextCoreWebVitals.map((config) => ({ ...config, files: WEB_FILES })),
  {
    files: WEB_FILES,
    languageOptions: { globals: globals.browser },
    settings: { next: { rootDir: 'apps/web' } },
  },
  prettier,
);
