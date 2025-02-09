import path from "path";
import fs from "fs";

// Secure path validator that prevents path traversal attacks
export class PathValidator {
  private readonly allowedDirectories: Set<string>;
  private readonly allowedExtensions: Set<string>;
  private readonly maxPathLength: number = 4096; // Maximum path length

  constructor(allowedDirectories: string[]) {
    // Normalize and resolve all allowed directories
    this.allowedDirectories = new Set(
      allowedDirectories
        .filter(Boolean)
        .map((dir) => path.resolve(path.normalize(dir))),
    );

    // Only allow specific file extensions for security
    this.allowedExtensions = new Set([".ts", ".js", ".json"]);
  }

  /**
   * Validates if a path is within allowed directories using strict checks
   */
  private isPathAllowed(filePath: string): boolean {
    if (!filePath || typeof filePath !== "string") {
      return false;
    }

    // Normalize the path to prevent traversal attacks
    const normalizedPath = path.normalize(filePath);
    const resolvedPath = path.resolve(normalizedPath);

    // Check path length
    if (resolvedPath.length > this.maxPathLength) {
      return false;
    }

    // Check if the resolved path starts with any allowed directory
    return Array.from(this.allowedDirectories).some((allowedDir) => {
      const normalizedAllowedDir = path.normalize(allowedDir);
      const resolvedAllowedDir = path.resolve(normalizedAllowedDir);

      // Ensure the path is within or equal to the allowed directory
      return resolvedPath.startsWith(resolvedAllowedDir);
    });
  }

  /**
   * Validates path components for malicious patterns
   */
  private validatePathComponents(...paths: string[]): void {
    for (const pathComponent of paths) {
      if (!pathComponent || typeof pathComponent !== "string") {
        throw new Error("Path component must be a non-empty string");
      }

      // Check for path traversal patterns
      if (
        pathComponent.includes("..") ||
        pathComponent.includes("~") ||
        pathComponent.includes("\\") ||
        pathComponent.includes("//")
      ) {
        throw new Error(
          `Path traversal detected in component: ${pathComponent}`,
        );
      }

      // Check for null bytes or other dangerous characters
      if (pathComponent.includes("\0") || pathComponent.includes("\u0000")) {
        throw new Error(
          `Invalid characters detected in path component: ${pathComponent}`,
        );
      }
    }
  }

  /**
   * Safely joins paths with strict validation
   */
  safeJoin(baseDir: string, ...paths: string[]): string {
    // Validate all path components first
    this.validatePathComponents(baseDir, ...paths);

    // Join paths safely
    const joinedPath = path.join(baseDir, ...paths);

    // Final validation of the complete path
    if (!this.isPathAllowed(joinedPath)) {
      throw new Error(`Path traversal detected: ${joinedPath}`);
    }

    return joinedPath;
  }

  /**
   * Validates if a directory exists and is allowed
   */
  validateDirectory(dirPath: string): boolean {
    if (!this.isPathAllowed(dirPath)) {
      throw new Error(`Access denied to directory: ${dirPath}`);
    }

    return fs.existsSync(dirPath);
  }

  /**
   * Safely reads directory contents with validation
   */
  safeReadDir(dirPath: string): string[] {
    if (!this.validateDirectory(dirPath)) {
      return [];
    }

    try {
      return fs.readdirSync(dirPath);
    } catch (error) {
      // Return empty array on any error for security
      return [];
    }
  }

  /**
   * Safely writes file with comprehensive validation
   */
  safeWriteFile(filePath: string, content: string): void {
    if (!this.isPathAllowed(filePath)) {
      throw new Error(`Access denied to file: ${filePath}`);
    }

    // Validate file extension
    const ext = path.extname(filePath);
    if (!this.allowedExtensions.has(ext)) {
      throw new Error(`Disallowed file extension: ${ext}`);
    }

    // Validate content
    if (typeof content !== "string") {
      throw new Error("Content must be a string");
    }

    try {
      // Ensure parent directory exists
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Write file with explicit encoding
      fs.writeFileSync(filePath, content, "utf8");
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Safely checks if file exists
   */
  safeExists(filePath: string): boolean {
    if (!this.isPathAllowed(filePath)) {
      return false;
    }

    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the list of allowed directories for debugging
   */
  getAllowedDirectories(): string[] {
    return Array.from(this.allowedDirectories);
  }
}
