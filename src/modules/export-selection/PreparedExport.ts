import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

export type PreparedExport = {
  tiddlers: Tiddler[];
  brokenLinkCount: number;
};
