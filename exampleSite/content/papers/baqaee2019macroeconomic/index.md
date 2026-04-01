---
title: "The Macroeconomic Impact of Microeconomic Shocks: Beyond Hulten's Theorem"
subtitle: "Nonlinear propagation in production networks"
date: 2025-01-22T10:00:00Z
draft: false
abstract: "This paper provides a general framework for aggregating microeconomic shocks in economies with arbitrary input–output linkages and non-constant-returns production. We show Hulten's theorem is a first-order approximation and derive second-order corrections that capture nonlinear amplification."
link: "https://doi.org/10.1093/qje/qjz030"
pageID: "baqaee2019macroeconomic"
bibtex: |
    @article{baqaee2019macroeconomic,
    title={The Macroeconomic Impact of Microeconomic Shocks: Beyond Hulten's Theorem},
    author={Baqaee, David Rezza and Farhi, Emmanuel},
    journal={Quarterly Journal of Economics},
    volume={134},
    number={2},
    pages={391--467},
    year={2019},
    publisher={Oxford University Press}
    }
tags: [networks, macroeconomics, production-networks, example]
---

## Takeaways

1. **Hulten's theorem** states that to a first-order approximation, the effect of a TFP shock to sector $i$ on GDP equals that sector's Domar weight (sales/GDP ratio)
2. This paper shows that **second-order terms matter**: the impact depends on the elasticity of substitution between inputs and the network position of the shocked sector
3. With complementary inputs (CES $< 1$), shocks to important sectors are **amplified** beyond what Hulten predicts

## Model

Building on @acemoglu2012network, the economy has $n$ sectors with CES production:

$$
x_i = z_i \left( \sum_j \omega_{ij} x_{ij}^{\frac{\sigma-1}{\sigma}} \right)^{\frac{\sigma}{\sigma-1}}
$$

{{< theorem "Extended Hulten's Theorem" >}}
The change in log GDP following a vector of TFP shocks $d \log z$ satisfies:

$$
d \log \text{GDP} = \lambda' d\log z + \frac{1}{2} (d\log z)' H\, d\log z + O(\|d\log z\|^3)
$$

where $\lambda$ is the vector of Domar weights and $H$ is a Hessian matrix that depends on the network structure and substitution elasticities.
{{< /theorem >}}

{{< callout "tip" "Practical Implication" >}}
When inputs are complements ($\sigma < 1$), negative shocks to bottleneck sectors cause disproportionately large GDP declines. This has policy implications for economic resilience — see @example2024paper for a related analysis.
{{< /callout >}}

## Related

The linear benchmark is @acemoglu2012network. For empirical network measurement, see @granovetter1973strength on tie strength and network structure.
