import fs from "fs";
import path from "path";
import { SyntaxKind } from "ts-morph";
import type { GenerationContext } from "./types";
import { ENUM_SEARCH_DIRS } from "./constants";

// Handles discovery of enums in TypeScript files
export class EnumDiscovery {
  constructor(private context: GenerationContext) {}

  async discoverEnums(): Promise<void> {
    const { config } = this.context;

    const enumSearchDirs = [
      ...ENUM_SEARCH_DIRS,
      config.inputDir, // Also search the target input directory
    ];

    for (const searchDir of enumSearchDirs) {
      if (!fs.existsSync(searchDir)) continue;
      await this.searchDirectoryForEnums(searchDir);
    }
  }

  private async searchDirectoryForEnums(searchDir: string): Promise<void> {
    const files = fs.readdirSync(searchDir).filter((f) => f.endsWith(".ts"));

    for (const file of files) {
      const filePath = path.join(searchDir, file);
      try {
        await this.processFileForEnums(filePath);
      } catch (error) {
        // Ignore files that can't be processed
      }
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
