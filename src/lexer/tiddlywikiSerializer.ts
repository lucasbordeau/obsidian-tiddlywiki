import { BlockToken } from './types';

export function serializeTiddlywiki(tokens: BlockToken[]): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case 'heading':
          return '!'.repeat(token.level) + ' ' + token.rawText;
        case 'blank':
          return '';
        case 'paragraph':
          return token.rawText;
      }
    })
    .join('\n');
}
