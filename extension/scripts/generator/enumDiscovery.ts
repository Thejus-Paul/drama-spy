import path from "path";
import { fileURLToPath } from "url";
import { SyntaxKind } from "ts-morph";
import type { GenerationContext } from "./types";
import { ENUM_SEARCH_DIRS } from "./constants";
import { PathValidator } from "./pathValidator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handles discovery of enums in TypeScript files
export class EnumDiscovery {
  private pathValidator: PathValidator;

  constructor(private context: GenerationContext) {
    const { config } = this.context;
    const allowedDirs = [...ENUM_SEARCH_DIRS, config.inputDir].filter(
      Boolean,
    ) as string[];

    this.pathValidator = new PathValidator(allowedDirs);
  }

  async discoverEnums(): Promise<void> {
    const { config } = this.context;

    const enumSearchDirs = [
      ...ENUM_SEARCH_DIRS,
      config.inputDir, // Also search the target input directory
    ];

    for (const searchDir of enumSearchDirs) {
      try {
        if (!this.pathValidator.safeExists(searchDir)) continue;
        await this.searchDirectoryForEnums(searchDir);
      } catch (error) {
        // Silently skip directories that can't be accessed for security
        continue;
      }
    }
  }

  private async searchDirectoryForEnums(searchDir: string): Promise<void> {
    try {
      const files = this.pathValidator
        .safeReadDir(searchDir)
        .filter((f) => f.endsWith(".ts"));

      for (const file of files) {
        try {
          const filePath = this.pathValidator.safeJoin(searchDir, file);
          await this.processFileForEnums(filePath);
        } catch (error) {
          // Ignore files that can't be processed for security
        }
      }
    } catch (error) {
      // Silently fail for security - don't expose directory structure
    }
  }

  private async processFileForEnums(filePath: string): Promise<void> {
    const sourceFile = this.context.project.addSourceFileAtPath(filePath);

    sourceFile.getEnums().forEach((enumDeclaration) => {
      const enumName = enumDeclaration.getName();
      const values = enumDeclaration.getMembers().map((member) => {
        const initializer = member.getInitializer();
        if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
          return initializer.getText().replace(/['"]/g, "");
        }
        return member.getName();
      });

      this.context.discoveredEnums.set(enumName, {
        name: enumName,
        filePath,
        values,
      });
    });
  }
}
