---
title: "The Strength of Weak Ties"
subtitle: "How network structure shapes information flow"
date: 2025-01-24T10:00:00Z
draft: false
abstract: "This paper argues that weak social ties — acquaintances rather than close friends — are disproportionately important for information diffusion and social mobility. The 'strength of weak ties' hypothesis has become a cornerstone of network science."
link: "https://doi.org/10.1086/225469"
pageID: "granovetter1973strength"
bibtex: |
    @article{granovetter1973strength,
    title={The Strength of Weak Ties},
    author={Granovetter, Mark S},
    journal={American Journal of Sociology},
    volume={78},
    number={6},
    pages={1360--1380},
    year={1973},
    publisher={University of Chicago Press}
    }
tags: [networks, sociology, example]
---

## Takeaways

1. **Strong ties** (close friends) form dense local clusters; **weak ties** (acquaintances) act as bridges between clusters
2. Removing weak ties fragments the network far more than removing strong ties — they are "bridges" in graph-theoretic terms
3. Information (job leads, innovations) reaches more people through weak ties than strong ties

## The Argument

{{< theorem "definition" "Tie Strength" >}}
The **strength** of a tie is a function of time, emotional intensity, intimacy, and reciprocal services. A tie is **weak** if this function is below a threshold, and **strong** otherwise.
{{< /theorem >}}

{{< theorem "proposition" "Bridge Property of Weak Ties" >}}
If nodes $A$ and $B$ are connected by a strong tie, and $A$ is also connected to $C$, then there is at least a weak tie between $B$ and $C$ (triadic closure). Therefore, a bridge between two network components can only be a weak tie.
{{< /theorem >}}

{{< callout "note" "Empirical Evidence" >}}
Granovetter's job market study found that 84% of respondents who found jobs through contacts used weak ties rather than strong ties. The information accessed through weak ties was also less redundant.
{{< /callout >}}

## Network Science Connections

The concept of tie strength maps naturally to weighted graphs studied in @example-notes-topic. In economic networks, the structure of weak ties affects how productivity shocks propagate — a theme central to @acemoglu2012network's analysis of aggregate fluctuations.

{{< mermaid >}}
graph TD
    subgraph "Cluster A"
    A1((A1)) --- A2((A2))
    A2 --- A3((A3))
    A1 --- A3
    end
    subgraph "Cluster B"
    B1((B1)) --- B2((B2))
    B2 --- B3((B3))
    B1 --- B3
    end
    A2 -. "weak tie<br/>(bridge)" .- B1
    style A2 fill:#fbbf24
    style B1 fill:#fbbf24
{{< /mermaid >}}
