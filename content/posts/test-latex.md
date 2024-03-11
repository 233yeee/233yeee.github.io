---
title: Test LaTeX
author: Yanting Yang
date: '2024-03-10'
math: true
---

## [Using MathJax from a CDN](https://docs.mathjax.org/en/latest/web/start.html#using-mathjax-from-a-content-delivery-network-cdn)

The first step is putting

```html
{{ if or .Params.math .Site.Params.math }}
{{ partial "math.html" . }}
{{ end }}
```

into `layouts/partials/extend_head.html` and then putting

```html
<script>
  MathJax = {
    tex: {
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

into `layouts/partials/math.html`.

## Example

$\require{color}$

In equation \eqref{eq:sample}, we find the value of an
interesting integral:

\begin{equation}
  \int_0^\infty \frac{x^3}{e^x-1}dx = \frac{\pi^4}{15}
  \label{eq:sample}
\end{equation}

\begin{equation}
  \color{red}{x} + \color{blue}{y}
\end{equation}
