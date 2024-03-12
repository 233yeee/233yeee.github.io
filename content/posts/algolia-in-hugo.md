---
title: Algolia in Hugo
author: Yanting Yang
date: '2024-03-12'
lastmod: '2024-03-12'
---

## Overview

[hugo-algolia](https://github.com/replicatedhq/hugo-algolia) was used in some tutorials and ranked first if you search in Google  but this package has not been updated for many years. [Static search with Algolia and Hugo 2](https://harrycresswell.com/writing/hugo-algolia-2/) introduced the integration of Algolia from scratch but the results were not satisfying and the procedures were still quite complicated. [DocSearch](https://docsearch.algolia.com/) shows up as a populer Algolia search for developer docs which is easy and free. This article introduces how to implement DocSearch in Hugo.

The Algolia official document is at [How to install InstantSearch.js](https://www.algolia.com/doc/guides/building-search-ui/installation/js/). The DocSearch official document is at [Getting Started](https://docsearch.algolia.com/docs/DocSearch-v3).

## Setup

### Step 1

Apply for DocSearch at <https://docsearch.algolia.com/apply>.

### Step 2

Add CSS to `layouts/partials/extend_head.html`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@3" />
```

### Step 4

Add JS to `layouts/partials/extend_footer.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@docsearch/js@3"></script>
<script>
  docsearch({
    appId: "AZVJE0ADEK",
    apiKey: "097ee0c1890bc202db878d2696f6fd6a",
    indexName: "233yeee",
    container: "#docsearch",
    debug: false
  });
</script>
```

### Step 5

Add search box to `layouts/partials/header.html`:

```html
<div id="docsearch" style="align-items: center; display: flex;"></div>
```
