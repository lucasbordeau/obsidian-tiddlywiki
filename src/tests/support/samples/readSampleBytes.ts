import { samplePath } from './samplePath';
import { readFileSync } from 'fs';

export function readSampleBytes(...segments: string[]): Buffer {
  return readFileSync(samplePath(...segments));
}
