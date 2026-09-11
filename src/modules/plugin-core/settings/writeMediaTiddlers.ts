import * as path from 'path';
import { convertBase64ToFileObject } from '../../file-manipulation/convertBase64ToFileObject';
import { writeFileObjectToFilePath } from '../../file-manipulation/writeFileObjectToFilePath';
import type { Tiddler } from '../../tiddlywiki/Tiddler';

export async function writeMediaTiddlers(
  tiddlers: Tiddler[],
  importPath: string,
): Promise<void> {
  const nonTextTiddlers = tiddlers.filter(
    (tiddler) => 'type' in tiddler && !tiddler.type?.contains('text'),
  );

  const mediaFiles = nonTextTiddlers.map((nonTextTiddler) =>
    convertBase64ToFileObject(
      nonTextTiddler.text,
      nonTextTiddler.title,
      nonTextTiddler.type ?? 'text/plain',
    ),
  );

  for (const mediaFile of mediaFiles) {
    const mediaFilePath = path.join(importPath, mediaFile.name);

    await writeFileObjectToFilePath(mediaFile, mediaFilePath);
  }
}
