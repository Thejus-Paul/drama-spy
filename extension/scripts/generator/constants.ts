import path from "path";
import { fileURLToPath } from "url";
import type { GeneratorConfig } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_CONFIG: GeneratorConfig = {
  inputDir: path.resolve(__dirname, "../../../types"),
  outputDir: path.resolve(__dirname, "../../entrypoints/apis/dramas/schemas"),
  tsConfigPath: path.resolve(__dirname, "../../tsconfig.json"),
  excludeFiles: ["index.ts"],
  typesImportPath: "../../../../types",
  autoImportEnums: true,
  namingConvention: "camelCase",
  extensionTypesDir: path.resolve(__dirname, "../../types"),
};

export const ENUM_SEARCH_DIRS = [
  path.resolve(__dirname, "../../types"), // extension/types
] as const;
