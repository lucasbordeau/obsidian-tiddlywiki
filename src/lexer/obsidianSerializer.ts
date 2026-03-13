import { BlockToken, InlineToken } from './types';

export function serializeObsidianInline(tokens: InlineToken[]): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case 'text':
          return token.value;
        case 'inlineCode':
          return `\`${token.value}\``;
        case 'bold':
          return `**${serializeObsidianInline(token.children)}**`;
        case 'italic':
          return `_${serializeObsidianInline(token.children)}_`;
        case 'underline':
          return `<u>${serializeObsidianInline(token.children)}</u>`;
      }
    })
    .join('');
}

export function serializeObsidian(tokens: BlockToken[]): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case 'heading':
          return '#'.repeat(token.level) + ' ' + serializeObsidianInline(token.children);
        case 'blank':
          return '';
        case 'paragraph':
          return serializeObsidianInline(token.children);
      }
    })
    .join('\n');
}
