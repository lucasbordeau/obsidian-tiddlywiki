import type { SourceRange } from './SourceRange';

export type SyntaxToken = { kind: string; range: SourceRange; raw: string };
