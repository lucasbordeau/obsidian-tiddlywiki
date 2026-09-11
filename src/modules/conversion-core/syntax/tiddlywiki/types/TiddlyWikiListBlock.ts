import type { BlockNode } from '../../../model/blocks/BlockNode';

export type TiddlyWikiListBlock = Extract<BlockNode, { type: 'list' }>;
