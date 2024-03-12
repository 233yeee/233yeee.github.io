---
title: Understand Diffusion Model
author: Yanting Yang
date: '2024-01-19'
lastmod: '2024-03-11'
math: true
---

[GitHub](https://github.com/hojonathanho/diffusion)

```text
@inproceedings{NEURIPS2020_4c5bcfec,
 author = {Ho, Jonathan and Jain, Ajay and Abbeel, Pieter},
 booktitle = {Advances in Neural Information Processing Systems},
 editor = {H. Larochelle and M. Ranzato and R. Hadsell and M.F. Balcan and H. Lin},
 pages = {6840--6851},
 publisher = {Curran Associates, Inc.},
 title = {Denoising Diffusion Probabilistic Models},
 url = {https://proceedings.neurips.cc/paper_files/paper/2020/file/4c5bcfec8584af0d967f1ab10179ca4b-Paper.pdf},
 volume = {33},
 year = {2020}
}
```

## Useful links

- Most contents are taken from [What are Diffusion Models?](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/)

## Forward diffusion process

Given a data point sampled from a real data distribution $\mathbf{x}_0 \sim q(\mathbf{x}_0)$, we define a forward diffusion process in which we repeatedly add a small amount of Gaussian noise to the sample in $T$ steps. Each step can be written as:

$$
\begin{equation}
q(\mathbf{x}_t | \mathbf{x}_{t-1}) = \mathcal{N}(\mathbf{x}_t; \sqrt{1 - \beta_t} \mathbf{x}_{t-1}, \beta_t\mathbf{I})
\label{eq:forward_from_last}
\end{equation}
$$

where the step sizes are controlled by a variance schedule $\{\beta_t \in (0, 1)\}_{t=1}^T$. [DDPM; Ho et al., 2020](https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html) set the variances to constants increasing linearly from $\beta_1 = 10^{-4}$ to $\beta_T = 0.02$. We define the joint distribution assuming the forward diffusion process follows the Markov chain:

$$
\begin{aligned}
q(\mathbf{x}_{1:T} | \mathbf{x}_0) := &\ q(\mathbf{x}_1, \dots , \mathbf{x}_T | \mathbf{x}_0) \\
\text{(chain rule of probability)} = &\ q(\mathbf{x}_1 | \mathbf{x}_0) \cdot q(\mathbf{x}_2, \dots , \mathbf{x}_T | \mathbf{x}_1, \mathbf{x}_0) \\
\text{(chain rule of probability)} = &\ q(\mathbf{x}_1 | \mathbf{x}_0) \\
&\ \cdot q(\mathbf{x}_2 | \mathbf{x}_1, \mathbf{x}_0) \\
&\ \dots \\
&\ \cdot q(\mathbf{x}_T | \mathbf{x}_{T-1}, \dots, \mathbf{x}_0) \\
\text{(Markov chain)} = &\ q(\mathbf{x}_1 | \mathbf{x}_0) \cdot q(\mathbf{x}_2 | \mathbf{x}_1) \dots q(\mathbf{x}_T | \mathbf{x}_{T-1}) \\
= &\prod^T_{t=1} q(\mathbf{x}_t | \mathbf{x}_{t-1})
\end{aligned}
$$

such that:

$$
\begin{equation}
q(\mathbf{x}_{1:T} | \mathbf{x}_0) = \prod^T_{t=1} q(\mathbf{x}_t | \mathbf{x}_{t-1})
\label{eq:forward_joint}
\end{equation}
$$

Using the reparameterization trick, every normal distribution is a version of the standard normal distribution:

$$
\mathcal{N}(x; \mu, \sigma^2) = \frac{1}{\sigma} \mathcal{N}(z=\frac{x-\mu}{\sigma}, 0, 1)
$$

Thus, if $x \sim \mathcal{N}(\mu, \sigma^2)$, then $x$ can be reparameterized as:

$$
\begin{equation}
x = \mu + \sigma z
\label{eq:reparameterization}
\end{equation}
$$

where $z \sim \mathcal{N}(0, 1)$. Use $\eqref{eq:reparameterization}$ to rewrite $\eqref{eq:forward_from_last}$:

$$
\begin{aligned}
\mathbf{x}_t &= \sqrt{1 - \beta_t}\mathbf{x}_{t-1} + \sqrt{\beta_t}\boldsymbol{\epsilon}_{t-1} & \text{;where } \boldsymbol{\epsilon}_{t-1}, \boldsymbol{\epsilon}_{t-2}, \dots \sim \mathcal{N}(\mathbf{0}, \mathbf{I}) \\
&= \sqrt{\alpha_t}\mathbf{x}_{t-1} + \sqrt{1 - \alpha_t}\boldsymbol{\epsilon}_{t-1} & \text{;where } \alpha_t = 1 - \beta_t \\
&= \sqrt{\alpha_t}(\sqrt{\alpha_{t-1}} \mathbf{x}_{t-2} + \sqrt{1 - \alpha_{t-1}}\boldsymbol{\epsilon}_{t-2}) + \sqrt{1 - \alpha_t}\boldsymbol{\epsilon}_{t-1} \\
&= \sqrt{\alpha_t \alpha_{t-1}} \mathbf{x}_{t-2} + \sqrt{\alpha_t - \alpha_t \alpha_{t-1}} \boldsymbol{\epsilon}_{t-2} + \sqrt{1 - \alpha_t}\boldsymbol{\epsilon}_{t-1} \\
&= \sqrt{\alpha_t \alpha_{t-1}} \mathbf{x}_{t-2} + \sqrt{1 - \alpha_t \alpha_{t-1}} \bar{\boldsymbol{\epsilon}}_{t-2} & \text{;where } \bar{\boldsymbol{\epsilon}}_{t-2} \text{ merges two Gaussians} \\
&= \dots & \text{(sum of normally distributed random variables)}\\
&= \sqrt{\bar{\alpha}_t}\mathbf{x}_0 + \sqrt{1 - \bar{\alpha}_t}\boldsymbol{\epsilon} & \text{;where } \bar{\alpha}_t = \prod_{i=1}^t \alpha_i
\end{aligned}
$$

Such that:

$$
\begin{equation}
\mathbf{x}_t = \sqrt{\bar{\alpha}_t}\mathbf{x}_0 + \sqrt{1 - \bar{\alpha}_t}\boldsymbol{\epsilon}
\label{eq:forward_reparameterization}
\end{equation}
$$

or:

$$
\begin{equation}
q(\mathbf{x}_t | \mathbf{x}_0) = \mathcal{N}(\mathbf{x}_t; \sqrt{\bar{\alpha}_t} \mathbf{x}_0, (1 - \bar{\alpha}_t) \mathbf{I})
\label{eq:forward_from_zero}
\end{equation}
$$

According to the setting of [DDPM; Ho et al., 2020](https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html), $\alpha_1 = 0.9999$ and $\alpha_T = 0.98$. Therefore $\bar{\alpha}_1 = 0.9999$ and $\bar{\alpha}_T \approx 0$.

## Reverse diffusion process

Again we define the reverse diffusion process as a learnable model that approximates the condition probability from $\mathbf{x}_t$ to $\mathbf{x}_{t-1}$:

$$
p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t) = \mathcal{N}(\mathbf{x}_{t-1}; \boldsymbol{\mu}_\theta(\mathbf{x}_t, t), \boldsymbol{\Sigma}_\theta(\mathbf{x}_t, t))
$$

where $\mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$. We define the joint distribution assuming the reverse diffusion process also follows the Markov chain:

$$
\begin{aligned}
p_\theta(\mathbf{x}_{0:T}) := &\ p_\theta(\mathbf{x}_0, \dots, \mathbf{x}_T) \\
\text{(chain rule of probability)} = &\ p(\mathbf{x}_T) \\
&\ \cdot p_\theta(\mathbf{x}_{T-1} | \mathbf{x}_{T}) \\
&\ \dots \\
&\ \cdot p_\theta(\mathbf{x}_0 | \mathbf{x}_1, \dots, \mathbf{x}_{T}) \\
\text{(Markov chain)} = &\ p(\mathbf{x}_T) p_\theta(\mathbf{x}_{T-1} | \mathbf{x}_{T}) \dots p_\theta(\mathbf{x}_0 | \mathbf{x}_1) \\
= &\ p(\mathbf{x}_T) \prod^T_{t=1} p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)
\end{aligned}
$$

such that:

$$
\begin{equation}
p_\theta(\mathbf{x}_{0:T}) = p(\mathbf{x}_T) \prod^T_{t=1} p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)
\label{eq:reverse_joint}
\end{equation}
$$

To solve the reverse problem, we start by using Bayes' rule to rewrite $\eqref{eq:forward_from_last}$ as:

$$
\begin{aligned}
q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0) &= q(\mathbf{x}_t | \mathbf{x}_{t-1}, \mathbf{x}_0) \frac{ q(\mathbf{x}_{t-1} | \mathbf{x}_0) }{ q(\mathbf{x}_t | \mathbf{x}_0) } \\
\text{(Markov chain) } &= q(\mathbf{x}_t | \mathbf{x}_{t-1}) \frac{ q(\mathbf{x}_{t-1} | \mathbf{x}_0) }{ q(\mathbf{x}_t | \mathbf{x}_0) } \\
\text{(Using } \eqref{eq:forward_from_last} \text{ and } \eqref{eq:forward_from_zero} \text{ )} &= \mathcal{N}(\mathbf{x}_t; \sqrt{\alpha_t} \mathbf{x}_{t-1}, \beta_t \mathbf{I}) \frac{\mathcal{N}(\mathbf{x}_{t-1}; \sqrt{\bar{\alpha}_{t-1}} \mathbf{x}_0, (1 - \bar{\alpha}_{t-1}) \mathbf{I})}{\mathcal{N}(\mathbf{x}_t; \sqrt{\bar{\alpha}_t} \mathbf{x}_0, (1 - \bar{\alpha}_t) \mathbf{I})} \\
&\propto \exp \Big(-\frac{1}{2} \big(\frac{(\mathbf{x}_t - \sqrt{\alpha_t} \mathbf{x}_{t-1})^2}{\beta_t} + \frac{(\mathbf{x}_{t-1} - \sqrt{\bar{\alpha}_{t-1}} \mathbf{x}_0)^2}{1-\bar{\alpha}_{t-1}} - \frac{(\mathbf{x}_t - \sqrt{\bar{\alpha}_t} \mathbf{x}_0)^2}{1-\bar{\alpha}_t} \big) \Big) \\
&= \exp \Big(-\frac{1}{2} \big(\frac{\mathbf{x}_t^2 - 2\sqrt{\alpha_t} \mathbf{x}_t \color{blue}{\mathbf{x}_{t-1}} \color{black}{+ \alpha_t} \color{red}{\mathbf{x}_{t-1}^2} }{\beta_t} + \frac{ \color{red}{\mathbf{x}_{t-1}^2} \color{black}{- 2 \sqrt{\bar{\alpha}_{t-1}} \mathbf{x}_0} \color{blue}{\mathbf{x}_{t-1}} \color{black}{+ \bar{\alpha}_{t-1} \mathbf{x}_0^2}  }{1-\bar{\alpha}_{t-1}} - \frac{(\mathbf{x}_t - \sqrt{\bar{\alpha}_t} \mathbf{x}_0)^2}{1-\bar{\alpha}_t} \big) \Big) \\
&= \exp\Big( -\frac{1}{2} \big( \color{red}{(\frac{\alpha_t}{\beta_t} + \frac{1}{1 - \bar{\alpha}_{t-1}})} \mathbf{x}_{t-1}^2 \color{blue}{-(\frac{2\sqrt{\alpha_t}}{\beta_t} \mathbf{x}_t + \frac{2\sqrt{\bar{\alpha}_{t-1}}}{1 - \bar{\alpha}_{t-1}} \mathbf{x}_0)} \mathbf{x}_{t-1} \color{black}{ + C(\mathbf{x}_t, \mathbf{x}_0) \big) \Big)} \\
&= \exp \Big( -\frac{1}{2} \frac{(\mathbf{x}_{t-1}-\color{blue}{\tilde{\boldsymbol{\mu}}(\mathbf{x}_t, \mathbf{x}_0)}\color{black})^2}{\color{red}{\tilde{\beta}_t}} + \bar{C}(\mathbf{x}_t, \mathbf{x}_0) \Big) \\
\end{aligned}
$$

So that:

$$
\begin{aligned}
\tilde{\beta}_t &= 1/(\frac{\alpha_t}{\beta_t} + \frac{1}{1 - \bar{\alpha}_{t-1}}) \\
&= \frac{\beta_t(1 - \bar{\alpha}_{t-1})} {\alpha_t - \bar{\alpha}_t + \beta_t} \\
(\alpha_t = 1 - \beta_t) &= \color{green}{\frac{1 - \bar{\alpha}_{t-1}}{1 - \bar{\alpha}_t} \cdot \beta_t}
\end{aligned}
$$

and:

$$
\begin{aligned}
\tilde{\boldsymbol{\mu}}_t (\mathbf{x}_t, \mathbf{x}_0)
&= (\frac{2\sqrt{\alpha_t}}{\beta_t} \mathbf{x}_t + \frac{2\sqrt{\bar{\alpha}_{t-1} }}{1 - \bar{\alpha}_{t-1}} \mathbf{x}_0)/ \big( 2(\frac{\alpha_t}{\beta_t} + \frac{1}{1 - \bar{\alpha}_{t-1}}) \big) \\
&= (\frac{\sqrt{\alpha_t}}{\beta_t} \mathbf{x}_t + \frac{\sqrt{\bar{\alpha}_{t-1} }}{1 - \bar{\alpha}_{t-1}} \mathbf{x}_0) \color{green}{\frac{1 - \bar{\alpha}_{t-1}}{1 - \bar{\alpha}_t} \cdot \beta_t} \\
&= \frac{\sqrt{\alpha_t}(1 - \bar{\alpha}_{t-1})}{1 - \bar{\alpha}_t} \mathbf{x}_t + \frac{\sqrt{\bar{\alpha}_{t-1}}\beta_t}{1 - \bar{\alpha}_t} \mathbf{x}_0 \\
\text{(from } \eqref{eq:forward_reparameterization} \text{ )}&= \frac{\sqrt{\alpha_t}(1 - \bar{\alpha}_{t-1})}{1 - \bar{\alpha}_t} \mathbf{x}_t + \frac{\sqrt{\bar{\alpha}_{t-1}}\beta_t}{1 - \bar{\alpha}_t} \frac{1}{\sqrt{\bar{\alpha}_t}}(\mathbf{x}_t - \sqrt{1 - \bar{\alpha}_t}\boldsymbol{\epsilon}_t) \\
(\alpha_t = 1 - \beta_t) &= \frac{1}{\sqrt{\alpha_t}} \Big( \big( \frac{\alpha_t(1-\bar{\alpha}_{t-1})}{1-\bar{\alpha}_t} + \frac{\sqrt{\bar{\alpha}_{t-1}}(1-\alpha_t)}{1-\bar{\alpha}_t} \cdot \frac{1}{\sqrt{\bar{\alpha}_{t-1}}} \big) \mathbf{x}_t - \frac{\sqrt{\bar{\alpha}_{t-1}}(1-\alpha_t)}{1-\bar{\alpha}_t} \cdot \frac{1}{\sqrt{\bar{\alpha}_{t-1}}} \cdot \sqrt{1 - \bar{\alpha}_t}\boldsymbol{\epsilon}_t) \Big) \\
&= \color{cyan}{\frac{1}{\sqrt{\alpha_t}} \Big( \mathbf{x}_t - \frac{1 - \alpha_t}{\sqrt{1 - \bar{\alpha}_t}} \boldsymbol{\epsilon}_t \Big)}
\end{aligned}
$$

The goal of the reverse process is to maxiumize $p_\theta(\mathbf{x}_0)$ and we can use the variational lower bound to optimize the negative log-likelihood:

$$
\begin{aligned}
\text{(Gibbs' inequality) } - \log p_\theta(\mathbf{x}_0) &\leq - \log p_\theta(\mathbf{x}_0) + D_\text{KL}(q(\mathbf{x}_{1:T}|\mathbf{x}_0) \| p_\theta(\mathbf{x}_{1:T}|\mathbf{x}_0) ) \\
&= -\log p_\theta(\mathbf{x}_0) + \mathbb{E}_{\mathbf{x}_{1:T}\sim q(\mathbf{x}_{1:T} | \mathbf{x}_0)} \Big[ \log\frac{q(\mathbf{x}_{1:T}|\mathbf{x}_0)}{p_\theta(\mathbf{x}_{0:T}) / p_\theta(\mathbf{x}_0)} \Big] \\
&= -\log p_\theta(\mathbf{x}_0) + \mathbb{E}_{\mathbf{x}_{1:T}\sim q(\mathbf{x}_{1:T} | \mathbf{x}_0)} \Big[ \log\frac{q(\mathbf{x}_{1:T}|\mathbf{x}_0)}{p_\theta(\mathbf{x}_{0:T})} + \log p_\theta(\mathbf{x}_0) \Big] \\
&= \mathbb{E}_{\mathbf{x}_{1:T}\sim q(\mathbf{x}_{1:T} | \mathbf{x}_0)} \Big[ - \log \frac{p_\theta(\mathbf{x}_{0:T})}{q(\mathbf{x}_{1:T}|\mathbf{x}_0)} \Big] \\
\text{Let }L_\text{VLB}  &= \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \Big[ \mathbb{E}_{\mathbf{x}_{1:T}\sim q(\mathbf{x}_{1:T} | \mathbf{x}_0)} \Big[ \log \frac{q(\mathbf{x}_{1:T}|\mathbf{x}_0)}{p_\theta(\mathbf{x}_{0:T})} \Big] \Big] \\
&= \int_{\mathbf{x}_0 \in \mathcal{X}} q(\mathbf{x}_0) \Big[ \int_{\mathbf{x}_{1:T} \in \mathcal{X}} q(\mathbf{x}_{1:T} | \mathbf{x}_0) \cdot \log \frac{q(\mathbf{x}_{1:T}|\mathbf{x}_0)}{p_\theta(\mathbf{x}_{0:T})} d_{\mathbf{x}_{1:T}} \Big] d_{\mathbf{x}_0} \\
&= \int_{\mathbf{x}_{0:T} \in \mathcal{X}} q(\mathbf{x}_{0:T}) \cdot \log \frac{q(\mathbf{x}_{1:T}|\mathbf{x}_0)}{p_\theta(\mathbf{x}_{0:T})} d_{\mathbf{x}_{0:T}} \\
&= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ - \log \frac{p_\theta(\mathbf{x}_{0:T})}{q(\mathbf{x}_{1:T}|\mathbf{x}_0)} \Big] \\
&\geq \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \Big[ - \log p_\theta(\mathbf{x}_0) \Big]
\end{aligned}
$$

We can also minimize the cross-entropy as the learning objective:

$$
\begin{aligned}
L_\text{CE} &= - \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \log p_\theta(\mathbf{x}_0) \\
&= - \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \log \Big( \int_{\mathbf{x}_{1:T} \in \mathcal{X}} p_\theta(\mathbf{x}_{0:T}) d\mathbf{x}_{1:T} \Big) \\
&= - \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \log \Big( \int_{\mathbf{x}_{1:T} \in \mathcal{X}} q(\mathbf{x}_{1:T} | \mathbf{x}_0) \frac{p_\theta(\mathbf{x}_{0:T})}{q(\mathbf{x}_{1:T} | \mathbf{x}_{0})} d\mathbf{x}_{1:T} \Big) \\
&= \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \Big[ - \log \big( \mathbb{E}_{\mathbf{x}_{1:T} \sim q(\mathbf{x}_{1:T} | \mathbf{x}_0)} \frac{p_\theta(\mathbf{x}_{0:T})}{q(\mathbf{x}_{1:T} | \mathbf{x}_{0})} \big) \Big] & \text{;where} - \log (x) \text{ is a convex function} \\
\text{(Jensen's inequality) } &\leq \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \Big[ \mathbb{E}_{\mathbf{x}_{1:T} \sim q(\mathbf{x}_{1:T})} \big[ - \log \frac{p_\theta(\mathbf{x}_{0:T})}{q(\mathbf{x}_{1:T} | \mathbf{x}_{0})} \big] \Big] \\
&= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ - \log \frac{p_\theta(\mathbf{x}_{0:T})}{q(\mathbf{x}_{1:T}|\mathbf{x}_0)} \Big]  = L_\text{VLB}
\end{aligned}
$$

To convert each term in the equation to be analytically computable, the objective can be further rewritten to be a combination of several KL-divergence and entropy terms:

$$
\begin{aligned}
L_\text{VLB} &= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ - \log \frac{p_\theta(\mathbf{x}_{0:T})}{q(\mathbf{x}_{1:T}|\mathbf{x}_0)} \Big] \\
\text{(Using } \eqref{eq:forward_joint} \text{ and } \eqref{eq:reverse_joint} \text{ )} &= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ - \log \frac{\color{red} p_\theta(\mathbf{x}_T) \color{black} \prod_{t=1}^T \color{green} p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)}{\prod_{t=1}^T \color{green} q(\mathbf{x}_t | \mathbf{x}_{t-1})} \Big] \\
&= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ -\log \color{red} p_\theta(\mathbf{x}_T) \color{black} - \sum_{t=1}^T \log \frac{\color{green} p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)}{\color{green} q(\mathbf{x}_t | \mathbf{x}_{t-1})} \Big] \\
&= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ -\log p_\theta(\mathbf{x}_T) + \sum_{t=2}^T \log \frac{\color{blue} q(\mathbf{x}_t | \mathbf{x}_{t-1})}{p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)} - \log \frac{p_\theta(\mathbf{x}_0 | \mathbf{x}_1)}{q(\mathbf{x}_1 | \mathbf{x}_0)} \Big] \\
&= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ -\log p_\theta(\mathbf{x}_T) + \sum_{t=2}^T \log \Big( \frac{\color{blue} q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0)}{p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)} \cdot \frac{\color{blue} q(\mathbf{x}_t | \mathbf{x}_0)}{\color{blue} q(\mathbf{x}_{t-1}|\mathbf{x}_0)} \Big) - \log \frac{p_\theta(\mathbf{x}_0 | \mathbf{x}_1)}{q(\mathbf{x}_1 | \mathbf{x}_0)} \Big] \\
&= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ -\log p_\theta(\mathbf{x}_T) + \sum_{t=2}^T \log \frac{\color{blue} q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0)}{p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)} + \boxed{\sum_{t=2}^T \log \frac{\color{blue} q(\mathbf{x}_t | \mathbf{x}_0)}{\color{blue} q(\mathbf{x}_{t-1} | \mathbf{x}_0)}} - \log \frac{p_\theta(\mathbf{x}_0 | \mathbf{x}_1)}{q(\mathbf{x}_1 | \mathbf{x}_0)} \Big] \\
&= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ -\log p_\theta(\mathbf{x}_T) + \sum_{t=2}^T \log \frac{q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0)}{p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)} + \boxed{\log\frac{q(\mathbf{x}_T | \mathbf{x}_0)}{q(\mathbf{x}_1 | \mathbf{x}_0)}} - \log \frac{p_\theta(\mathbf{x}_0 | \mathbf{x}_1)}{q(\mathbf{x}_1 | \mathbf{x}_0)} \Big]\\
&= \mathbb{E}_{\mathbf{x}_{0:T} \sim q(\mathbf{x}_{0:T})} \Big[ \log\frac{q(\mathbf{x}_T | \mathbf{x}_0)}{p_\theta(\mathbf{x}_T)} + \sum_{t=2}^T \log \frac{q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0)}{p_\theta(\mathbf{x}_{t-1} |\mathbf{x}_t)} - \log p_\theta(\mathbf{x}_0 | \mathbf{x}_1) \Big] \\
&= \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \Big[ \mathbb{E}_{\mathbf{x}_T \sim q(\mathbf{x}_T | \mathbf{x}_0)} \big[ \log\frac{q(\mathbf{x}_T | \mathbf{x}_0)}{p_\theta(\mathbf{x}_T)} \big] \Big] + \sum_{t=2}^T \mathbb{E}_{\mathbf{x}_0, \mathbf{x}_t \sim q(\mathbf{x}_0, \mathbf{x}_t)} \Big[ \mathbb{E}_{\mathbf{x}_{t-1} \sim q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0)} \big[ \log \frac{q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0)}{p_\theta(\mathbf{x}_{t-1} |\mathbf{x}_t)} \big] \Big] + \mathbb{E}_{\mathbf{x}_0, \mathbf{x}_1 \sim q(\mathbf{x}_0, \mathbf{x}_1)} \Big[ - \log p_\theta(\mathbf{x}_0 | \mathbf{x}_1) \Big] \\
(\ \mathbf{x}_t \text{ is available as input}\ ) &= \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \Big[ \mathbb{E}_{\mathbf{x}_T \sim q(\mathbf{x}_T | \mathbf{x}_0)} \big[ \log\frac{q(\mathbf{x}_T | \mathbf{x}_0)}{p_\theta(\mathbf{x}_T)} \big] \Big] + \sum_{t=2}^T \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \Big[ \mathbb{E}_{\mathbf{x}_{t-1} \sim q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0)} \big[ \log \frac{q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0)}{p_\theta(\mathbf{x}_{t-1} |\mathbf{x}_t)} \big] \Big] + \mathbb{E}_{\mathbf{x}_0, \mathbf{x}_1 \sim q(\mathbf{x}_0, \mathbf{x}_1)} \Big[ - \log p_\theta(\mathbf{x}_0 | \mathbf{x}_1) \Big] \\
&= \underbrace{\mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \Big[ D_\text{KL}(q(\mathbf{x}_T | \mathbf{x}_0) \parallel p_\theta(\mathbf{x}_T)) \Big]}_{L_T} + \sum_{t=2}^T \underbrace{\mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0)} \Big[ D_\text{KL}(q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0) \parallel p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)) \Big]}_{L_{t-1}} + \underbrace{\mathbb{E}_{\mathbf{x}_0, \mathbf{x}_1 \sim q(\mathbf{x}_0, \mathbf{x}_1)} \Big[ - \log p_\theta(\mathbf{x}_0 | \mathbf{x}_1) \Big]}_{L_0}
\end{aligned}
$$

We want to train a model:

$$
p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t) = \mathcal{N}(\mathbf{x}_{t-1}; \boldsymbol{\mu}_\theta(\mathbf{x}_t, t), \boldsymbol{\Sigma}_\theta(\mathbf{x}_t, t))
$$

which can predict:

$$
\begin{aligned}
q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0) &= \mathcal{N}(\mathbf{x}_{t-1}; \tilde{\boldsymbol{\mu}}_t, \tilde{\beta}_t \mathbf{I}) \\
&= \mathcal{N} \Big( \mathbf{x}_{t-1}; \frac{1}{\sqrt{\alpha_t}} \big( \mathbf{x}_t - \frac{1 - \alpha_t}{\sqrt{1 - \bar{\alpha}_t}} \boldsymbol{\epsilon}_t \big), \frac{1 - \bar{\alpha}_{t-1}}{1 - \bar{\alpha}_t} \cdot \beta_t \mathbf{I} \Big)
\end{aligned}
$$

The $p_\theta$ can then be represented as:

$$
p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t) = \mathcal{N} \Big( \mathbf{x}_{t-1}; \frac{1}{\sqrt{\alpha_t}} \big( \mathbf{x}_t - \frac{1 - \alpha_t}{\sqrt{1 - \bar{\alpha}_t}} \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t) \big), \frac{1 - \bar{\alpha}_{t-1}}{1 - \bar{\alpha}_t} \cdot \beta_t \mathbf{I} \Big)
$$

Therefore:

$$
\begin{aligned}
L_t &= \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0), \boldsymbol{\epsilon}} \Big[\frac{1}{2 \| \boldsymbol{\Sigma}_\theta(\mathbf{x}_t, t) \|^2_2} \| \color{blue}{\tilde{\boldsymbol{\mu}}_t(\mathbf{x}_t, \mathbf{x}_0)} - \color{green}{\boldsymbol{\mu}_\theta(\mathbf{x}_t, t)} \|^2 \Big] \\
&= \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0), \boldsymbol{\epsilon}} \Big[\frac{1}{2  \|\boldsymbol{\Sigma}_\theta \|^2_2} \| \color{blue}{\frac{1}{\sqrt{\alpha_t}} \Big( \mathbf{x}_t - \frac{1 - \alpha_t}{\sqrt{1 - \bar{\alpha}_t}} \boldsymbol{\epsilon}_t \Big)} - \color{green}{\frac{1}{\sqrt{\alpha_t}} \Big( \mathbf{x}_t - \frac{1 - \alpha_t}{\sqrt{1 - \bar{\alpha}_t}} \boldsymbol{\boldsymbol{\epsilon}}_\theta(\mathbf{x}_t, t) \Big)} \|^2 \Big] \\
&= \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0), \boldsymbol{\epsilon}} \Big[\frac{ (1 - \alpha_t)^2 }{2 \alpha_t (1 - \bar{\alpha}_t) \| \boldsymbol{\Sigma}_\theta \|^2_2} \|\boldsymbol{\epsilon}_t - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)\|^2 \Big] \\
&= \mathbb{E}_{\mathbf{x}_0 \sim q(\mathbf{x}_0), \boldsymbol{\epsilon}} \Big[\frac{ (1 - \alpha_t)^2 }{2 \alpha_t (1 - \bar{\alpha}_t) \| \boldsymbol{\Sigma}_\theta \|^2_2} \|\boldsymbol{\epsilon}_t - \boldsymbol{\epsilon}_\theta(\sqrt{\bar{\alpha}_t}\mathbf{x}_0 + \sqrt{1 - \bar{\alpha}_t}\boldsymbol{\epsilon}_t, t)\|^2 \Big]
\end{aligned}
$$

Empirically, [Ho et al. (2020)](https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html) found that training the diffusion model works better with a simplified objective that ignores the weighting term:

$$
\begin{aligned}
L_t^\text{simple}
&= \mathbb{E}_{t \sim [1, T], \mathbf{x}_0 \sim q(\mathbf{x}_0), \boldsymbol{\epsilon}_t} \Big[\|\boldsymbol{\epsilon}_t - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)\|^2 \Big] \\
&= \mathbb{E}_{t \sim [1, T], \mathbf{x}_0 \sim q(\mathbf{x}_0), \boldsymbol{\epsilon}_t} \Big[\|\boldsymbol{\epsilon}_t - \boldsymbol{\epsilon}_\theta(\sqrt{\bar{\alpha}_t}\mathbf{x}_0 + \sqrt{1 - \bar{\alpha}_t}\boldsymbol{\epsilon}_t, t)\|^2 \Big]
\end{aligned}
$$
