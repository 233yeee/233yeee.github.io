---
title: Summary in PaperMod
author: Yanting Yang
date: '2024-03-12'
lastmod: '2024-03-12'
---

Hugo uses a summary divider for [manual summary splitting](https://gohugo.io/content-management/summaries/#manual-summary-splitting). Content that comes before the summary divider will be used as that content’s summary. However, in `hugo-PaperMod` theme, summaries in the entry list are shortened to two lines, which is discussed in [configurable entry summary length #1400](https://github.com/adityatelange/hugo-PaperMod/pull/1400). The theme author [suggests](https://github.com/adityatelange/hugo-PaperMod/pull/1400#issuecomment-1985060618) adding custom CSS to solve this issue. This article introduces the steps.

<!--more-->

## Setup

### Step 1

Add CSS to `assets/css/extended/custom.css` according to [Bundling Custom css with theme's assets](https://github.com/adityatelange/hugo-PaperMod/wiki/FAQs#bundling-custom-css-with-themes-assets):

```css
.entry-content {
    -webkit-line-clamp: initial;
}
```

One can use `initial` to unset CSS variables[^Unset/Delete a custom property/CSS variable].

[^Unset/Delete a custom property/CSS variable]: <https://stackoverflow.com/a/47830589>

### Step 2

Add `<!--more-->` to the content after summary:

```markdown
---
title: Summary in PaperMod
author: Yanting Yang
date: '2024-03-12'
lastmod: '2024-03-12'
---

Hugo uses a summary divider for [manual summary splitting](https://gohugo.io/content-management/summaries/#manual-summary-splitting). Content that comes before the summary divider will be used as that content’s summary. However, in `hugo-PaperMod` theme, summaries in the entry list are shortened to two lines, which is discussed in [configurable entry summary length #1400](https://github.com/adityatelange/hugo-PaperMod/pull/1400). The theme author [suggests](https://github.com/adityatelange/hugo-PaperMod/pull/1400#issuecomment-1985060618) adding custom CSS to solve this issue. This article introduces the steps.

<!--more-->
```
