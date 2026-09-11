import { writeFile } from 'fs/promises';

export async function writeJSONToFilePath(
  jsonData: any,
  filePath: string,
): Promise<void> {
  try {
    const jsonString = JSON.stringify(jsonData, null, 2);

    await writeFile(filePath, jsonString, 'utf8');

    console.log(`Successfully wrote JSON data to ${filePath}`);
  } catch (error) {
    console.error(`Error writing JSON to the file at ${filePath}:`, error);

    throw error;
  }
}
