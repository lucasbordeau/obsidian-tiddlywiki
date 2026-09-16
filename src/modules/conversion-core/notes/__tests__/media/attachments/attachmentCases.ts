import { readSample } from '@/testing/support/samples/readSample';
import { AttachmentCase } from '@/modules/conversion-core/notes/__tests__/media/attachments/AttachmentCase';

export const attachmentCases = JSON.parse(
  readSample('metadata/attachment-content-types.json'),
) as AttachmentCase[];
// Format inventory: https://obsidian.md/help/file-formats
// MIME/field transport: https://tiddlywiki.com/static/ContentType.html
// External resources: https://tiddlywiki.com/static/ExternalImages.html
// These cases exercise source/byte preservation through the pure codecs.
