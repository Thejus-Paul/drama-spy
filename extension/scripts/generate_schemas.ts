import {
  Project,
  SyntaxKind,
  TypeAliasDeclaration,
  PropertySignature,
} from "ts-morph";
import fs from "fs";
import path from "path";
import type { GeneratorConfig, GenerationContext } from "./generator/types";
import { DEFAULT_CONFIG } from "./generator/constants";
import {
  ensureDirectoryExists,
  getTypeScriptFiles,
  generateSchemaFileName,
  generateCompleteSchemaContent,
  generateEnumFileName,
  generateEnumContent,
  generateExtensionTypesIndex,
  snakeToCamel,
} from "./generator/utils";
import { EnumDiscovery } from "./generator/enumDiscovery";
import { TypeMapper } from "./generator/typeMapper";
import { PathValidator } from "./generator/pathValidator";

// Generates Valibot schemas from TypeScript type definitions
class TypeScriptToValibotGenerator {
  private context: GenerationContext;
  private enumDiscovery: EnumDiscovery;
  private typeMapper: TypeMapper;
  private pathValidator: PathValidator;

  constructor(config: Partial<GeneratorConfig> = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config } as GeneratorConfig;

    this.context = {
      config: finalConfig,
      project: new Project({
        tsConfigFilePath: config.tsConfigPath || DEFAULT_CONFIG.tsConfigPath,
      }),
      discoveredEnums: new Map(),
      usedImports: new Set(),
      usedEnums: new Set(),
    };

    // Initialize path validator with allowed directories
    const allowedDirs = [
      finalConfig.inputDir,
      finalConfig.outputDir,
      finalConfig.extensionTypesDir,
    ].filter(Boolean) as string[];

    this.pathValidator = new PathValidator(allowedDirs);
    this.enumDiscovery = new EnumDiscovery(this.context);
    this.typeMapper = new TypeMapper(this.context);
  }

  async generate(): Promise<void> {
    const { config } = this.context;

    ensureDirectoryExists(config.outputDir);
    if (config.extensionTypesDir) {
      ensureDirectoryExists(config.extensionTypesDir);
    }

    await this.enumDiscovery.discoverEnums();

    const typeFiles = getTypeScriptFiles(config.inputDir, config.excludeFiles);

    const generatedTypes: string[] = [];
    const detectedEnums = new Map<string, string[]>();

    // PHASE 1: Extract all enums from all type files first
    for (const file of typeFiles) {
      const filePath = this.pathValidator.safeJoin(config.inputDir, file);
      const typeName = path.basename(file, ".ts");

      if (this.context.discoveredEnums.has(typeName)) {
        continue;
      }

      try {
        const enumsFromType = await this.extractEnumsFromType(
          filePath,
          typeName,
        );
        enumsFromType.forEach((values, enumName) => {
          detectedEnums.set(enumName, values);
          // Add to discovered enums so TypeMapper can use them
          this.context.discoveredEnums.set(enumName, {
            name: enumName,
            filePath: config.extensionTypesDir
              ? this.pathValidator.safeJoin(
                  config.extensionTypesDir,
                  `${enumName}.ts`,
                )
              : `${enumName}.ts`,
            values,
          });
        });
      } catch (error) {
        // Silently handle errors for security - don't expose file structure
      }
    }

    // PHASE 2: Generate enum files before schema generation
    if (config.extensionTypesDir) {
      await this.generateEnumFiles(detectedEnums);
    }

    // PHASE 3: Generate schemas (TypeMapper can now use the enums)
    for (const file of typeFiles) {
      const filePath = this.pathValidator.safeJoin(config.inputDir, file);
      const typeName = path.basename(file, ".ts");

      if (this.context.discoveredEnums.has(typeName)) {
        continue;
      }

      try {
        const schemaCode = await this.generateSchemaForFile(filePath, typeName);
        if (schemaCode) {
          const outputPath = this.pathValidator.safeJoin(
            config.outputDir,
            generateSchemaFileName(typeName),
          );
          this.pathValidator.safeWriteFile(outputPath, schemaCode);
          generatedTypes.push(typeName);
        }
      } catch (error) {
        // Silently handle errors for security - don't expose file structure
      }
    }

    // PHASE 4: Generate index file
    if (config.extensionTypesDir) {
      await this.generateIndexFile(detectedEnums, generatedTypes);
    }
  }

  private async generateSchemaForFile(
    filePath: string,
    typeName: string,
  ): Promise<string | null> {
    const sourceFile = this.context.project.addSourceFileAtPath(filePath);

    this.context.usedImports.clear();
    this.context.usedEnums.clear();

    const typeAlias = sourceFile
      .getTypeAliases()
      .find((ta) => ta.getName() === typeName);
    if (!typeAlias) {
      return null;
    }

    const schemaFields = this.generateSchemaFields(typeAlias);
    if (!schemaFields) {
      return null;
    }

    const imports = this.generateImports();
    return generateCompleteSchemaContent(typeName, schemaFields, imports);
  }

  private generateSchemaFields(typeAlias: TypeAliasDeclaration): string | null {
    const typeNode = typeAlias.getTypeNode();
    if (!typeNode) return null;

    if (typeNode.getKind() === SyntaxKind.TypeLiteral) {
      const typeLiteral = typeNode.asKindOrThrow(SyntaxKind.TypeLiteral);
      const properties = typeLiteral.getProperties();

      return properties
        .map((prop) => this.generatePropertySchema(prop))
        .filter(Boolean)
        .join("\n");
    }

    return null;
  }

  private generatePropertySchema(property: PropertySignature): string | null {
    const originalName = property.getName();
    const typeNode = property.getTypeNode();
    const isOptional = property.hasQuestionToken();

    if (!typeNode) return null;

    const schemaPropertyName =
      this.context.config.namingConvention === "camelCase"
        ? snakeToCamel(originalName)
        : originalName;

    let schemaType = this.typeMapper.mapTypeNodeToValibot(
      typeNode,
      originalName,
    );

    if (isOptional) {
      schemaType = `v.optional(${schemaType})`;
      this.context.usedImports.add("optional");
    }

    return `  ${schemaPropertyName}: ${schemaType},`;
  }

  private generateImports(): string {
    let imports = `import * as v from "valibot";\n`;

    if (
      this.context.config.autoImportEnums &&
      this.context.usedEnums.size > 0
    ) {
      const enumImports = Array.from(this.context.usedEnums).sort();

      // Check if any used enums are locally generated (in extension/types)
      const localEnums = enumImports.filter((enumName) =>
        this.context.discoveredEnums
          .get(enumName)
          ?.filePath.includes("extension/types"),
      );
      const externalEnums = enumImports.filter(
        (enumName) =>
          !this.context.discoveredEnums
            .get(enumName)
            ?.filePath.includes("extension/types"),
      );

      // Import local enums using @ alias (configured in tsconfig)
      if (localEnums.length > 0) {
        imports += `import { ${localEnums.join(", ")} } from "@/types";\n`;
      }

      // Import external enums from configured path
      if (externalEnums.length > 0 && this.context.config.typesImportPath) {
        imports += `import { ${externalEnums.join(", ")} } from "${this.context.config.typesImportPath}";\n`;
      }
    }

    return imports;
  }

  private async extractEnumsFromType(
    filePath: string,
    typeName: string,
  ): Promise<Map<string, string[]>> {
    const sourceFile = this.context.project.addSourceFileAtPath(filePath);
    const detectedEnums = new Map<string, string[]>();

    const typeAlias = sourceFile
      .getTypeAliases()
      .find((ta) => ta.getName() === typeName);
    if (!typeAlias) return detectedEnums;

    const typeNode = typeAlias.getTypeNode();
    if (!typeNode || typeNode.getKind() !== SyntaxKind.TypeLiteral)
      return detectedEnums;

    const typeLiteral = typeNode.asKindOrThrow(SyntaxKind.TypeLiteral);
    const properties = typeLiteral.getProperties();

    properties.forEach((prop) => {
      const propertyName = prop.getName();
      const typeNode = prop.getTypeNode();

      if (typeNode && typeNode.getKind() === SyntaxKind.UnionType) {
        const unionType = typeNode.asKindOrThrow(SyntaxKind.UnionType);
        const typeNodes = unionType.getTypeNodes();

        const stringLiterals = typeNodes
          .filter((t) => t.getKind() === SyntaxKind.LiteralType)
          .map((t) => {
            const literal = t
              .asKindOrThrow(SyntaxKind.LiteralType)
              .getLiteral();
            if (literal.getKind() === SyntaxKind.StringLiteral) {
              return literal.getText().replace(/['"]/g, "");
            }
            return null;
          })
          .filter(Boolean) as string[];

        if (stringLiterals.length > 0) {
          // Generate enum name based on property name
          const enumName = this.generateEnumName(propertyName);
          detectedEnums.set(enumName, stringLiterals);
        }
      }
    });

    return detectedEnums;
  }

  private generateEnumName(propertyName: string): string {
    // Convert camelCase/snake_case property names to enum names
    const pascalCase = propertyName
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/^[a-z]/, (letter) => letter.toUpperCase());
    return `${pascalCase}Enum`;
  }

  private async generateEnumFiles(
    detectedEnums: Map<string, string[]>,
  ): Promise<void> {
    const { config } = this.context;
    if (!config.extensionTypesDir) return;

    // Generate enum files
    for (const [enumName, values] of detectedEnums) {
      const enumContent = generateEnumContent(enumName, values);
      const enumPath = this.pathValidator.safeJoin(
        config.extensionTypesDir,
        generateEnumFileName(enumName),
      );
      this.pathValidator.safeWriteFile(enumPath, enumContent);
    }
  }

  private async generateIndexFile(
    detectedEnums: Map<string, string[]>,
    generatedTypes: string[],
  ): Promise<void> {
    const { config } = this.context;
    if (!config.extensionTypesDir) return;

    // Generate index file
    const indexContent = generateExtensionTypesIndex(
      generatedTypes,
      Array.from(detectedEnums.keys()),
    );
    const indexPath = this.pathValidator.safeJoin(
      config.extensionTypesDir,
      "index.ts",
    );
    this.pathValidator.safeWriteFile(indexPath, indexContent);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new TypeScriptToValibotGenerator();
  generator.generate().catch(console.error);
}

// Export for programmatic use
export { TypeScriptToValibotGenerator, GeneratorConfig };
