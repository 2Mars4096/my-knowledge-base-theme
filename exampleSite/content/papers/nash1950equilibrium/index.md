---
title: "Equilibrium Points in N-Person Games"
subtitle: "The existence of strategic equilibria"
date: 2025-01-18T10:00:00Z
draft: false
abstract: "One may define a concept of an n-person game in which each player has a finite set of pure strategies and in which a definite set of payments to the n players corresponds to each n-tuple of pure strategies. We prove that a mixed strategy equilibrium point exists for every such game."
link: "https://doi.org/10.1073/pnas.36.1.48"
pageID: "nash1950equilibrium"
bibtex: |
    @article{nash1950equilibrium,
    title={Equilibrium Points in N-Person Games},
    author={Nash, John F},
    journal={Proceedings of the National Academy of Sciences},
    volume={36},
    number={1},
    pages={48--49},
    year={1950},
    publisher={National Academy of Sciences}
    }
tags: [game-theory, equilibrium, example]
---

## Takeaways

1. Every finite game has at least one **Nash equilibrium** in mixed strategies
2. The proof uses Brouwer's fixed point theorem (or Kakutani's fixed point theorem in the generalized case)
3. This concept became the foundational solution concept in non-cooperative game theory

## The Equilibrium Concept

Consider $n$ players, each with a finite set of pure strategies $S_i$. A mixed strategy for player $i$ is a probability distribution $\sigma_i \in \Delta(S_i)$.

{{< theorem "definition" "Nash Equilibrium" >}}
A strategy profile $\sigma^* = (\sigma_1^*, \ldots, \sigma_n^*)$ is a **Nash equilibrium** if for every player $i$ and every alternative strategy $\sigma_i'$:

$$
u_i(\sigma_i^*, \sigma_{-i}^*) \geq u_i(\sigma_i', \sigma_{-i}^*)
$$

No player can improve their payoff by unilaterally deviating.
{{< /theorem >}}

{{< theorem "Existence Theorem" >}}
Every finite $n$-person game possesses at least one Nash equilibrium in mixed strategies.
{{< /theorem >}}

{{< proof >}}
Define the best-response correspondence $BR_i(\sigma_{-i}) = \arg\max_{\sigma_i} u_i(\sigma_i, \sigma_{-i})$. The joint best-response $BR: \Sigma \rightrightarrows \Sigma$ is upper hemicontinuous with convex values. By Kakutani's fixed point theorem, $BR$ has a fixed point, which is a Nash equilibrium.
{{< /proof >}}

## Applications

Nash equilibrium has been applied across economics, political science, and biology. In economics, it underpins models of oligopoly (Cournot, Bertrand), auctions, and mechanism design. The concept builds on @von1947theory and has been extended to network games — see @acemoglu2012network for applications in production networks.

{{< callout "note" "Historical Context" >}}
Nash's paper was remarkably concise — just one page in the PNAS. The idea was developed further in his 1951 paper "Non-Cooperative Games" in the Annals of Mathematics, which contained the full proof and discussion.
{{< /callout >}}
