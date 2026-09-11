import { getSamplePath } from './getSamplePath';
import { readFileSync } from 'fs';

export function readSampleBytes(...segments: string[]): Buffer {
  return readFileSync(getSamplePath(...segments));
}
