---
title: "Probability Theory"
subtitle: "Measure-theoretic foundations"
date: 2025-01-15T10:00:00Z
draft: false
pageID: "notes-probability"
tags: [math, probability, example]
---

## Probability Spaces

{{< theorem "definition" "Probability Space" >}}
A **probability space** is a triple $(\Omega, \mathcal{F}, \mathbb{P})$ where $\Omega$ is the sample space, $\mathcal{F}$ is a $\sigma$-algebra of events, and $\mathbb{P}: \mathcal{F} \to [0,1]$ is a probability measure with $\mathbb{P}(\Omega) = 1$.
{{< /theorem >}}

## Convergence

There are several notions of convergence for random variables:

{{< theorem "proposition" "Hierarchy of Convergence" >}}
For a sequence of random variables $X_n$:

$$
X_n \xrightarrow{a.s.} X \implies X_n \xrightarrow{p} X \implies X_n \xrightarrow{d} X
$$

The reverse implications do not hold in general.
{{< /theorem >}}

### Law of Large Numbers

{{< theorem "lemma" "Weak LLN" >}}
If $X_1, X_2, \ldots$ are i.i.d. with $\mathbb{E}[X_1] = \mu$ and $\operatorname{Var}(X_1) < \infty$, then:

$$
\bar{X}_n = \frac{1}{n}\sum_{i=1}^n X_i \xrightarrow{p} \mu
$$
{{< /theorem >}}

{{< collapse "Sketch of proof" >}}
By Chebyshev's inequality, for any $\epsilon > 0$:

$$
\mathbb{P}(|\bar{X}_n - \mu| > \epsilon) \leq \frac{\operatorname{Var}(\bar{X}_n)}{\epsilon^2} = \frac{\sigma^2}{n\epsilon^2} \to 0
$$
{{< /collapse >}}

{{< callout "important" "Finite variance assumption" >}}
The weak LLN requires finite variance. For the strong LLN, finite expectation suffices (Kolmogorov's theorem), but the proof is considerably harder.
{{< /callout >}}

{{< theorem "remark" "Central Limit Theorem" >}}
Under the same conditions, $\sqrt{n}(\bar{X}_n - \mu) \xrightarrow{d} \mathcal{N}(0, \sigma^2)$. This is the reason the normal distribution appears so frequently in practice.
{{< /theorem >}}
