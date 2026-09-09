import { ParsedDocument } from './ParsedDocument';
import { SerializationResult } from './SerializationResult';

export type ConversionResult = SerializationResult & {
  document: ParsedDocument;
};
