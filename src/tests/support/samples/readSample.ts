import { samplePath } from './samplePath';
import { readFileSync } from 'fs';

export function readSample(...segments: string[]): string {
  return readFileSync(samplePath(...segments), 'utf8');
}
