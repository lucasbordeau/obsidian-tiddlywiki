import type { ParsedDocument } from '../model/ParsedDocument';
import type { SerializationResult } from './SerializationResult';

export type ConversionResult = SerializationResult & {
  document: ParsedDocument;
};
