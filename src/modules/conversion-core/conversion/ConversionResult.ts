import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { SerializationResult } from '@/modules/conversion-core/conversion/SerializationResult';

export type ConversionResult = SerializationResult & {
  document: ParsedDocument;
};
