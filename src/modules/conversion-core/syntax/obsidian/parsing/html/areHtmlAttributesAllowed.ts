import { HtmlAttributes } from '@/modules/conversion-core/syntax/obsidian/types/HtmlAttributes';

export function areHtmlAttributesAllowed(
  attributes: HtmlAttributes,
  names: string[],
): boolean {
  return Object.keys(attributes).every((name) => names.includes(name));
}
