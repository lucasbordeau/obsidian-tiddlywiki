import { exportObsidianNote } from '@/modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '@/modules/conversion-core/notes/importTiddler';
import { getCodecValue } from '@/testing/support/getCodecValue';
import { structuredAttachmentCases } from '@/modules/conversion-core/notes/__tests__/media/contentTypes/structuredAttachmentCases';

describe('textual and extension content types', () => {
  it.each(structuredAttachmentCases)(
    'preserves the separate document container $title as typed source',
    (original) => {
      expect(
        getCodecValue(
          exportObsidianNote(getCodecValue(importTiddler(original))),
        ),
      ).toEqual(original);
    },
  );
});
