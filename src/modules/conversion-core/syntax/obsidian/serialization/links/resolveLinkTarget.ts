import type { SerializationContext } from '../../types/SerializationContext';

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
