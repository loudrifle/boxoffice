// Root ESLint config: type-aware TypeScript rules, formatting left to Prettier.
// Author: loudrifle — Last updated: 2026-10-17
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["**/dist/", "**/coverage/"]),
  eslint.configs.recommended,
  {
    files: ["**/*.ts"],
    // Type-aware rules need type information: each file is checked against its package's tsconfig.
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Last: turns off every rule that would fight with Prettier.
  prettier,
);
