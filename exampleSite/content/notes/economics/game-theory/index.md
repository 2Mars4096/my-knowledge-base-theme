---
title: "Game Theory Foundations"
subtitle: "Strategic interaction and equilibrium concepts"
date: 2025-01-30T10:00:00Z
draft: false
abstract: "Study notes on the mathematical foundations of game theory, covering Nash equilibrium, minimax strategies, and connections to optimization and economics."
pageID: "notes-game-theory"
tags: [game-theory, equilibrium, math, example]
---

## Historical Development

Game theory as a mathematical discipline began with @von1947theory, which established the minimax theorem for two-person zero-sum games and formalized expected utility theory. The field was transformed by @nash1950equilibrium's proof that every finite game has a mixed-strategy equilibrium.

## Core Concepts

### Nash Equilibrium

A strategy profile $\sigma^*$ where no player benefits from unilateral deviation:

$$
u_i(\sigma_i^*, \sigma_{-i}^*) \geq u_i(\sigma_i, \sigma_{-i}^*) \quad \forall \sigma_i, \forall i
$$

The existence proof relies on Brouwer's or Kakutani's fixed point theorem — the same mathematical machinery used in proving the spectral theorem (see @notes-linear-algebra for background on eigenvalue theory).

### Common Games

| Game | Players | Key Feature | Equilibria |
|------|---------|-------------|------------|
| Prisoner's Dilemma | 2 | Dominant strategies | 1 (both defect) |
| Battle of the Sexes | 2 | Coordination | 2 pure + 1 mixed |
| Matching Pennies | 2 | Zero-sum | 1 mixed |
| Cournot Oligopoly | $n$ | Quantity competition | 1 symmetric |

### Mixed Strategy Example

In Matching Pennies, the unique Nash equilibrium is for both players to randomize uniformly:

$$
\sigma_1^* = \sigma_2^* = \left(\frac{1}{2}, \frac{1}{2}\right)
$$

{{< theorem "proposition" "Minimax = Nash in Zero-Sum" >}}
In a two-person zero-sum game, the set of Nash equilibria coincides with the set of minimax strategy pairs. The equilibrium payoff equals the value of the game from @von1947theory's minimax theorem.
{{< /theorem >}}

## Applications in Economics

Game theory is essential for analyzing strategic interactions in markets:

- **Network games**: Players on a network choose actions that affect neighbors. The equilibrium structure depends on the network topology — see @acemoglu2012network for how this applies to production networks
- **Auction design**: Mechanism design (a branch of game theory) is used to design markets and allocation rules
- **Bargaining**: Nash bargaining solution provides a framework for negotiation outcomes

{{< callout "note" "Optimization Connection" >}}
Computing Nash equilibria is closely related to solving complementarity problems, which in turn connect to the linear programming techniques in @dantzig1963linear. The Lemke–Howson algorithm for two-player games uses pivoting similar to the simplex method.
{{< /callout >}}

## Probability in Games

Mixed strategies are probability distributions over actions. Understanding convergence of learning algorithms in games requires the probabilistic tools from @notes-probability — in particular, the law of large numbers governs fictitious play convergence.
