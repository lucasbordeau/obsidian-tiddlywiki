import { mkdir } from 'fs/promises';
import * as path from 'path';
import { convertBase64ToFileObject } from '@/modules/file-manipulation/convertBase64ToFileObject';
import { isTextualAttachmentContentType } from '@/modules/file-manipulation/isTextualAttachmentContentType';
import { writeFileObjectToFilePath } from '@/modules/file-manipulation/writeFileObjectToFilePath';
import { isAttachmentTiddler } from '@/modules/plugin-core/settings/isAttachmentTiddler';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

function getAttachmentPath(importPath: string, title: string): string {
  const hasParentSegment = title.split(/[\\/]/).includes('..');

  const isAbsoluteTitle =
    path.isAbsolute(title) ||
    path.win32.isAbsolute(title) ||
    /^[a-zA-Z]:/.test(title);

  if (hasParentSegment || isAbsoluteTitle || title.includes('\0')) {
    throw new Error(`Unsafe attachment title: ${title}`);
  }

  const attachmentPath = path.resolve(importPath, title);

  const relativePath = path.relative(importPath, attachmentPath);

  const isOutsideImportFolder =
    !relativePath ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath);

  if (isOutsideImportFolder) {
    throw new Error(`Unsafe attachment title: ${title}`);
  }

  return attachmentPath;
}

export async function writeMediaTiddlers(
  tiddlers: Tiddler[],
  importPath: string,
): Promise<void> {
  const embeddedAttachments = tiddlers.filter(
    (tiddler) => isAttachmentTiddler(tiddler) && !tiddler._canonical_uri,
  );

  const plannedPaths = new Set<string>();

  const attachmentWrites = embeddedAttachments.map((tiddler) => {
    const attachmentPath = getAttachmentPath(importPath, tiddler.title);
    const collisionKey = attachmentPath.toLowerCase();

    if (plannedPaths.has(collisionKey)) {
      throw new Error(`Duplicate attachment destination: ${tiddler.title}`);
    }

    plannedPaths.add(collisionKey);

    const contentType = tiddler.type ?? 'text/plain';

    const attachment = isTextualAttachmentContentType(
      contentType,
      tiddler.title,
    )
      ? new File([tiddler.text], tiddler.title, { type: contentType })
      : convertBase64ToFileObject(tiddler.text, tiddler.title, contentType);

    return { attachment, attachmentPath };
  });

  for (const { attachment, attachmentPath } of attachmentWrites) {
    const attachmentDirectory = path.dirname(attachmentPath);

    if (attachmentDirectory !== importPath) {
      await mkdir(attachmentDirectory, { recursive: true });
    }

    await writeFileObjectToFilePath(attachment, attachmentPath);
  }
}
