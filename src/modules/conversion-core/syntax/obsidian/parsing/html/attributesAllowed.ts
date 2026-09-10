import type { HtmlAttributes } from '../../types/html/HtmlAttributes';

export function attributesAllowed(
  attributes: HtmlAttributes,
  names: string[],
): boolean {
  return Object.keys(attributes).every((name) => names.includes(name));
}
