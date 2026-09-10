import { readSample } from './readSample';

export const readMetadataSample = (name: string): string =>
  readSample('metadata', name);
