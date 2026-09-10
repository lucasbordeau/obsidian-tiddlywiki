export function longestRun(value: string, character: '`' | '~'): number {
  const runs: string[] = value.match(character === '`' ? /`+/g : /~+/g) ?? [];

  return runs.reduce((length, run) => Math.max(length, run.length), 0);
}
