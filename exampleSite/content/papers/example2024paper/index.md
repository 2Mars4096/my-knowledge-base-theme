---
title: "On the Dynamics of Widget Production in Closed Economies"
subtitle: "A theoretical framework for widget optimization"
date: 2025-01-26T04:24:26Z
draft: false
abstract: "This paper develops a model of widget production under capacity constraints, showing that firm-level shocks propagate through supply chains."
link: "https://doi.org/10.1234/example.2024.001"
pageID: "example2024paper"
bibtex: >
    @article{example2024paper,
    title={On the Dynamics of Widget Production in Closed Economies},
    author={Smith, Alice and Johnson, Bob and Lee, Carol},
    journal={Journal of Imaginary Economics},
    volume={42},
    number={3},
    pages={100--130},
    year={2024},
    publisher={Example Press}
    }
tags: [supply-chain, optimization, example]
---

{{< paperPDF filename="example2024paper.pdf" height="800px" >}}

## Takeaways

This is where you summarize the paper's key contributions:

1. Widget production exhibits increasing returns to scale under constraint $\kappa$
2. The optimal allocation depends on the **network structure** of suppliers
3. Shocks to a single firm can cascade through the supply chain

## Model

The production function for firm $i$:

$$
x_i = z_i \prod_{j=1}^{n} x_{ij}^{w_{ij}}
$$

where $w_{ij}$ is the input share of supplier $j$ in firm $i$'s production.

{{< theorem "Main Result" >}}
Under Assumptions 1–3, the equilibrium allocation $\mathbf{x}^*$ is unique and satisfies $\|\mathbf{x}^* - \bar{\mathbf{x}}\| \leq C \cdot \epsilon$ for some constant $C > 0$.
{{< /theorem >}}

{{< proof >}}
The proof follows from applying the contraction mapping theorem to the best-response operator. See the paper for the full derivation.
{{< /proof >}}

## Q&A

{{< collapse "What data does this paper use?" >}}
The paper uses simulated data from a hypothetical 50-firm supply network with calibrated parameters.
{{< /collapse >}}

## Related

See also @example-notes-topic for background on the mathematical framework.
