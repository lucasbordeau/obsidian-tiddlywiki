import type { ParsedDocument } from '../../model/ast/documents/ParsedDocument';
import type { SerializationResult } from './SerializationResult';

export type ConversionResult = SerializationResult & {
  document: ParsedDocument;
};
