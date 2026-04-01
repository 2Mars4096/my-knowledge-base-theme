---
title: "Theory of Games and Economic Behavior"
subtitle: "The foundational text of game theory"
date: 2025-01-12T10:00:00Z
draft: false
abstract: "This monograph established the mathematical foundations of game theory, introducing concepts such as utility theory, zero-sum games, and the minimax theorem. It laid the groundwork for all subsequent developments in strategic interaction theory."
link: "https://press.princeton.edu/books/paperback/9780691130613/theory-of-games-and-economic-behavior"
pageID: "von1947theory"
bibtex: |
    @book{von1947theory,
    title={Theory of Games and Economic Behavior},
    author={von Neumann, John and Morgenstern, Oskar},
    year={1947},
    publisher={Princeton University Press},
    edition={2nd}
    }
tags: [game-theory, decision-theory, example]
---

## Takeaways

1. Introduced **expected utility theory**: rational agents maximize $\mathbb{E}[u(x)]$ under the von Neumann–Morgenstern axioms
2. Proved the **minimax theorem** for two-person zero-sum games: $\max_x \min_y f(x,y) = \min_y \max_x f(x,y)$
3. Established game theory as a mathematical discipline, influencing economics, computer science, and biology

## Key Concepts

### Expected Utility

{{< theorem "definition" "vNM Utility" >}}
A preference relation $\succeq$ over lotteries satisfies the von Neumann–Morgenstern axioms (completeness, transitivity, continuity, independence) if and only if there exists a utility function $u$ such that:

$$
L_1 \succeq L_2 \iff \mathbb{E}_{L_1}[u] \geq \mathbb{E}_{L_2}[u]
$$

The utility function is unique up to positive affine transformations.
{{< /theorem >}}

### Minimax Theorem

{{< theorem "Minimax Theorem" >}}
For any finite two-person zero-sum game with payoff matrix $A \in \mathbb{R}^{m \times n}$:

$$
\max_{p \in \Delta_m} \min_{q \in \Delta_n} p^\top A q = \min_{q \in \Delta_n} \max_{p \in \Delta_m} p^\top A q
$$

This common value $v$ is the **value of the game**.
{{< /theorem >}}

{{< callout "tip" "Connection to Linear Programming" >}}
Solving a two-person zero-sum game is equivalent to solving a pair of dual linear programs — a connection later formalized by @dantzig1963linear. The LP duality theorem and the minimax theorem are essentially the same result.
{{< /callout >}}

## Impact

This work directly inspired @nash1950equilibrium's generalization to non-cooperative $n$-person games. The expected utility framework became the standard model of decision-making under uncertainty in economics and finance, notably in @markowitz1952portfolio's portfolio theory.
