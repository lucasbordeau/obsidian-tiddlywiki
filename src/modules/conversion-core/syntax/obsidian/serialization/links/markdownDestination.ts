export function markdownDestination(target: string): string {
  return `<${target.replace(/\\/g, '\\\\').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/\n/g, '%0A')}>`;
}
