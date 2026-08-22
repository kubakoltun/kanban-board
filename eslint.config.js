import js from '@eslint/js';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.js'],
        extends: [
            js.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            // Style / code-quality preferences
            'no-unused-vars': ['warn', {
                args: 'after-used',
                ignoreRestSiblings: true,
            }],
        },
    },
]);
