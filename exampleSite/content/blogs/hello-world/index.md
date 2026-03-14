---
title: "Hello World: Setting Up Your Knowledge Base"
subtitle: "A quick tour of what this theme can do"
author: "Your Name"
date: 2025-01-01T00:00:00Z
draft: false
abstract: "An introductory post demonstrating the blog layout, shortcodes, and cross-referencing features."
figure: ""
pageID: "blogs-hello-world"
tags: [getting-started, example]
---

## Why a Knowledge Base?

Research generates a constant stream of papers, notes, and ideas. A personal knowledge base lets you:

1. **Organize** papers with BibTeX metadata and searchable tags
2. **Connect** ideas across papers and notes with `@pageID` citations
3. **Write** with full math support, theorems, and diagrams
4. **Export** BibTeX files for your manuscripts

## Shortcode Showcase

### Callouts

{{< callout "note" "Getting Started" >}}
Run `./new blog "My First Post"` to create a new blog entry with the correct front matter.
{{< /callout >}}

{{< callout "warning" "Draft Mode" >}}
Set `draft: true` in front matter to hide a page from the published site. Run `hugo server -D` to preview drafts locally.
{{< /callout >}}

{{< callout "tip" "Keyboard Shortcuts" >}}
Press `⌘K` to open the search overlay. Press `⌘E` to open the current page in your editor.
{{< /callout >}}

### Collapsible Sections

{{< collapse "Click to expand: How citations work" >}}
Type `@pageID` anywhere in your content (e.g., `@example2024paper`). The theme will:

1. Look up the page with that `pageID` in its front matter
2. Parse the BibTeX to extract author names and year
3. Render an inline citation like "Smith et al. (2024)"
4. Auto-generate a References section at the bottom
5. Add a "Cited By" backlink on the cited page
{{< /collapse >}}

### Math

Inline math works with dollar signs: the expected value $\mathbb{E}[X] = \sum_i x_i p_i$.

Display math with double dollars:

$$
\max_{x \geq 0} \quad \sum_{t=0}^{T} \beta^t u(c_t) \quad \text{s.t.} \quad c_t + k_{t+1} = f(k_t)
$$

### Cross-References

This blog references the example paper: @example2024paper. It also links to the notes page: @example-notes-topic.

Both of these will automatically render as formatted citations with backlinks.

## What's Next?

- Add your first paper with `./new paper authorYYYYkeyword`
- Create a study note with `./new note "Topic Name"`
- Start a daily log with `./new log`
