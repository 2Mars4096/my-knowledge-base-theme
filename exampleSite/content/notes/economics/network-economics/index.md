---
title: "Network Economics"
subtitle: "How interconnections shape aggregate outcomes"
date: 2025-01-28T10:00:00Z
draft: false
abstract: "Notes on the economics of production networks, input-output linkages, and how microeconomic shocks propagate to macroeconomic outcomes."
pageID: "notes-network-economics"
tags: [networks, macroeconomics, production-networks, example]
---

## Overview

Network economics studies how the structure of economic relationships — trade linkages, production networks, financial connections — shapes aggregate outcomes. The field draws on graph theory (see @example-notes-topic) and has become central to understanding macroeconomic fragility.

## Key Papers

### Acemoglu et al. (2012)

The foundational paper @acemoglu2012network shows that when the input–output network has a fat-tailed degree distribution, idiosyncratic shocks do **not** average out. The aggregate volatility depends on the **influence vector**:

$$
v = (I - \alpha W')^{-1} \mathbf{1}
$$

which is essentially the Leontief inverse applied to the network's adjacency matrix.

### Baqaee & Farhi (2019)

The extension @baqaee2019macroeconomic goes beyond the linear framework by incorporating CES production functions. The key insight: with complementary inputs ($\sigma < 1$), negative shocks to bottleneck sectors are **amplified** nonlinearly.

### Application to Widget Production

@example2024paper applies these ideas to a specific industry, showing how firm-level capacity constraints interact with network structure. The model uses a production function of the form $x_i = z_i \prod_j x_{ij}^{w_{ij}}$.

## Connections to Network Science

The mathematical foundations draw heavily on spectral graph theory. The influence vector $v$ involves the largest eigenvalue of the adjacency matrix — connecting to the eigenvector centrality concepts in @example-notes-topic. The role of weak ties in information diffusion (@granovetter1973strength) has parallels in how shocks propagate through production networks.

{{< callout "tip" "For Linear Algebra Background" >}}
The Leontief inverse $(I - W)^{-1}$ requires understanding matrix inverses and spectral properties — see @notes-linear-algebra for the mathematical foundations, particularly the eigenvalue decomposition.
{{< /callout >}}
