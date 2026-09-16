import { getSamplePath } from '@/testing/support/samples/getSamplePath';
import { readFileSync } from 'fs';

export function readSampleBytes(...segments: string[]): Buffer {
  return readFileSync(getSamplePath(...segments));
}
