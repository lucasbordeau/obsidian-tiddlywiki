import { ObsidianNote } from '../../obsidian/types/ObsidianNote';

export type ScopedExportNote = ObsidianNote & {
  path: string;
};
