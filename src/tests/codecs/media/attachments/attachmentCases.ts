import { readSample } from '@/tests/support/samples/readSample';
import { AttachmentCase } from '@/tests/codecs/media/attachments/AttachmentCase';

export const attachmentCases = JSON.parse(
  readSample('metadata/attachment-content-types.json'),
) as AttachmentCase[];
// Format inventory: https://obsidian.md/help/file-formats
// MIME/field transport: https://tiddlywiki.com/static/ContentType.html
// External resources: https://tiddlywiki.com/static/ExternalImages.html
// These cases exercise source/byte preservation through the pure codecs.
