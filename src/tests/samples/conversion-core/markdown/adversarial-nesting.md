# **Nested _meaning_** and [[Folder/Note#Section|a literal **label**]]

Text with **outer _inner_ and `**literal** [[not a link]]`** plus ==a **highlight**==.
Escaped \*asterisks\*, snake_case, https://example.org/a_b?q=x&n=1, and 2 < 3.

7. First ordered item with [a **formatted** label](https://example.org/a_(b)?q=one_two "A title")
   - [x] A nested task with ![[media/a picture.png|320]]
     1. Mixed depth and [[Folder/Other|other]]
   - [ ] A second task
8. A loose item

   Its second paragraph has `[[still literal]]`.

   ~~~~typescript extra-info
   const source = "```\n**not bold** [[not a link]]";
   ~~~~

> A quote with **bold**.
>
> > A nested quote with _emphasis_.
>
> - One
> - Two

| Left | Center | Right |
| :--- | :----: | ----: |
| **strong** | `a\|b` | [[Folder/Note\|label]] |
| literal \| pipe | ~~gone~~ | ![alt](media/image.png "image title") |

`````markdown info
```shorter fence
[[unchanged|label]] **unchanged** _unchanged_ ==unchanged==
> [!warning] A fake callout in code
```
`````
