import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import type { SerializationContext } from '../../types/serialization/SerializationContext';
import { isAsteriskFormatting } from '../formatting/isAsteriskFormatting';
import { escapeText } from '../escaping/escapeText';
import { renderInline } from './renderInline';

export function renderInlines(
  nodes: InlineNode[],
  context: SerializationContext,
  parentMarker?: string,
): string {
  const mergedNodes: InlineNode[] = [];

  for (const node of nodes) {
    const previous = mergedNodes[mergedNodes.length - 1];

    if (node.type === 'text' && previous?.type === 'text') {
      previous.value += node.value;
    } else {
      mergedNodes.push({ ...node });
    }
  }

  let previousMarker: string | undefined;

  return mergedNodes
    .map((node, index) => {
      const previous = mergedNodes[index - 1];
      const next = mergedNodes[index + 1];

      if (node.type === 'text') {
        previousMarker = undefined;

        const characters = Array.from(node.value);
        let prefix = '';
        let suffix = '';

        const protectStart =
          isAsteriskFormatting(previous) &&
          characters.length > 0 &&
          !/\s/.test(characters[0]);

        if (protectStart) {
          prefix = `&#${characters.shift()?.codePointAt(0)};`;
        }

        const protectEnd =
          isAsteriskFormatting(next) &&
          characters.length > 0 &&
          !/\s/.test(characters[characters.length - 1]);

        if (protectEnd) {
          suffix = `&#${characters.pop()?.codePointAt(0)};`;
        }

        return `${prefix}${escapeText(characters.join(''))}${suffix}`;
      }

      if (node.type === 'strong' || node.type === 'emphasis') {
        const preferred = node.type === 'strong' ? '*' : '_';
        const conflict = previousMarker ?? parentMarker;

        const character =
          preferred === conflict ? (preferred === '*' ? '_' : '*') : preferred;

        previousMarker = character;

        const marker = character.repeat(node.type === 'strong' ? 2 : 1);

        return renderInline(node, context, marker);
      }

      previousMarker = undefined;

      return renderInline(node, context);
    })
    .join('');
}
