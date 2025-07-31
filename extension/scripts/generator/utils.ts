import fs from "fs";

// String conversion utilities
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

// File system utilities
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const getTypeScriptFiles = (
  inputDir: string,
  excludeFiles: string[] = [],
): string[] => {
  return fs
    .readdirSync(inputDir)
    .filter((file) => file.endsWith(".ts") && !excludeFiles.includes(file));
};

// Schema generation utilities
export const generateSchemaFileName = (typeName: string): string => {
  return `${typeName}Schema.ts`;
};

export const generateCompleteSchemaContent = (
  typeName: string,
  schemaFields: string,
  imports: string,
): string => {
  return `${imports}
export const ${typeName}Schema = v.object({
${schemaFields}
});

export type ${typeName}Input = v.InferInput<typeof ${typeName}Schema>;
export type ${typeName}Output = v.InferOutput<typeof ${typeName}Schema>;
`;
};

// Enum generation utilities
export const generateEnumFileName = (enumName: string): string => {
  return `${enumName}.ts`;
};

export const generateEnumContent = (
  enumName: string,
  values: string[],
): string => {
  const enumEntries = values
    .map((value) => `  ${value} = "${value}"`)
    .join(",\n");
  return `export enum ${enumName} {
${enumEntries},
}
`;
};

export const generateExtensionTypesIndex = (
  schemaTypes: string[],
  enumNames: string[],
): string => {
  const enumExports = enumNames
    .map((name) => `export { ${name} } from "./${name}";`)
    .join("\n");
  const typeExports = schemaTypes
    .map((type) => `export type ${type} = InferOutput<typeof ${type}Schema>;`)
    .join("\n");
  const schemaImports = schemaTypes
    .map(
      (type) =>
        `import { ${type}Schema } from "../entrypoints/apis/dramas/schemas/${type}Schema";`,
    )
    .join("\n");

  return `// This file is auto-generated from Valibot schemas. Do not edit manually.
import { InferOutput } from "valibot";
${schemaImports}
${enumExports}

${typeExports}
`;
};
