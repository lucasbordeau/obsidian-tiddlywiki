import * as path from 'path';
import { lookup } from 'mime-types';
import { isTextualAttachmentContentType } from '@/modules/file-manipulation/isTextualAttachmentContentType';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

export function isAttachmentTiddler(tiddler: Tiddler): boolean {
  const contentType = tiddler.type?.split(';')[0].trim().toLowerCase();

  const isWikitextType =
    !contentType ||
    contentType === 'text' ||
    contentType === 'text/vnd.tiddlywiki';

  if (isWikitextType) {
    return false;
  }

  const isNativeObsidianFile =
    (/\.base$/i.test(tiddler.title) && contentType === 'text/plain') ||
    (/\.canvas$/i.test(tiddler.title) && contentType === 'application/json');

  const hasNonTextType = !contentType.startsWith('text/');

  if (isNativeObsidianFile || hasNonTextType) {
    return true;
  }

  if (path.extname(tiddler.title).toLowerCase() === '.md') {
    return false;
  }

  const inferredType = lookup(tiddler.title);

  return (
    inferredType !== false &&
    isTextualAttachmentContentType(inferredType, tiddler.title)
  );
}
