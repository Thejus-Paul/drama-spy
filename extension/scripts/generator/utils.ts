import { PathValidator } from "./pathValidator";

// String conversion utilities
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

// File system utilities
export const ensureDirectoryExists = (dirPath: string): void => {
  try {
    // Create a temporary PathValidator to check if the directory is allowed
    const pathValidator = new PathValidator([dirPath]);
    if (!pathValidator.safeExists(dirPath)) {
      const keepFilePath = pathValidator.safeJoin(dirPath, ".keep");
      pathValidator.safeWriteFile(keepFilePath, "");
    }
  } catch (error) {
    // Silently fail for security - don't expose directory structure
  }
};

export const getTypeScriptFiles = (
  inputDir: string,
  excludeFiles: string[] = [],
): string[] => {
  try {
    const pathValidator = new PathValidator([inputDir]);

    if (!pathValidator.safeExists(inputDir)) {
      return [];
    }

    const files = pathValidator.safeReadDir(inputDir);

    const tsFiles = files.filter(
      (file) => file.endsWith(".ts") && !excludeFiles.includes(file),
    );

    return tsFiles;
  } catch (error) {
    // Return empty array on any error for security
    return [];
  }
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
