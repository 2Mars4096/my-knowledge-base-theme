---
title: "Optimization Methods in Economics"
subtitle: "From linear programming to portfolio theory"
date: 2025-02-02T10:00:00Z
draft: false
abstract: "Notes on optimization techniques commonly used in economics: linear programming, quadratic programming, and convex optimization, with applications to portfolio selection and production planning."
pageID: "notes-optimization"
tags: [optimization, math, example]
---

## Linear Programming

The workhorse of operations research, formalized by @dantzig1963linear:

$$
\max_{x} \; c^\top x \quad \text{s.t.} \quad Ax \leq b, \; x \geq 0
$$

The simplex method solves this by traversing vertices of the feasible polytope. Strong duality guarantees $\max c^\top x = \min b^\top y$ where $y$ solves the dual problem.

### Connection to Game Theory

LP duality is equivalent to the minimax theorem from @von1947theory. Solving a two-person zero-sum game reduces to solving a pair of dual LPs — one of the most elegant connections in applied mathematics.

## Quadratic Programming

Portfolio optimization (@markowitz1952portfolio) extends LP to quadratic objectives:

$$
\min_w \; w^\top \Sigma w \quad \text{s.t.} \quad \mu^\top w \geq r, \; \mathbf{1}^\top w = 1
$$

The solution traces the **efficient frontier** in mean-variance space.

{{< callout "tip" "Numerical Methods" >}}
Solving the portfolio problem requires computing the covariance matrix $\Sigma$ and its inverse. For high-dimensional portfolios, eigendecomposition (see @notes-linear-algebra) provides both computational efficiency and dimensionality reduction through principal component analysis.
{{< /callout >}}

## Convex Optimization

Many economic problems have convex structure:

{{< theorem "definition" "Convex Optimization Problem" >}}
$$
\min_{x} \; f(x) \quad \text{s.t.} \quad g_i(x) \leq 0, \; h_j(x) = 0
$$

where $f$ and $g_i$ are convex and $h_j$ are affine. Any local minimum is a global minimum.
{{< /theorem >}}

The KKT conditions provide necessary and sufficient conditions for optimality:

$$
\nabla f(x^*) + \sum_i \lambda_i \nabla g_i(x^*) + \sum_j \nu_j \nabla h_j(x^*) = 0
$$

## Applications

| Problem | Type | Reference |
|---------|------|-----------|
| Production network design | LP / Network flow | @example2024paper |
| Portfolio selection | QP | @markowitz1952portfolio |
| Mechanism design | Convex program | @nash1950equilibrium (equilibrium computation) |
| Input–output analysis | Linear system | @acemoglu2012network |

{{< callout "important" "Stochastic Optimization" >}}
When parameters are uncertain, we move to stochastic optimization. The probabilistic foundations (@notes-probability) become essential: we optimize expected values, or use chance constraints based on distributional assumptions.
{{< /callout >}}
