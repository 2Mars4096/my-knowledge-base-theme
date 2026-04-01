---
title: "The Network Origins of Aggregate Fluctuations"
subtitle: "How microeconomic shocks propagate through production networks"
date: 2025-01-20T10:00:00Z
draft: false
abstract: "This paper argues that in the presence of intersectoral input–output linkages, microeconomic idiosyncratic shocks may lead to aggregate fluctuations. A key result shows the volatility of aggregate output depends on the structure of the economy's input–output network, in particular on the degree sequence."
link: "https://doi.org/10.3982/ECTA9623"
pageID: "acemoglu2012network"
bibtex: |
    @article{acemoglu2012network,
    title={The Network Origins of Aggregate Fluctuations},
    author={Acemoglu, Daron and Carvalho, Vasco M and Ozdaglar, Asuman and Tahbaz-Salehi, Alireza},
    journal={Econometrica},
    volume={80},
    number={5},
    pages={1977--2016},
    year={2012},
    publisher={Wiley}
    }
tags: [networks, macroeconomics, production-networks, example]
---

## Takeaways

1. In an economy with $n$ sectors linked through an input–output network, the law of large numbers need not apply: aggregate volatility can be of order $1/\sqrt{n}$ rather than $1/n$
2. The **influence vector** $v = (I - W')^{-1} \mathbf{1}$ determines how sectoral shocks transmit to aggregate output
3. Sectors with high influence (many downstream buyers) act as hubs whose shocks disproportionately affect GDP

## Model

The economy consists of $n$ competitive sectors. Sector $i$ produces output:

$$
x_i = z_i \ell_i^{1-\alpha} \prod_{j=1}^{n} x_{ij}^{w_{ij}\alpha}
$$

where $z_i$ is a productivity shock, $\ell_i$ is labor, and $w_{ij}$ is the share of sector $j$'s output used by sector $i$.

{{< theorem "Main Result (Aggregate Volatility)" >}}
The standard deviation of log aggregate output satisfies:

$$
\sigma_{\text{GDP}} = \frac{\sigma}{\sqrt{n}} \left\| v \right\|
$$

where $v_i = \sum_{k=0}^{\infty} (W')^k \mathbf{1}$ is the influence vector. If the network is "star-shaped" (one dominant hub), $\sigma_{\text{GDP}} \sim \sigma / \sqrt{n}^{1-\delta}$ for some $\delta > 0$.
{{< /theorem >}}

{{< callout "important" "Key Insight" >}}
The standard diversification argument — that aggregate volatility vanishes as $n \to \infty$ — fails when the network has a fat-tailed degree distribution. This is empirically relevant: the US input–output network exhibits such patterns.
{{< /callout >}}

## Q&A

{{< collapse "How does this relate to the Leontief inverse?" >}}
The influence vector $v = (I - \alpha W')^{-1} \mathbf{1}$ is closely related to the Leontief inverse $(I - A)^{-1}$ from input–output economics. The $i$-th component measures the total (direct + indirect) importance of sector $i$ as a supplier.
{{< /collapse >}}

## Related

See @granovetter1973strength for foundational work on network structure. The framework here is extended by @baqaee2019macroeconomic to allow for nonlinear production functions.
