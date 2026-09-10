import { readSample } from './readSample';

export function readMarkdownSample(name: string): string {
  return readSample('conversion-core/markdown', name);
}
