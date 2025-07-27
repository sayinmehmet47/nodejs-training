import { describe, it, expect } from "vitest";
import {
  filterUnsafeFileName,
  isSubPath,
  makeRelativePath,
} from "./helpers.js";

describe("isSubPath", () => {
  describe("should return true for valid subpaths", () => {
    it("should return true when child is a direct subdirectory", () => {
      expect(isSubPath("/parent", "/parent/child")).toBe(true);
    });

    it("should return true when child is a nested subdirectory", () => {
      expect(isSubPath("/parent", "/parent/child/grandchild")).toBe(true);
    });

    it("should return true when child is a file in parent directory", () => {
      expect(isSubPath("/parent", "/parent/file.txt")).toBe(true);
    });

    it("should return true when child is a file in nested subdirectory", () => {
      expect(isSubPath("/parent", "/parent/child/file.txt")).toBe(true);
    });

    it("should return true for relative paths", () => {
      expect(isSubPath("./parent", "./parent/child")).toBe(true);
      expect(isSubPath("parent", "parent/child")).toBe(true);
    });

    it("should return true when paths are the same", () => {
      expect(isSubPath("/parent", "/parent")).toBe(false);
    });
  });

  describe("should return false for invalid subpaths", () => {
    it("should return false when child is outside parent directory", () => {
      expect(isSubPath("/parent", "/other/file.txt")).toBe(false);
    });

    it("should return false when child is in sibling directory", () => {
      expect(isSubPath("/parent", "/parent-sibling/file.txt")).toBe(false);
    });

    it("should return false when child is in parent directory", () => {
      expect(isSubPath("/parent/child", "/parent")).toBe(false);
    });

    it("should return true when child is in grandparent directory", () => {
      expect(isSubPath("/parent/child", "/parent/child/grandchild")).toBe(true);
    });

    it("should return false for completely different paths", () => {
      expect(isSubPath("/path1", "/path2")).toBe(false);
    });

    it("should return false for empty strings", () => {
      expect(isSubPath("", "/some/path")).toBe(false);
      expect(isSubPath("/some/path", "")).toBe(false);
      expect(isSubPath("", "")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle paths with dots", () => {
      expect(isSubPath("/parent", "/parent/./child")).toBe(true);
      expect(isSubPath("/parent", "/parent/child/../child")).toBe(true);
    });

    it("should handle paths with special characters", () => {
      expect(isSubPath("/parent", "/parent/child with spaces")).toBe(true);
      expect(isSubPath("/parent", "/parent/child-with-dashes")).toBe(true);
      expect(isSubPath("/parent", "/parent/child_with_underscores")).toBe(true);
    });

    it("should handle different path separators", () => {
      // On Unix-like systems
      if (process.platform !== "win32") {
        expect(isSubPath("/parent", "/parent\\child")).toBe(false);
      }
      // On Windows
      if (process.platform === "win32") {
        expect(isSubPath("C:\\parent", "C:\\parent/child")).toBe(true);
      }
    });

    it("should handle absolute vs relative paths", () => {
      expect(isSubPath("/parent", "./parent/child")).toBe(false);
      expect(isSubPath("./parent", "/parent/child")).toBe(false);
    });
  });

  describe("real-world scenarios", () => {
    it("should work with project-like paths", () => {
      expect(isSubPath("/project", "/project/src/components")).toBe(true);
      expect(isSubPath("/project", "/project/src/utils/helpers.ts")).toBe(true);
    });

    it("should work with user directory paths", () => {
      expect(isSubPath("/home/user", "/home/user/documents")).toBe(true);
      expect(isSubPath("/home/user/documents", "/home/user/downloads")).toBe(
        false
      );
    });
  });
});

describe("filterUnsafeFileName", () => {
  it("should return the basename of the file", () => {
    expect(filterUnsafeFileName("file.txt")).toBe("file.txt");
  });
  it("should handle compressed files", () => {
    expect(filterUnsafeFileName("archive.tar.gz")).toBe("archive.tar.gz");
    expect(filterUnsafeFileName("data.zip")).toBe("data.zip");
    expect(filterUnsafeFileName("backup.7z")).toBe("backup.7z");
  });
  it("should handle Unix-style paths", () => {
    expect(filterUnsafeFileName("/usr/local/bin/node")).toBe("node");
    expect(filterUnsafeFileName("//etc/passwd")).toBe("passwd");
    expect(filterUnsafeFileName("/tmp/temp-file.txt")).toBe("temp-file.txt");
  });
});

describe("makeRelativePath", () => {
  describe("should convert absolute paths to relative paths within current working directory", () => {
    it("should convert file in current directory to relative path", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/package.json`)).toBe(
        "./package.json"
      );
      expect(makeRelativePath(`${currentDir}/README.md`)).toBe("./README.md");
    });

    it("should convert file in subdirectory to relative path", () => {
      const currentDir = process.cwd();

      expect(makeRelativePath(`${currentDir}/folder/helpers.ts`)).toBe(
        "./folder/helpers.ts"
      );
      expect(makeRelativePath(`${currentDir}/folder/app.ts`)).toBe(
        "./folder/app.ts"
      );
    });

    it("should convert file in nested subdirectory to relative path", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/folder/subfolder/file.txt`)).toBe(
        "./folder/subfolder/file.txt"
      );
    });

    it("should handle files with special characters", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/file with spaces.txt`)).toBe(
        "./file with spaces.txt"
      );
      expect(makeRelativePath(`${currentDir}/file-with-dashes.txt`)).toBe(
        "./file-with-dashes.txt"
      );
      expect(makeRelativePath(`${currentDir}/file_with_underscores.txt`)).toBe(
        "./file_with_underscores.txt"
      );
    });

    it("should handle hidden files", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/.gitignore`)).toBe("./.gitignore");
      expect(makeRelativePath(`${currentDir}/.env`)).toBe("./.env");
    });
  });

  describe("should return original path for files outside current working directory", () => {
    it("should return unchanged path for system files", () => {
      expect(makeRelativePath("/usr/local/bin/node")).toBe(
        "/usr/local/bin/node"
      );
      expect(makeRelativePath("/etc/passwd")).toBe("/etc/passwd");
      expect(makeRelativePath("/var/log/system.log")).toBe(
        "/var/log/system.log"
      );
    });

    it("should return unchanged path for files in different directories", () => {
      expect(makeRelativePath("/home/user/documents/file.txt")).toBe(
        "/home/user/documents/file.txt"
      );
      expect(makeRelativePath("/tmp/temp-file.txt")).toBe("/tmp/temp-file.txt");
    });

    it("should return unchanged path for Windows-style paths", () => {
      expect(makeRelativePath("C:\\Program Files\\app.exe")).toBe(
        "C:\\Program Files\\app.exe"
      );
      expect(makeRelativePath("D:\\data\\backup.zip")).toBe(
        "D:\\data\\backup.zip"
      );
    });
  });

  describe("should handle edge cases", () => {
    it("should handle current directory path", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(currentDir)).toBe("./");
    });

    it("should handle empty string", () => {
      expect(makeRelativePath("")).toBe("");
    });

    it("should handle relative paths (should return as-is)", () => {
      expect(makeRelativePath("./file.txt")).toBe("./file.txt");
      expect(makeRelativePath("../file.txt")).toBe("../file.txt");
      expect(makeRelativePath("folder/file.txt")).toBe("folder/file.txt");
    });

    it("should handle paths with dots", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/.hidden/file.txt`)).toBe(
        "./.hidden/file.txt"
      );
      expect(makeRelativePath(`${currentDir}/file.backup.txt`)).toBe(
        "./file.backup.txt"
      );
    });
  });

  describe("should handle different file types and extensions", () => {
    it("should handle various file extensions", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/script.js`)).toBe("./script.js");
      expect(makeRelativePath(`${currentDir}/style.css`)).toBe("./style.css");
      expect(makeRelativePath(`${currentDir}/data.json`)).toBe("./data.json");
      expect(makeRelativePath(`${currentDir}/image.jpg`)).toBe("./image.jpg");
      expect(makeRelativePath(`${currentDir}/archive.zip`)).toBe(
        "./archive.zip"
      );
    });

    it("should handle files with multiple extensions", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/file.txt.bak`)).toBe(
        "./file.txt.bak"
      );
      expect(makeRelativePath(`${currentDir}/archive.tar.gz`)).toBe(
        "./archive.tar.gz"
      );
    });

    it("should handle files without extensions", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/README`)).toBe("./README");
      expect(makeRelativePath(`${currentDir}/Dockerfile`)).toBe("./Dockerfile");
      expect(makeRelativePath(`${currentDir}/Makefile`)).toBe("./Makefile");
    });
  });

  describe("real-world scenarios", () => {
    it("should handle project structure paths", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/src/components/Button.tsx`)).toBe(
        "./src/components/Button.tsx"
      );
      expect(makeRelativePath(`${currentDir}/public/index.html`)).toBe(
        "./public/index.html"
      );
      expect(makeRelativePath(`${currentDir}/dist/bundle.js`)).toBe(
        "./dist/bundle.js"
      );
    });

    it("should handle configuration files", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/package.json`)).toBe(
        "./package.json"
      );
      expect(makeRelativePath(`${currentDir}/tsconfig.json`)).toBe(
        "./tsconfig.json"
      );
      expect(makeRelativePath(`${currentDir}/.eslintrc.js`)).toBe(
        "./.eslintrc.js"
      );
    });

    it("should handle test files", () => {
      const currentDir = process.cwd();
      expect(makeRelativePath(`${currentDir}/__tests__/helpers.test.ts`)).toBe(
        "./__tests__/helpers.test.ts"
      );
      expect(makeRelativePath(`${currentDir}/tests/unit/helpers.spec.js`)).toBe(
        "./tests/unit/helpers.spec.js"
      );
    });
  });
});
