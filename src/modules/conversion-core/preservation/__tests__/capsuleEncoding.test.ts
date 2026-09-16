import { decodePreservedSource } from '@/modules/conversion-core/preservation/source/decodePreservedSource';
import { encodePreservedSource } from '@/modules/conversion-core/preservation/source/encodePreservedSource';
import { invalidCapsules } from '@/modules/conversion-core/preservation/__tests__/invalidCapsules';

describe('inert preservation capsules', () => {
  test('round trips Unicode, comment terminators, quotes and nested capsule-like input', () => {
    const source = {
      dialect: 'tiddlywiki' as const,
      value:
        '<$text text="🙂 --> -- <script>"/>\n<!--otw:v1:not-a-record-->\ud800',
      reason: 'Unsupported dynamic widget',
    };

    const encoded = encodePreservedSource(source);

    expect(decodePreservedSource(encoded)).toEqual(source);
    expect(encoded.slice(4, -3)).not.toContain('--');
    expect(encoded).not.toContain('<script>');
  });

  test.each(invalidCapsules)(
    'malformed and unknown-version capsules stay ordinary source: %s',
    (source) => {
      expect(decodePreservedSource(source)).toBeUndefined();
    },
  );
});
