import { SyntaxKind, TypeNode, UnionTypeNode } from "ts-morph";
import type { GenerationContext, EnumInfo } from "./types";

// TypeScript to Valibot schema mapper
export class TypeMapper {
  constructor(private context: GenerationContext) {}

  mapTypeNodeToValibot(typeNode: TypeNode, propertyName?: string): string {
    const kind = typeNode.getKind();

    switch (kind) {
      case SyntaxKind.StringKeyword:
        this.context.usedImports.add("string");
        return "v.string()";

      case SyntaxKind.NumberKeyword:
        this.context.usedImports.add("number");
        return "v.number()";

      case SyntaxKind.BooleanKeyword:
        this.context.usedImports.add("boolean");
        return "v.boolean()";

      case SyntaxKind.ObjectKeyword:
        this.context.usedImports.add("record");
        this.context.usedImports.add("unknown");
        return "v.record(v.string(), v.unknown())";

      case SyntaxKind.NullKeyword:
        this.context.usedImports.add("null_");
        return "v.null_()";

      case SyntaxKind.UndefinedKeyword:
        this.context.usedImports.add("undefined_");
        return "v.undefined_()";

      case SyntaxKind.ArrayType:
        return this.handleArrayType(typeNode);

      case SyntaxKind.UnionType:
        return this.handleUnionType(
          typeNode.asKindOrThrow(SyntaxKind.UnionType),
          propertyName,
        );

      case SyntaxKind.LiteralType:
        return this.handleLiteralType(typeNode);

      case SyntaxKind.TypeReference:
        return this.handleTypeReference(typeNode);

      default:
        this.context.usedImports.add("unknown");
        return "v.unknown()";
    }
  }

  private handleArrayType(typeNode: TypeNode): string {
    const arrayType = typeNode.asKindOrThrow(SyntaxKind.ArrayType);
    const elementType = this.mapTypeNodeToValibot(
      arrayType.getElementTypeNode(),
    );
    this.context.usedImports.add("array");
    return `v.array(${elementType})`;
  }

  private handleLiteralType(typeNode: TypeNode): string {
    const literalType = typeNode.asKindOrThrow(SyntaxKind.LiteralType);
    const literal = literalType.getLiteral();

    if (literal.getKind() === SyntaxKind.StringLiteral) {
      this.context.usedImports.add("literal");
      return `v.literal("${literal.getText().replace(/['"]/g, "")}")`;
    }
    if (literal.getKind() === SyntaxKind.NumericLiteral) {
      this.context.usedImports.add("literal");
      return `v.literal(${literal.getText()})`;
    }

    this.context.usedImports.add("unknown");
    return "v.unknown()";
  }

  private handleTypeReference(typeNode: TypeNode): string {
    const typeRef = typeNode.asKindOrThrow(SyntaxKind.TypeReference);
    const typeName = typeRef.getTypeName().getText();

    if (this.context.discoveredEnums.has(typeName)) {
      this.context.usedImports.add("enum_");
      this.context.usedEnums.add(typeName);
      return `v.enum_(${typeName})`;
    }

    if (typeName === "Date") {
      this.context.usedImports.add("date");
      return "v.date()";
    }

    this.context.usedImports.add("unknown");
    return "v.unknown()";
  }

  private handleUnionType(
    unionType: UnionTypeNode,
    propertyName?: string,
  ): string {
    const types = unionType.getTypeNodes();
    const typeTexts = this.extractTypeTexts(types);

    // Check for nullable pattern (Type | null)
    if (this.isNullablePattern(types, typeTexts)) {
      return this.handleNullablePattern(types, propertyName);
    }

    // Check for optional pattern (Type | undefined)
    if (this.isOptionalPattern(types, typeTexts)) {
      return this.handleOptionalPattern(types, propertyName);
    }

    // Check for nullish pattern (Type | null | undefined)
    if (this.isNullishPattern(types, typeTexts)) {
      return this.handleNullishPattern(types, propertyName);
    }

    // Check if all types are string literals (potential enum)
    if (this.areAllStringLiterals(types)) {
      return this.handleStringLiteralUnion(typeTexts);
    }

    // General union
    return this.handleGeneralUnion(types, propertyName);
  }

  private extractTypeTexts(types: TypeNode[]): string[] {
    return types.map((type) => {
      const kind = type.getKind();
      if (kind === SyntaxKind.LiteralType) {
        const literal = type.asKindOrThrow(SyntaxKind.LiteralType).getLiteral();
        if (literal.getKind() === SyntaxKind.StringLiteral) {
          return literal.getText().replace(/['"]/g, "");
        }
      } else if (kind === SyntaxKind.NullKeyword) {
        return "null";
      } else if (kind === SyntaxKind.UndefinedKeyword) {
        return "undefined";
      }
      return type.getText();
    });
  }

  private isNullablePattern(types: TypeNode[], typeTexts: string[]): boolean {
    return types.length === 2 && typeTexts.includes("null");
  }

  private isOptionalPattern(types: TypeNode[], typeTexts: string[]): boolean {
    return types.length === 2 && typeTexts.includes("undefined");
  }

  private isNullishPattern(types: TypeNode[], typeTexts: string[]): boolean {
    return (
      types.length === 3 &&
      typeTexts.includes("null") &&
      typeTexts.includes("undefined")
    );
  }

  private areAllStringLiterals(types: TypeNode[]): boolean {
    return types.every((type) => {
      const kind = type.getKind();
      return (
        kind === SyntaxKind.LiteralType &&
        type.asKindOrThrow(SyntaxKind.LiteralType).getLiteral().getKind() ===
          SyntaxKind.StringLiteral
      );
    });
  }

  private handleNullablePattern(
    types: TypeNode[],
    propertyName?: string,
  ): string {
    const nonNullType = types.find(
      (type) => type.getKind() !== SyntaxKind.NullKeyword,
    );
    if (nonNullType) {
      const innerSchema = this.mapTypeNodeToValibot(nonNullType, propertyName);
      this.context.usedImports.add("nullable");
      return `v.nullable(${innerSchema})`;
    }
    this.context.usedImports.add("unknown");
    return "v.unknown()";
  }

  private handleOptionalPattern(
    types: TypeNode[],
    propertyName?: string,
  ): string {
    const nonUndefinedType = types.find(
      (type) => type.getKind() !== SyntaxKind.UndefinedKeyword,
    );
    if (nonUndefinedType) {
      const innerSchema = this.mapTypeNodeToValibot(
        nonUndefinedType,
        propertyName,
      );
      this.context.usedImports.add("optional");
      return `v.optional(${innerSchema})`;
    }
    this.context.usedImports.add("unknown");
    return "v.unknown()";
  }

  private handleNullishPattern(
    types: TypeNode[],
    propertyName?: string,
  ): string {
    const nonNullishType = types.find(
      (type) =>
        type.getKind() !== SyntaxKind.NullKeyword &&
        type.getKind() !== SyntaxKind.UndefinedKeyword,
    );
    if (nonNullishType) {
      const innerSchema = this.mapTypeNodeToValibot(
        nonNullishType,
        propertyName,
      );
      this.context.usedImports.add("nullish");
      return `v.nullish(${innerSchema})`;
    }
    this.context.usedImports.add("unknown");
    return "v.unknown()";
  }

  private handleStringLiteralUnion(typeTexts: string[]): string {
    const enumValues = typeTexts.filter(
      (t) => t !== "null" && t !== "undefined",
    );

    const matchingEnum = this.findMatchingEnum(enumValues);
    if (matchingEnum) {
      this.context.usedImports.add("enum_");
      this.context.usedEnums.add(matchingEnum.name);
      return `v.enum_(${matchingEnum.name})`;
    }

    this.context.usedImports.add("picklist");
    return `v.picklist([${enumValues.map((v) => `"${v}"`).join(", ")}])`;
  }

  private findMatchingEnum(enumValues: string[]): EnumInfo | undefined {
    return Array.from(this.context.discoveredEnums.values()).find(
      (enumInfo) => {
        return (
          enumValues.every((value) => enumInfo.values.includes(value)) &&
          enumInfo.values.every((value) => enumValues.includes(value))
        );
      },
    );
  }

  private handleGeneralUnion(types: TypeNode[], propertyName?: string): string {
    const unionSchemas = types.map((type) =>
      this.mapTypeNodeToValibot(type, propertyName),
    );
    this.context.usedImports.add("union");
    return `v.union([${unionSchemas.join(", ")}])`;
  }
}
