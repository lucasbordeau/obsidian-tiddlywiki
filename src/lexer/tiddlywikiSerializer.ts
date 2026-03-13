import { BlockToken, InlineToken } from './types';

export function serializeTiddlywikiInline(tokens: InlineToken[]): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case 'text':
          return token.value;
        case 'inlineCode':
          return `\`${token.value}\``;
        case 'bold':
          return `''${serializeTiddlywikiInline(token.children)}''`;
        case 'italic':
          return `//${serializeTiddlywikiInline(token.children)}//`;
        case 'underline':
          return `__${serializeTiddlywikiInline(token.children)}__`;
      }
    })
    .join('');
}

export function serializeTiddlywiki(tokens: BlockToken[]): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case 'heading':
          return '!'.repeat(token.level) + ' ' + serializeTiddlywikiInline(token.children);
        case 'blank':
          return '';
        case 'paragraph':
          return serializeTiddlywikiInline(token.children);
      }
    })
    .join('\n');
}
