---
title: "Linear Algebra Essentials"
subtitle: "Vectors, matrices, and decompositions"
date: 2025-01-10T10:00:00Z
draft: false
pageID: "notes-linear-algebra"
tags: [math, linear-algebra, example]
---

## Vector Spaces

A **vector space** over $\mathbb{R}$ is a set $V$ equipped with addition and scalar multiplication satisfying the usual axioms.

{{< theorem "definition" "Basis" >}}
A set $\{v_1, \ldots, v_n\} \subset V$ is a **basis** if it is linearly independent and spans $V$. The number $n$ is the **dimension** of $V$.
{{< /theorem >}}

## Eigenvalues

{{< theorem "Spectral Theorem" >}}
Every real symmetric matrix $A \in \mathbb{R}^{n \times n}$ admits an orthogonal diagonalization $A = Q \Lambda Q^\top$ where $\Lambda = \operatorname{diag}(\lambda_1, \ldots, \lambda_n)$.
{{< /theorem >}}

{{< proof >}}
By induction on $n$. The base case $n=1$ is trivial. For the inductive step, let $\lambda_1$ be an eigenvalue with unit eigenvector $q_1$. Extend to an orthonormal basis and restrict $A$ to the orthogonal complement of $q_1$, which is a symmetric $(n-1) \times (n-1)$ matrix. Apply the inductive hypothesis. $\square$
{{< /proof >}}

{{< callout "tip" "Computational note" >}}
For large sparse matrices, use iterative methods (Lanczos, Arnoldi) rather than direct diagonalization. Complexity drops from $O(n^3)$ to $O(n \cdot k)$ for the top $k$ eigenvalues.
{{< /callout >}}
