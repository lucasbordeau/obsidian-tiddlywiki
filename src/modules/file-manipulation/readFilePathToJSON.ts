import { readFile } from 'fs/promises';

export async function readFilePathToJSON(filePath: string): Promise<any> {
  try {
    const fileContent = await readFile(filePath, 'utf8');

    const jsonData = JSON.parse(fileContent);

    return jsonData;
  } catch (error) {
    console.error(`Error reading or parsing the file at ${filePath}:`, error);

    throw error;
  }
}
