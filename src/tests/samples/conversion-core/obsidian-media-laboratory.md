# Media laboratory — café 研究 🚀

[[Research/Overview#Evidence#Figures|Evidence map]] and [PDF](<documents/Trial report.pdf#page=17>).

> [!warning]- **Evidence** with [[Research/Overview|context]]
> Compare ![[assets/figure.png|320x180]] with ![[assets/vector.svg|160]].
>
> > [!example]+ Nested documents
> > ![[documents/Trial report.pdf#height=480]]
> >
> > - [x] Audio ![[recordings/interview.flac]]
> >   3. Video ![[recordings/experiment.mp4]]
> >      - Canvas ![[maps/study.canvas]]
> > - [ ] Base ![[catalogue.base]]

| Asset | Interpretation | Source |
| :-- | :--: | --: |
| ![[assets/animation.gif\|90]] | **bold _nested_** | [[Research/Overview\|note]] |
| ![[assets/photo.webp\|120x80]] | $x_1 + y_2$ | `a\|b` |

![External chart|300x120](https://example.org/chart.svg?x=1&y=2 "A distinct tooltip")

![[Research/Overview#^evidence-block]] and ![[Research/Overview#Conclusion]].

Paragraph with ==highlight== and <u>literal **asterisks**</u>.[^evidence]

[^evidence]: **Footnote** with ![[assets/thumbnail.jpg|40]].
    Continuation contains `![[inert.png]]` and [[Notes/Methods]].

    Second paragraph with a [document](documents/appendix.pdf).

%% Hidden comment: ![[hidden.png]], **hidden**, <$text text="literal"/> %%

<iframe src="https://example.org/embed?q=one&amp;x=two" width="640" height="320"></iframe>

`````mermaid
flowchart TD
  A["[[Research]] and **literal**"] --> B["image | PDF"]
  class A internal-link;
`````

```query
path:"documents" (file:.pdf OR tag:#evidence) -content:"[[literal]]"
```

```base
filters:
  and:
    - file.ext == "pdf"
views:
  - type: table
    name: Evidence
```

````text
```js
const source = "![[literal.png]] @@style@@ $$math$$";
```
<$list filter="[all[tiddlers]]"><$text text="not executed"/></$list>
````

$$
\begin{aligned}
a_1 &= \frac{b}{c} \\
d &= e^2
\end{aligned}
$$

- Figure collection
- Document collection

^media-list
