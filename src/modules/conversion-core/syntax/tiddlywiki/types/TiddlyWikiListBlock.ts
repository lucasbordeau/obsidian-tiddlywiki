import type { BlockNode } from '../../../model/ast/blocks/BlockNode';

export type TiddlyWikiListBlock = Extract<BlockNode, { type: 'list' }>;
