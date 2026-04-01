---
title: "Linear Programming and Extensions"
subtitle: "The simplex method and its applications"
date: 2025-01-14T10:00:00Z
draft: false
abstract: "This monograph presents a comprehensive treatment of linear programming, including the simplex method, duality theory, and applications to transportation, assignment, and network flow problems. It remains the definitive reference on the subject."
link: "https://press.princeton.edu/books/paperback/9780691059136/linear-programming-and-extensions"
pageID: "dantzig1963linear"
bibtex: |
    @book{dantzig1963linear,
    title={Linear Programming and Extensions},
    author={Dantzig, George B},
    year={1963},
    publisher={Princeton University Press}
    }
tags: [optimization, linear-programming, example]
---

## Takeaways

1. The **simplex method** is a practical algorithm for solving linear programs: $\max \{ c^\top x : Ax \leq b, x \geq 0 \}$
2. **LP duality**: every LP has a dual, and strong duality holds (primal optimum = dual optimum)
3. Widely applied in operations research, logistics, and economics

## The Standard Form

$$
\begin{aligned}
\max \quad & c^\top x \\
\text{s.t.} \quad & Ax \leq b \\
& x \geq 0
\end{aligned}
$$

{{< theorem "Strong Duality" >}}
If a linear program has a finite optimal solution, so does its dual, and their optimal values are equal:

$$
\max \{ c^\top x : Ax \leq b, x \geq 0 \} = \min \{ b^\top y : A^\top y \geq c, y \geq 0 \}
$$
{{< /theorem >}}

{{< proof >}}
Follows from the complementary slackness conditions. If $x^*$ is primal optimal and $y^*$ is dual feasible with $c^\top x^* = b^\top y^*$, then by weak duality, both are optimal. Constructing such $y^*$ from the simplex tableau completes the proof.
{{< /proof >}}

## Applications

Linear programming is central to operations research and has deep connections to game theory — see @von1947theory for the minimax connection. Portfolio optimization in @markowitz1952portfolio can be formulated as a quadratic program, which extends LP to quadratic objectives.

{{< callout "note" "Computational Complexity" >}}
While the simplex method is exponential in the worst case (Klee–Minty examples), it is extremely efficient in practice. Polynomial-time alternatives exist: the ellipsoid method (Khachiyan, 1979) and interior-point methods (Karmarkar, 1984).
{{< /callout >}}
