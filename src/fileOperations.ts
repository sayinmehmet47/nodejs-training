import { writeFile, unlink, copyFile, appendFile } from "fs/promises";

export const createFile = async (filePath: string): Promise<void> => {
  console.log(`Attempting to create file: ${filePath}`);
  try {
    await writeFile(filePath, "", { flag: "wx" });
    console.log(`File created successfully: ${filePath}`);
  } catch (createError: any) {
    if (createError.code === "EEXIST") {
      console.log(`File already exists: ${filePath}`);
    } else {
      console.error(`Error creating file ${filePath}:`, createError);
    }
  }
};

export const deleteFile = async (filePath: string): Promise<void> => {
  console.log(`Attempting to delete file: ${filePath}`);
  try {
    await unlink(filePath);
    console.log(`File deleted successfully: ${filePath}`);
  } catch (deleteError: any) {
    if (deleteError.code === "ENOENT") {
      // It's often okay if the file doesn't exist when trying to delete
      console.log(`File not found, skipping delete: ${filePath}`);
    } else {
      console.error(`Error deleting file ${filePath}:`, deleteError);
      // Re-throw or handle more gracefully depending on requirements
      // throw deleteError;
    }
  }
};

export const renameFile = async (
  filePath: string,
  destFilePath: string
): Promise<void> => {
  console.log(`Attempting to rename file: ${filePath}`);
  try {
    await copyFile(filePath, destFilePath);
    console.log(`File copied successfully: ${filePath}`);
  } catch (copyError) {
    if (copyError.code === "ENOENT") {
      // It's often okay if the file doesn't exist when trying to delete
      console.log(`File not found, skipping delete: ${filePath}`);
    } else {
      console.error(`Error deleting file ${filePath}:`, copyError);
    }
  }
};

export const addToFile = async (
  filePath: string,
  content: string
): Promise<void> => {
  console.log(`Attempting to add content to file: ${filePath}`);
  try {
    await appendFile(filePath, content);
    console.log(`Content added successfully to: ${filePath}`);
  } catch (appendError: any) {
    if (appendError.code === "ENOENT") {
      console.error(`Error: File not found, cannot append: ${filePath}`);
    } else {
      console.error(`Error appending to file ${filePath}:`, appendError);
    }
  }
};
