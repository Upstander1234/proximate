import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Destructuring solely to exclude keys from a rest-spread (e.g.
      // `const {student,cost,exp,...back}=removed;`) is a standard, intentional
      // pattern, not dead code — the bound names are never read, but the
      // destructuring itself is load-bearing (it decides what `back` excludes).
      // Without this, no-unused-vars can't tell that apart from an actually
      // unused variable, which would otherwise invite exactly the wrong fix
      // (renaming to `_student` or deleting the destructure, which changes
      // what `back` contains).
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
])
