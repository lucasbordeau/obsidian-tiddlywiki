import { ObsidianNote } from '@/modules/obsidian/ObsidianNote';

export type ScopedExportNote = ObsidianNote & {
  path: string;
};
