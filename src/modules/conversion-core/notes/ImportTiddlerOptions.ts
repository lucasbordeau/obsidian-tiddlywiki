import { ConversionOptions } from '@/modules/conversion-core/conversion/ConversionOptions';

export type ImportTiddlerOptions = ConversionOptions & {
  preserveRoundTripMetadata?: boolean;
  metadataProjection?: 'complete' | 'migration';
};
