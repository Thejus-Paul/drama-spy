import type { Project } from "ts-morph";

// Configuration interface for the generator
export interface GeneratorConfig {
  /** Directory containing TypeScript type definitions */
  inputDir: string;
  /** Directory to output generated Valibot schemas */
  outputDir: string;
  /** Path to tsconfig.json */
  tsConfigPath: string;
  /** Files to exclude from processing */
  excludeFiles?: string[];
  /** Custom import path for types (relative to output directory) */
  typesImportPath?: string;
  /** Whether to generate enum imports automatically */
  autoImportEnums?: boolean;
  /** Naming convention for generated schema properties */
  namingConvention?: "snake_case" | "camelCase";
  /** Directory to output extension enum and type files */
  extensionTypesDir?: string;
}

// Discovered enum information
export interface EnumInfo {
  name: string;
  filePath: string;
  values: string[];
}

// Schema generation context
export interface GenerationContext {
  config: GeneratorConfig;
  project: Project;
  discoveredEnums: Map<string, EnumInfo>;
  usedImports: Set<string>;
  usedEnums: Set<string>;
}
