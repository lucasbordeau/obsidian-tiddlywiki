# Heading with **bold**, _italic_, and [[link|display]]

## Another heading with <u>underline</u> and [external](https://example.com)

Plain paragraph with **bold containing _italic inside_** and _italic containing **bold inside**_.

Also <u>underline with **bold** and _italic_ inside</u>.

- Level 1 with **bold** and _italic_
	- Level 2 with [[link|display]] and <u>underline</u>
		- Level 3 with **_bold italic_** and [external](https://example.com)
			- Level 4 with ![[image.jpg]] and **bold**
				- Level 5 with _italic_ and [[simple link]]
- Back to level 1 with `inline code`
	- Level 2 with [external link](https://example.com) and [[internal|display]]
		- Level 3 with <u>**underline bold**</u> and ![[nested.png]]

1. Ordered first with **bold**
    1. Ordered nested with _italic_
        1. Ordered triple with <u>underline</u> and [[link]]
            1. Ordered quadruple with ![[deep.jpg]] and [ext](https://example.com)
1. Ordered second

> Blockquote with **bold** and _italic_ combined
> Second blockquote line with [[link|display]] and <u>underline</u>
> Third line with [external](https://example.com) and ![[image.jpg]]

**Bold paragraph** with _italic inside_ and <u>underline inside</u> followed by:

- Mixed list after bold paragraph
	- With [[nested link|display text]] and **bold**
		- With _italic_ and ![[image-in-list.svg]]

_Italic paragraph_ with **bold inline** and <u>underline inline</u> and [[link|display]].

```typescript
// Code block should preserve ALL syntax unchanged
const **notBold** = _notItalic_;
[[notALink]] and {{notATiddler}}
> not a blockquote
- not a list
```

After code: **bold**, _italic_, <u>underline</u>.

> Blockquote after code with **bold** text
> And [[link|display]] on second line
> Third line _italic_ and <u>underline</u>

## Section with everything

### Sub-section

- **Bold item** with _italic_ and <u>underline</u>
	- [[link one|display one]] and [[link two]]
		- [ext one](https://one.example.com) and [ext two](https://two.example.com)
			- ![[img-a.jpg]] then ![[img-b.png]]
				- Final level: **_<u>triple nested inline</u>_**

1. **Bold ordered** with _italic_
    1. [[nested link|see this]] and ![[nested-img.gif]]
        1. <u>underline</u> and [external](https://example.com/path)

> **Bold in quote** with _italic_
> [[link in quote|display]] and ![[image in quote.jpg]]
> Inline `code in quote` is also preserved
