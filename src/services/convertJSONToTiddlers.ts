import { Tiddler } from 'src/modules/tiddlywiki/types/Tiddler';

export async function convertJSONToTiddlers(file: File): Promise<Tiddler[]> {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = () => {
      const tiddlers: Tiddler[] = JSON.parse(fileReader.result as string);
      resolve(tiddlers);
    };
    fileReader.onerror = () => {
      reject(fileReader.error);
    };
    fileReader.readAsText(file, 'UTF-8');
  });
}
