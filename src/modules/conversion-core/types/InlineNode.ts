import { Dialect } from './Dialect';
import { SourceRange } from './SourceRange';

export type InlineNode = { range?: SourceRange } & (
  | { type: 'text' | 'code'; value: string }
  | {
      type:
        | 'strong'
        | 'emphasis'
        | 'underline'
        | 'strike'
        | 'highlight'
        | 'superscript'
        | 'subscript';
      children: InlineNode[];
    }
  | {
      type: 'link';
      target: string;
      label: InlineNode[];
      external: boolean;
      title?: string;
    }
  | {
      type: 'embed';
      target: string;
      alt: string;
      kind: 'image' | 'note';
      width?: string;
      height?: string;
      title?: string;
    }
  | { type: 'break'; hard: boolean }
  | { type: 'math'; value: string }
  | { type: 'footnoteReference'; identifier: string }
  | { type: 'raw'; value: string; dialect: Dialect; reason: string }
);
