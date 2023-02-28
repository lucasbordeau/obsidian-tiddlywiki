import { Tiddler } from "./types";

export async function parseTiddlersFromFile(file: File): Promise<Tiddler[]> {
	const fileText = await file.text();
	const tiddlers = JSON.parse(fileText);

	return tiddlers;
}
