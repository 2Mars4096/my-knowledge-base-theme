---
title: "Introduction to Graph Theory"
subtitle: "Key concepts and mathematical foundations"
date: 2025-02-01T10:00:00Z
draft: false
abstract: "A primer on graphs, centrality measures, and their applications."
pageID: "example-notes-topic"
tags: [graph-theory, math, example]
---

## Graphs and Notation

A **directed graph** $G = (V, E)$ consists of a set of vertices $V$ and edges $E \subseteq V \times V$.

{{< theorem "definition" "Adjacency Matrix" >}}
The **adjacency matrix** $A \in \{0,1\}^{n \times n}$ of a graph $G$ is defined by $A_{ij} = 1$ if $(i,j) \in E$, and $A_{ij} = 0$ otherwise.
{{< /theorem >}}

## Centrality Measures

### Degree Centrality

The simplest measure: count the number of connections.

$$
C_D(i) = \frac{d_i}{n - 1}
$$

where $d_i$ is the degree of node $i$.

### Eigenvector Centrality

A node is important if it is connected to other important nodes:

$$
\lambda \mathbf{x} = A \mathbf{x}
$$

{{< callout "tip" "Intuition" >}}
Eigenvector centrality is the fixed point of the iterative process: "my importance = sum of my neighbors' importances."
{{< /callout >}}

### Katz Centrality

{{< theorem "Katz Centrality" >}}
For attenuation factor $\alpha < 1/\lambda_1(A)$, Katz centrality is:

$$
\mathbf{c}_K = (I - \alpha A)^{-1} \mathbf{1} - \mathbf{1}
$$
{{< /theorem >}}

## Example Diagram

{{< mermaid >}}
graph LR
    A[Node A] --> B[Node B]
    A --> C[Node C]
    B --> D[Node D]
    C --> D
    D --> E[Node E]
{{< /mermaid >}}

## References

This note draws on ideas from @example2024paper.

{{< collapse "Further Reading" >}}
- Fictional, A. (2020). *Graphs and Their Applications*. Example University Press.
- Madeup, B. (2018). *An Introduction to Networks*. Placeholder Publishing.
{{< /collapse >}}
