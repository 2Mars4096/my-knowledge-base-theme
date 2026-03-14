# Knowledge Base Theme for Hugo

A Hugo theme designed for academic knowledge management — papers, notes, blogs, and daily logs — with a bidirectional citation system, BibTeX integration, and rich shortcodes for math, diagrams, and more.

![Hugo](https://img.shields.io/badge/Hugo-%3E%3D0.110-ff4088?logo=hugo)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- **Bidirectional citations**: Type `@pageID` to cite any page. Auto-formatted in APA style with a generated References section. Cited pages show "Cited By" backlinks.
- **BibTeX support**: Store BibTeX entries in front matter. Export `.bib` files for your manuscripts with the included script.
- **Paper management**: Dedicated papers list with search, filtering by year/journal/tag, and multiple sort modes.
- **Math rendering**: MathJax with common macros (configurable). Supports inline `$...$` and display `$$...$$` math.
- **Rich shortcodes**: Theorems, proofs, callouts, collapsible sections, Plotly charts, Mermaid diagrams, figures, PDFs, and videos.
- **Three-column layout**: Auto-generated TOC (left), content (center), and margin notes (right). Responsive on mobile.
- **Full-text search**: Client-side search overlay with `⌘K` keyboard shortcut.
- **PDF export**: One-click export to a print-friendly PDF from any page.
- **Tag system**: Tag any page, filter by tags, browse the tag cloud.
- **Content creation CLI**: `./new paper`, `./new note`, `./new blog`, `./new log` to scaffold content with correct front matter.

## Quick Start

```bash
# 1. Create a new Hugo site
hugo new site my-knowledge-base
cd my-knowledge-base

# 2. Add this theme as a submodule
git init
git submodule add https://github.com/2Mars4096/my-knowledge-base-theme.git themes/my-knowledge-base-theme

# 3. Copy the example site to get started
cp -r themes/my-knowledge-base-theme/exampleSite/* .

# 4. Run the dev server
hugo server -D
```

Then open [http://localhost:1313](http://localhost:1313).

## Content Types

| Type | Create with | Description |
|------|-------------|-------------|
| **Paper** | `./new paper citationKey` | Paper summary with embedded PDF, BibTeX metadata, and takeaways |
| **Note** | `./new note "Topic"` | Study notes, lecture notes, or topic overviews |
| **Blog** | `./new blog "Title"` | Long-form writing and analysis |
| **Log** | `./new log` | Daily journal with reflections, tasks, and reading notes |
| **To-Do** | Create manually | Weekly task lists |

## Configuration

All theme parameters are optional and have sensible defaults. Add a `[params]` section to your `hugo.toml`:

```toml
[params]
  # Navigation: which sections appear in the top nav bar, in order.
  navSections = ["papers", "notes", "log", "to-do", "blogs"]

  # Homepage: how many recent items to show.
  recentItems = 20

  # Citations: enable "Cited By" backlinks on cited pages.
  enableBackwardCitations = true

  # Which content sections are scanned for @pageID citations.
  citationSections = ["papers", "notes", "blogs", "log", "to-do"]
```

### Customizing Navigation

To change which sections appear in the nav bar, edit `navSections`. For example, to remove the To-Do section:

```toml
navSections = ["papers", "notes", "log", "blogs"]
```

Each entry must match a top-level directory under `content/`. The display name comes from the section's `_index.md` title.

### Customizing Colors

Edit the CSS custom properties in `static/css/styles.css` under `:root`:

```css
:root {
  --bg: #faf9f7;        /* page background */
  --accent: #2563eb;    /* links and highlights */
  --papers: #7c3aed;    /* section color for papers */
  --notes: #0891b2;     /* section color for notes */
  /* ... */
}
```

## Citation System

### Forward Citations

Type `@pageID` anywhere in your content:

```markdown
This result builds on @smith2024widgets and extends the framework of @doe2023logistics.
```

The theme will:
1. Look up the page with matching `pageID` in front matter
2. Parse BibTeX to extract authors and year
3. Render inline as "Smith et al. (2024)" with a link
4. Auto-generate a References section at the bottom of the page

### Backward Citations

Every page with a `pageID` automatically shows a "Cited By" section listing all pages that reference it, with context snippets. Disable per-page with `backwardCitation: false` in front matter, or globally with `enableBackwardCitations = false`.

### BibTeX Export

```bash
# Export all papers to references.bib
python scripts/export_bib.py

# Export specific papers
python scripts/export_bib.py --ids "smith2024widgets,doe2023logistics"

# Export papers cited in a LaTeX manuscript
python scripts/export_bib.py --from-tex ~/paper/main.tex
```

## Layouts

The theme ships with four page layouts. Each section can choose its layout via `_index.md` front matter.

### Single (`single.html`) — default for leaf pages

Three-column layout: auto-generated TOC (left), article content (center), margin notes (right). Used for individual papers, notes, blog posts, etc.

Features: breadcrumbs, prev/next navigation, tag pills, "Edit source" link (opens in Cursor/VS Code), PDF export button, backward citations ("Cited By"), and margin footnotes.

### List (`list.html`) — default for section pages

Card-style list of all pages in the section, sorted by last modified. Includes:

- **Sort toggle**: switch between date order and A–Z
- **View toggle**: list view or grid view
- **Tag filter bar**: click a tag pill to filter

Set explicitly with `layout: "list"` in `_index.md`, or it's the default for any section.

### Stacked (`stacked.html`) — inline child pages

Renders all child pages' content on a single scrollable page, with a unified TOC. Headings from child pages are automatically downgraded (h2 → h3, etc.) so the page hierarchy stays clean.

Use this for topic clusters — e.g., a "Mathematics" section with sub-pages for linear algebra, probability, etc.

```yaml
# content/notes/math/_index.md
---
title: "Mathematics"
layout: "stacked"
---
Optional introductory text appears above the child pages.
```

### Papers List (`papers/list.html`) — specialized for papers

Enhanced list view with:

- **Full-text search** across title, author, journal, year, and BibTeX ID
- **Year filter pills** (extracted from BibTeX)
- **Journal filter pills** (extracted from BibTeX)
- **Tag filter pills**
- **Five sort modes**: Date Added, Year (New→Old), Year (Old→New), Author A–Z, Title A–Z

### Homepage (`index.html`) — dashboard

Two-column dashboard: recent activity feed (left) and section links + tag cloud (right).

## Nested Folder Structure

Content can be nested arbitrarily. Intermediate folders with `_index.md` become section pages:

```
content/notes/
├── _index.md                          # list layout → shows all notes
├── example-topic/index.md             # leaf page
├── math/
│   ├── _index.md                      # layout: stacked → inline child pages
│   ├── linear-algebra/index.md        # child page (rendered inline)
│   └── probability/index.md           # child page (rendered inline)
└── programming/
    ├── _index.md                      # layout: list → card list of children
    ├── python-basics/index.md         # child page (listed as card)
    └── data-structures/index.md       # child page (listed as card)
```

- `/notes/` shows a flat list of everything (including nested children)
- `/notes/math/` shows linear algebra and probability content stacked on one page
- `/notes/programming/` shows a card list linking to each child page
- `/notes/programming/python-basics/` renders as a standalone single page

## Shortcodes Reference

### Callouts

Five types with distinct colors and icons:

```markdown
{{</* callout "note" "Optional Title" */>}}
Informational content. Supports **Markdown**, math, lists, and code.
{{</* /callout */>}}
```

| Type | Color | Icon | Use for |
|------|-------|------|---------|
| `note` | Blue | ℹ️ | General information |
| `tip` | Green | 💡 | Suggestions and best practices |
| `warning` | Amber | ⚠️ | Caution and caveats |
| `important` | Red | ❗ | Critical must-read content |
| `example` | Purple | 📌 | Worked examples and case studies |

### Theorem Blocks

Seven block types, each with a distinct accent color:

```markdown
{{</* theorem "Optional Name" */>}}
Statement of the theorem. Supports full $\LaTeX$ math.
{{</* /theorem */>}}

{{</* theorem "definition" "Optional Name" */>}}
Definition text.
{{</* /theorem */>}}
```

| Type | First argument | Color |
|------|---------------|-------|
| `theorem` | *(omit or use name directly)* | Blue |
| `definition` | `"definition"` | Cyan |
| `lemma` | `"lemma"` | Purple |
| `proposition` | `"proposition"` | — |
| `corollary` | `"corollary"` | — |
| `remark` | `"remark"` | — |
| `assumption` | `"assumption"` | — |

### Proof

```markdown
{{</* proof */>}}
The proof follows from... ∎
{{</* /proof */>}}
```

Renders with italic "Proof." label and a right-aligned QED square (■).

### Collapsible Sections

```markdown
{{</* collapse "Click to reveal" */>}}
Hidden content. Supports Markdown, math, code blocks.
{{</* /collapse */>}}
```

Click the header to toggle. The arrow rotates 90° when expanded.

### Footnotes (Margin Notes)

Tufte-style margin notes that appear in the right sidebar, aligned with their reference point:

```markdown
Main text with a note{{</* footnote "1" */>}} and another note{{</* footnote "2" */>}}.

{{</* footnotedef "1" */>}}
This appears in the right margin, aligned with the superscript.
{{</* /footnotedef */>}}

{{</* footnotedef "2" */>}}
Second margin note. They stack vertically with automatic spacing.
{{</* /footnotedef */>}}
```

Footnotes highlight on hover. In print/PDF mode, they collapse into a numbered endnotes section.

### Figures

```markdown
{{</* fig "photo.jpg" "80%" "Caption text here" */>}}
```

| Argument | Position | Default | Description |
|----------|----------|---------|-------------|
| Source | 1st | *(required)* | Filename (page bundle) or URL |
| Width | 2nd | `100%` | Max width (CSS value) |
| Caption | 3rd | *(none)* | Caption text below the image |

Looks for the file in the page bundle first (`page/photo.jpg`), falls back to the raw path.

### Mermaid Diagrams

```markdown
{{</* mermaid */>}}
graph LR
    A[Start] --> B{Decision}
    B -- Yes --> C[Done]
    B -- No --> D[Retry]
{{</* /mermaid */>}}
```

Supports all [Mermaid diagram types](https://mermaid.js.org/): flowcharts, sequence diagrams, Gantt charts, class diagrams, state diagrams, ER diagrams, etc.

### Function Plots

Plot up to 5 JavaScript math functions using Plotly:

```markdown
{{</* plot id="my-plot" title="Trig Functions"
    function1="Math.sin(x)" functionName1="sin(x)" color1="#2563eb"
    function2="Math.cos(x)" functionName2="cos(x)" color2="#e11d48" */>}}
```

Functions are evaluated over x ∈ [−10, 10]. Use any valid JavaScript expression in `x`.

### Plotly HTML Charts

Embed pre-generated Plotly HTML files (e.g., exported from Python):

```markdown
{{</* plotly file="chart.html" height="600" width="800" */>}}
```

The `file` path is relative to the page bundle directory.

### Embedded PDFs

Two variants:

```markdown
<!-- Papers: loads from /static/papers/ -->
{{</* paperPDF filename="smith2024widgets.pdf" height="800px" */>}}

<!-- General: loads from page bundle or raw path -->
{{</* pdf "slides.pdf" "600px" */>}}
```

### Videos

```markdown
{{</* video "recording.mp4" "80%" */>}}
```

Looks in the page bundle first, falls back to raw path. Renders a native HTML5 `<video>` element with controls.

### Anchor Links

```markdown
{{</* a "my-anchor" */>}}

Link to it: [jump to anchor](#my-anchor)
```

Creates an invisible named anchor point for deep linking within a page.

## Project Structure

```
my-knowledge-base/
├── hugo.toml                 # Site configuration
├── new                       # Content creation CLI
├── content/
│   ├── papers/               # Paper summaries with BibTeX
│   │   └── smith2024/index.md
│   ├── notes/                # Study notes and guides
│   │   ├── math/             # Nested: layout: stacked
│   │   │   ├── _index.md
│   │   │   ├── linear-algebra/index.md
│   │   │   └── probability/index.md
│   │   └── programming/      # Nested: layout: list
│   │       ├── _index.md
│   │       └── python-basics/index.md
│   ├── blogs/                # Long-form posts
│   ├── log/                  # Daily journal
│   └── to-do/                # Weekly task lists
├── scripts/
│   └── export_bib.py         # BibTeX export utility
├── static/papers/            # PDF files for papers
└── themes/
    └── my-knowledge-base-theme/  # This theme
```

## License

MIT — see [LICENSE](LICENSE).
