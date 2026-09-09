import { Dialect } from '../types/Dialect';

export type PreservationRecord = {
  kind: 'obsidian-tiddlywiki-preservation';
  version: 1;
  origin: Dialect;
  identity: string;
  sourceBody: string;
  targetBody: string;
  sourceProperties: Record<string, unknown>;
  targetProperties: Record<string, unknown>;
  sourceFrontMatter: string;
  originalTags: Record<string, string>;
};
