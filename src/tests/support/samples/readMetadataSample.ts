import { readSample } from '@/tests/support/samples/readSample';

export const readMetadataSample = (name: string): string =>
  readSample('metadata', name);
