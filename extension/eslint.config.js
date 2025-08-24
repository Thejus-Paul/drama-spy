import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const common = { files: ["**/*.{js,ts}"] };

export default defineConfig([
  globalIgnores([".wxt", ".output", "scripts"]),
  { ...common, languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
]);
