import { writeFile } from 'fs/promises';

export async function writeFileObjectToFilePath(
  file: File,
  filePath: string,
): Promise<void> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer);

    console.log(`Successfully wrote File object data to ${filePath}`);
  } catch (error) {
    console.error(
      `Error writing File object to the file at ${filePath}:`,
      error,
    );

    throw error;
  }
}
