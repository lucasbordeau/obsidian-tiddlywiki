---
title: "A note with: punctuation"
tags: [one, "two words"]
custom:
  nested: true
---

> [!warning]- A **foldable** title
> A callout body with [[Folder/Note#^block|an anchor]].
>
> > [!tip] A nested callout
> > ![[Other#Section]]

Inline math $x_1 + y_2 = \\alpha$ and a footnote[^a].

$$
\\begin{aligned}
a &= b \\\\
c &= d
\\end{aligned}
$$

[^a]: A footnote with **bold** and [[Referenced note]].

    A second paragraph in the same footnote.

Hidden %%a **comment** with [[links]]%% between text.

<u>**literal Markdown inside HTML**</u>

<div class="custom">
**literal inside an HTML block**
[[a literal link]]
</div>

A block reference target. ^block-id
