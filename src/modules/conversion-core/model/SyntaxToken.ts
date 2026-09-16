import { SourceRange } from '@/modules/conversion-core/model/SourceRange';

export type SyntaxToken = { kind: string; range: SourceRange; raw: string };
