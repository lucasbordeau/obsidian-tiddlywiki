import { join } from 'path';

export function samplePath(...segments: string[]): string {
  return join(__dirname, '../../samples', ...segments);
}
