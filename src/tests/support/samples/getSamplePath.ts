import { join } from 'path';

export function getSamplePath(...segments: string[]): string {
  return join(__dirname, '../../samples', ...segments);
}
