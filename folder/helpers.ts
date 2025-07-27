import path from "node:path";

export const isSubPath = (parentPath: string, child: string): boolean => {
  const relative = path.relative(parentPath, child);
  return !!relative && !relative.startsWith("..") && !path.isAbsolute(relative);
};

export const filterUnsafeFileName = (fileName: string): string => {
  return path.basename(fileName || "");
};

export const makeRelativePath = (fullFilePath: string): string => {
  if (!fullFilePath.startsWith(process.cwd())) {
    return fullFilePath;
  }
  // path.relative doesn't return ./
  return `./${path.relative(process.cwd(), fullFilePath)}`;
};
