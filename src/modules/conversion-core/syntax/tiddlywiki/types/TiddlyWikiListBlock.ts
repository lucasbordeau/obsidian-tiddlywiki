import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';

export type TiddlyWikiListBlock = Extract<BlockNode, { type: 'list' }>;
