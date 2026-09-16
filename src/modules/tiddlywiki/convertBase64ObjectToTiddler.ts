import { Base64Object } from '@/modules/file-manipulation/Base64Object';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

export function convertBase64ObjectToTiddler(
  base64Object: Base64Object,
): Tiddler {
  return {
    title: base64Object.fileName,
    text: base64Object.base64,
    type: base64Object.mimeType,
    created: base64Object.creationDate.toISOString(),
    modified: base64Object.lastModifiedDate.toISOString(),
    tags: '',
  };
}
