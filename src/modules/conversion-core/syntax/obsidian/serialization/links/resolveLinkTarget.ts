import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';

export function resolveLinkTarget(
  target: string,
  kind: 'link' | 'embed',
  context: SerializationContext,
  external = false,
): string {
  if (external || !context.options.resolveLink) {
    return target;
  }

  return context.options.resolveLink(target, kind);
}
