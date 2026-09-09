import { SourceRange } from './SourceRange';

export type SyntaxToken = { kind: string; range: SourceRange; raw: string };
