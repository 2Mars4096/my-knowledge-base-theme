---
title: "Shortcode & Feature Showcase"
subtitle: "A comprehensive reference for every shortcode and layout feature"
author: "Your Name"
date: 2025-01-05T00:00:00Z
draft: false
abstract: "Demonstrates every shortcode and feature available in this theme: callouts, math blocks, collapsible sections, footnotes, figures, diagrams, plots, PDFs, videos, anchors, and cross-references."
figure: ""
pageID: "blogs-shortcode-showcase"
tags: [reference, shortcodes, example]
---

## Callouts

Five built-in callout types for highlighting important information.

{{< callout "note" "A Note" >}}
Use `note` for general informational callouts. Supports **bold**, *italic*, `code`, and [links](#).
{{< /callout >}}

{{< callout "tip" "Helpful Tip" >}}
Use `tip` for suggestions and best practices.
{{< /callout >}}

{{< callout "warning" "Caution" >}}
Use `warning` for things the reader should be careful about.
{{< /callout >}}

{{< callout "important" "Critical Information" >}}
Use `important` for must-read content that affects correctness.
{{< /callout >}}

{{< callout "example" "Worked Example" >}}
Use `example` for illustrative examples and case studies.

You can include math: $\int_0^\infty e^{-x} dx = 1$, lists:

- Item one
- Item two

and even code blocks inside callouts.
{{< /callout >}}

---

## Math Blocks

### Theorem Variants

The `theorem` shortcode supports seven block types, each with a distinct color.

{{< theorem "Brouwer's Fixed Point Theorem" >}}
Every continuous function $f: B^n \to B^n$ from a closed unit ball to itself has at least one fixed point $x^*$ such that $f(x^*) = x^*$.
{{< /theorem >}}

{{< theorem "definition" "Contraction Mapping" >}}
A function $T: X \to X$ on a metric space $(X, d)$ is a **contraction** if there exists $0 \leq q < 1$ such that $d(T(x), T(y)) \leq q \cdot d(x, y)$ for all $x, y \in X$.
{{< /theorem >}}

{{< theorem "lemma" "Gronwall's Inequality" >}}
If $u(t) \leq \alpha(t) + \int_0^t \beta(s) u(s) \, ds$, then $u(t) \leq \alpha(t) \exp\!\left(\int_0^t \beta(s) \, ds\right)$.
{{< /theorem >}}

{{< theorem "proposition" "Uniqueness" >}}
Under Assumptions 1–3, the equilibrium of the game is unique.
{{< /theorem >}}

{{< theorem "corollary" "Special Case" >}}
When $n = 1$, the result reduces to the intermediate value theorem.
{{< /theorem >}}

{{< theorem "remark" "On generalizations" >}}
The theorem extends to infinite-dimensional spaces under compactness conditions (Schauder's theorem).
{{< /theorem >}}

{{< theorem "assumption" "Regularity" >}}
The function $f$ is twice continuously differentiable on the interior of its domain, with bounded second derivatives: $\|D^2 f\| \leq M$.
{{< /theorem >}}

### Proofs

{{< proof >}}
Let $T$ be a contraction on a complete metric space $(X, d)$. Pick any $x_0 \in X$ and define $x_{n+1} = T(x_n)$. Then:

$$
d(x_{n+1}, x_n) \leq q^n \, d(x_1, x_0)
$$

By the triangle inequality, $\{x_n\}$ is Cauchy. Since $X$ is complete, $x_n \to x^*$. Continuity of $T$ gives $T(x^*) = x^*$. Uniqueness follows from $d(x^*, y^*) \leq q \, d(x^*, y^*)$ implying $d(x^*, y^*) = 0$.
{{< /proof >}}

---

## Collapsible Sections

{{< collapse "Click to expand: Derivation details" >}}
Starting from the Euler–Lagrange equation:

$$
\frac{\partial L}{\partial q} - \frac{d}{dt}\frac{\partial L}{\partial \dot{q}} = 0
$$

Substituting $L = T - V$ where $T = \frac{1}{2}m\dot{q}^2$ and $V = V(q)$:

$$
-V'(q) - m\ddot{q} = 0 \implies m\ddot{q} = -V'(q)
$$

which is Newton's second law. The variational principle thus contains classical mechanics as a special case.
{{< /collapse >}}

{{< collapse "Alternate approach (matrix method)" >}}
Write the system as $\mathbf{x}' = A\mathbf{x}$ where:

$$
A = \begin{pmatrix} 0 & 1 \\ -\omega^2 & 0 \end{pmatrix}
$$

The eigenvalues of $A$ are $\pm i\omega$, giving oscillatory solutions $e^{\pm i\omega t}$.
{{< /collapse >}}

---

## Footnotes (Margin Notes)

This theme places footnotes in the right margin{{< footnote "1" >}} rather than at the bottom of the page, making them easier to read alongside the main text.

You can have multiple footnotes{{< footnote "2" >}} throughout the document. They are positioned vertically to align with their reference point in the text.

A third footnote{{< footnote "3" >}} to show how they stack in the margin.

Here are the footnote definitions (these render in the right sidebar):

{{< footnotedef "1" >}}
Margin notes are inspired by Edward Tufte's book design. They keep supplementary information visible without interrupting the reading flow.
{{< /footnotedef >}}

{{< footnotedef "2" >}}
Each footnote is automatically numbered and linked. Hover over the superscript number in the text to highlight the corresponding margin note.
{{< /footnotedef >}}

{{< footnotedef "3" >}}
The margin notes panel hides on mobile and in print mode. A print-friendly footnotes section is generated automatically when exporting to PDF.
{{< /footnotedef >}}

---

## Figures

The `fig` shortcode embeds images with optional width and caption. It looks for page-bundle resources first, then falls back to the raw path.

{{< fig "https://picsum.photos/seed/kb-demo/800/400" "80%" "Figure 1: A sample image loaded from an external URL. Use a local filename for page-bundle images." >}}

---

## Mermaid Diagrams

### Flowchart

{{< mermaid >}}
flowchart TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]
    D --> E[Read logs]
    E --> F[Fix the bug]
    F --> B
{{< /mermaid >}}

### Sequence Diagram

{{< mermaid >}}
sequenceDiagram
    participant U as User
    participant S as Server
    participant DB as Database
    U->>S: POST /api/papers
    S->>DB: INSERT paper
    DB-->>S: OK (id: 42)
    S-->>U: 201 Created
{{< /mermaid >}}

### Gantt Chart

{{< mermaid >}}
gantt
    title Research Timeline
    dateFormat  YYYY-MM-DD
    section Literature
    Read papers           :a1, 2025-01-01, 14d
    Write survey          :a2, after a1, 10d
    section Model
    Formulate model       :b1, 2025-01-10, 14d
    Prove main theorem    :b2, after b1, 21d
    section Empirics
    Collect data          :c1, 2025-02-01, 14d
    Run regressions       :c2, after c1, 10d
{{< /mermaid >}}

---

## Plotly Function Plots

The `plot` shortcode renders mathematical functions using Plotly. Up to five functions can be plotted together.

{{< plot id="demo-plot" title="Example Functions" function1="Math.sin(x)" functionName1="sin(x)" color1="#2563eb" function2="Math.cos(x)" functionName2="cos(x)" color2="#e11d48" function3="Math.exp(-x*x/4)" functionName3="exp(-x²/4)" color3="#16a34a" >}}

---

## Embedded PDFs

### Paper PDFs (from `/static/papers/`)

```
{{</* paperPDF filename="smith2024widgets.pdf" height="600px" */>}}
```

### General PDFs (page bundle or URL)

```
{{</* pdf "slides.pdf" "500px" */>}}
```

*(No demo PDF files are included in the example site — add your own to see these in action.)*

---

## Videos

The `video` shortcode embeds local video files from the page bundle:

```
{{</* video "demo.mp4" "80%" */>}}
```

*(Add an `.mp4` file to a page bundle directory to test.)*

---

## Anchor Links

The `a` shortcode creates named anchor points for deep linking:

{{< a "custom-anchor" >}}

You can now link to this exact spot with `[jump here](#custom-anchor)`. Try it: [jump here](#custom-anchor).

---

## Cross-References

Type `@pageID` in any content to cite another page. For example:

- `@example2024paper` renders as a formatted citation → @example2024paper
- `@example-notes-topic` links to the notes page → @example-notes-topic

A **References** section is auto-generated at the bottom of this page. The cited pages also gain a **Cited By** backlink pointing here.
