import { TiddlyWiki } from 'tiddlywiki';

const runtime = TiddlyWiki();
runtime.boot.argv = [];
runtime.boot.disabledStartupModules = ['commands'];
const ready = new Promise<void>((resolve) => runtime.boot.boot(resolve));

export async function renderTiddlyWiki(source: string): Promise<string> {
  await ready;
  return runtime.wiki.renderText('text/html', 'text/vnd.tiddlywiki', source);
}
