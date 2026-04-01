---
title: "Portfolio Selection"
subtitle: "Mean-variance optimization for investment"
date: 2025-01-16T10:00:00Z
draft: false
abstract: "This paper introduces the mean-variance framework for portfolio selection, showing that an investor should diversify holdings to achieve the best trade-off between expected return and risk (variance). The efficient frontier characterizes all Pareto-optimal portfolios."
link: "https://doi.org/10.2307/2975974"
pageID: "markowitz1952portfolio"
bibtex: |
    @article{markowitz1952portfolio,
    title={Portfolio Selection},
    author={Markowitz, Harry},
    journal={The Journal of Finance},
    volume={7},
    number={1},
    pages={77--91},
    year={1952},
    publisher={Wiley}
    }
tags: [finance, optimization, example]
---

## Takeaways

1. Investors should evaluate portfolios by their **mean** (expected return) and **variance** (risk), not just expected return alone
2. **Diversification** reduces portfolio variance when assets are not perfectly correlated
3. The **efficient frontier** is the set of portfolios that maximize expected return for a given level of risk

## The Model

Let $\mu \in \mathbb{R}^n$ be the vector of expected returns and $\Sigma \in \mathbb{R}^{n \times n}$ the covariance matrix. A portfolio $w \in \mathbb{R}^n$ with $\mathbf{1}^\top w = 1$ has:

$$
\mathbb{E}[R_p] = \mu^\top w, \qquad \text{Var}(R_p) = w^\top \Sigma w
$$

{{< theorem "Efficient Frontier" >}}
The set of mean-variance efficient portfolios solves:

$$
\min_w \; w^\top \Sigma w \quad \text{s.t.} \quad \mu^\top w \geq r, \quad \mathbf{1}^\top w = 1
$$

for varying target return $r$. The frontier traces a parabola in $(\sigma, \mu)$ space.
{{< /theorem >}}

{{< callout "tip" "Connection to Probability Theory" >}}
The entire framework rests on the first two moments of the return distribution. When returns are normally distributed, mean-variance optimization is equivalent to expected utility maximization — linking back to @von1947theory's utility theory.
{{< /callout >}}

## Computation

The efficient frontier can be computed by solving a series of quadratic programs. For large portfolios, the structure connects to @dantzig1963linear's linear programming when constraints are linear.

The covariance matrix $\Sigma$ can be estimated from historical data using techniques from @notes-linear-algebra (eigendecomposition for factor models) and @notes-probability (sample covariance properties).
