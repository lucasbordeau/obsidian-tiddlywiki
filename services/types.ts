export type Tiddler = {
	created: string;
	modified: string;
	tags: string;
	text: string;
	title: string;
	type?: string;
};

export type ObsidianMarkdown = {
	frontmatter: {
		tags?: string[];
	};
	content: string;
	title: string;
};
