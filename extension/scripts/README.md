# TypeScript to Valibot Schema Generator

A generic AST-based generator that converts TypeScript type definitions to Valibot schemas using the latest best practices.

## Features

- ✅ **Generic & Reusable**: No project-specific hardcoded data
- ✅ **AST-Based**: Uses TypeScript compiler API for accurate type analysis
- ✅ **Latest Valibot Best Practices**: Uses `import * as v from 'valibot'` and modern schema patterns
- ✅ **Smart Type Detection**: Automatically detects and handles:
  - Primitive types (string, number, boolean, null, undefined)
  - Arrays and objects
  - Union types with smart nullable/optional detection
  - **Enum auto-generation**: Extracts enums from union types and generates `v.enum_()` instead of `v.picklist()`
  - Enum references with auto-import using `@/types` alias
  - Literal types
  - Complex nested structures
- ✅ **Configurable**: Fully customizable paths and options
- ✅ **Type Safety**: Generates both Input and Output types using `v.InferInput` and `v.InferOutput`

## Usage

### Basic Usage

```typescript
import { TypeScriptToValibotGenerator } from "./generate_schemas";

const generator = new TypeScriptToValibotGenerator();
await generator.generate();
```

### Advanced Configuration

```typescript
const generator = new TypeScriptToValibotGenerator({
  inputDir: "/path/to/types",
  outputDir: "/path/to/schemas",
  tsConfigPath: "/path/to/tsconfig.json",
  excludeFiles: ["index.ts", "internal.ts"],
  typesImportPath: "../../types",
  autoImportEnums: true,
});

await generator.generate();
```

## Configuration Options

| Option             | Type                        | Default            | Description                                              |
| ------------------ | --------------------------- | ------------------ | -------------------------------------------------------- |
| `inputDir`         | string                      | `../types`         | Directory containing TypeScript type definitions         |
| `outputDir`        | string                      | `../schemas`       | Directory to output generated Valibot schemas            |
| `tsConfigPath`     | string                      | `../tsconfig.json` | Path to TypeScript configuration file                    |
| `excludeFiles`     | string[]                    | `['index.ts']`     | Files to exclude from processing                         |
| `typesImportPath`  | string                      | `../types`         | Import path for types (relative to output directory)     |
| `autoImportEnums`  | boolean                     | `true`             | Whether to automatically import and use discovered enums |
| `namingConvention` | 'snake_case' \| 'camelCase' | `'snake_case'`     | Naming convention for generated schema properties        |

## Naming Convention Support

The generator supports different naming conventions for schema properties:

- **`snake_case`** (default): Preserves original property names from TypeScript types
- **`camelCase`**: Converts snake_case properties to camelCase for runtime data compatibility

### Example: snake_case vs camelCase

**TypeScript type:**

```typescript
type User = {
  user_id: number;
  first_name: string;
  last_login: Date | null;
};
```

**Generated schema with `snake_case`:**

```typescript
export const UserSchema = v.object({
  user_id: v.number(),
  first_name: v.string(),
  last_login: v.nullable(v.date()),
});
```

**Generated schema with `camelCase`:**

```typescript
export const UserSchema = v.object({
  userId: v.number(),
  firstName: v.string(),
  lastLogin: v.nullable(v.date()),
});
```

This is particularly useful when your TypeScript types use snake_case (e.g., generated from backend APIs) but your runtime data uses camelCase (e.g., after transformation with libraries like `camelcase-keys`).

## Generated Output

For a TypeScript type like:

```typescript
type User = {
  id: number;
  name: string;
  email?: string;
  status: "active" | "inactive";
  metadata: Record<string, any> | null;
};
```

The generator produces:

```typescript
import * as v from "valibot";
import { StatusEnum } from "../../../types";

export const UserSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.optional(v.string()),
  status: v.enum_(StatusEnum),
  metadata: v.nullable(v.record(v.string(), v.any())),
});

export type UserInput = v.InferInput<typeof UserSchema>;
export type UserOutput = v.InferOutput<typeof UserSchema>;
```

## Type Mapping

| TypeScript Type               | Valibot Schema                                |
| ----------------------------- | --------------------------------------------- |
| `string`                      | `v.string()`                                  |
| `number`                      | `v.number()`                                  |
| `boolean`                     | `v.boolean()`                                 |
| `null`                        | `v.null_()`                                   |
| `undefined`                   | `v.undefined_()`                              |
| `string[]`                    | `v.array(v.string())`                         |
| `string \| null`              | `v.nullable(v.string())`                      |
| `string \| undefined`         | `v.optional(v.string())`                      |
| `string \| null \| undefined` | `v.nullish(v.string())`                       |
| `"a" \| "b"`                  | `v.picklist(["a", "b"])` or `v.enum_(MyEnum)` |
| `Date`                        | `v.date()`                                    |
| `Record<string, T>`           | `v.record(v.string(), T)`                     |

## Smart Enum Detection

The generator automatically:

1. Discovers all TypeScript enums in the input directory
2. Maps union types to matching enums when possible
3. Falls back to `v.picklist()` for simple string literal unions
4. Auto-imports discovered enums in generated schemas

## CLI Usage

```bash
npm run generate-schemas
```

## NPM Package Ready

This generator is designed to be extracted into a standalone NPM package. It has:

- No project-specific dependencies
- Configurable paths and options
- TypeScript compiler API integration
- Modern ES module support

## Requirements

- TypeScript 5.0+
- ts-morph for AST parsing
- Node.js 18+

## Future Enhancements

- Support for generic types
- Custom transformer plugins
- Schema validation options
- Batch processing optimizations
- JSON Schema output support
