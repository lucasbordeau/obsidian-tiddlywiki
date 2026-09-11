import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';
import { quoteTiddlyWikiAttribute } from '../quoteTiddlyWikiAttribute';
import { escapeTiddlyWikiText } from '../escapeTiddlyWikiText';

export function serializeTiddlyWikiCodeBlock(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'code' }>,
): string {
  const needsHtml =
    /^```$/m.test(block.value) || !/^[\w-]*$/.test(block.language);

  if (needsHtml) {
    this.diagnose(
      block,
      'tw-html-code',
      'The code uses an HTML representation because TW code fences cannot contain this delimiter or language identifier.',
    );

    const languageAttribute = quoteTiddlyWikiAttribute(
      'language-' + block.language,
    );

    if (!languageAttribute) {
      return this.preserve(
        block,
        'The code language uses an unsupported attribute delimiter.',
        true,
      );
    }

    const language = block.language ? ` class=${languageAttribute}` : '';

    return `<pre><code${language}>${escapeTiddlyWikiText(block.value)}</code></pre>`;
  }

  return '```' + block.language + '\n' + block.value + '\n```';
}
