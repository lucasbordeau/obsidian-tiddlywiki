import { readSample } from '@/testing/support/samples/readSample';

export function readMarkdownSample(name: string): string {
  return readSample('conversion-core/markdown', name);
}
