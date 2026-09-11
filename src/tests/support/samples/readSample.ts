import { getSamplePath } from './getSamplePath';
import { readFileSync } from 'fs';

export function readSample(...segments: string[]): string {
  return readFileSync(getSamplePath(...segments), 'utf8');
}
