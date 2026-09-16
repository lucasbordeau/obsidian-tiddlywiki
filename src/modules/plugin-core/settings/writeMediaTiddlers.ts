import * as path from 'path';
import { convertBase64ToFileObject } from '@/modules/file-manipulation/convertBase64ToFileObject';
import { writeFileObjectToFilePath } from '@/modules/file-manipulation/writeFileObjectToFilePath';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

export async function writeMediaTiddlers(
  tiddlers: Tiddler[],
  importPath: string,
): Promise<void> {
  const embeddedMediaTiddlers = tiddlers.filter((tiddler) => {
    const hasMediaType = Boolean(
      tiddler.type && !tiddler.type.includes('text'),
    );

    const hasCanonicalUri = Boolean(tiddler._canonical_uri);
    const shouldWriteEmbeddedMedia = hasMediaType && !hasCanonicalUri;

    return shouldWriteEmbeddedMedia;
  });

  const mediaFiles = embeddedMediaTiddlers.map((embeddedMediaTiddler) =>
    convertBase64ToFileObject(
      embeddedMediaTiddler.text,
      embeddedMediaTiddler.title,
      embeddedMediaTiddler.type ?? 'text/plain',
    ),
  );

  for (const mediaFile of mediaFiles) {
    const mediaFilePath = path.join(importPath, mediaFile.name);

    await writeFileObjectToFilePath(mediaFile, mediaFilePath);
  }
}
