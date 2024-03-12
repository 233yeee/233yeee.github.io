---
title: MathJax in Hugo
author: Yanting Yang
date: '2024-03-11'
lastmod: '2024-03-11'
math: true
---

## Overview

The initial idea is comming from [Add mathjax support #140](https://github.com/adityatelange/hugo-PaperMod/pull/140) and [added maths](https://github.com/bee-san/hugo-PaperMod/commit/c5c9ffc3006f5fb499b2a8c66b94bdd3800433eb). The Hugo official document is at [Mathematics in Markdown](https://gohugo.io/content-management/mathematics/).

The MathJax official document is at [Using MathJax from a CDN](https://docs.mathjax.org/en/latest/web/start.html#using-mathjax-from-a-content-delivery-network-cdn).

## Setup

### Step 1

Enable and configure the Goldmark passthrough extension in `hugo.yaml`:

```yaml
markup:
  goldmark:
    extensions:
      passthrough:
        delimiters:
          block:
          - - $$
            - $$
          inline:
          - - $
            - $
        enable: true
```

### Step 2

Create a partial template at `layouts/partials/math.html` to load MathJax:

```html
<script>
  MathJax = {
    tex: {
      displayMath: [['$$', '$$']],
      inlineMath: [["$", "$"]],
      tags: "ams",
    },
  };
</script>
<script
  type="text/javascript"
  id="MathJax-script"
  async
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
></script>
```

which restric [math delimiters](https://docs.mathjax.org/en/latest/input/tex/delimiters.html) to `$$...$$` and `$...$`, and enable [automatic equation numbering](https://docs.mathjax.org/en/latest/input/tex/eqnumbers.html).

### Step 3

Conditionally call the partial template from `layouts/partials/extend_head.html`:

```html
{{ if or .Params.math .Site.Params.math }}
{{ partial "math.html" . }}
{{ end }}
```

### Step 4

To enable MathJax, add `math: true` to the front matter.

## Example

### [Loading Extensions at Run Time](https://docs.mathjax.org/en/latest/input/tex/extensions.html#loading-extensions-at-run-time)

```latex
$$
\require{color}
\begin{equation}
  \color{red} x \color{black} + \color{green} y \color{black} = \color{blue} z
\end{equation}
$$
```

$$
\require{color}
\begin{equation}
  \color{red} x \color{black} + \color{green} y \color{black} = \color{blue} z
\end{equation}
$$

### [Equation Reference](https://docs.mathjax.org/en/latest/input/tex/eqnumbers.html)

```md
In equation $\eqref{eq:sample}$, we find the value of an
interesting integral:

$$
\begin{equation}
  \int_0^\infty \frac{x^3}{e^x-1}dx = \frac{\pi^4}{15}
  \label{eq:sample}
\end{equation}
$$
```

In equation $\eqref{eq:sample}$, we find the value of an
interesting integral:

$$
\begin{equation}
  \int_0^\infty \frac{x^3}{e^x-1}dx = \frac{\pi^4}{15}
  \label{eq:sample}
\end{equation}
$$
