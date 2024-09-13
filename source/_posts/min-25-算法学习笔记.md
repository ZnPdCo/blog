---
title: min_25 算法学习笔记
date: 2024-09-13 16:21:25
categories: [算法]
tags: [算法, 原创, 数论]
mathjax: true
---

## 前言

如果你学过杜教筛，应该知道杜教筛是一个可以在 $O\left(n^{\frac{2}{3} }\right)$ 的时间内筛出一些积性函数的前缀和的，比如说 $\sum_{i=1}^n \varphi(i)$、$\sum_{i=1}^n \mu(i)$ 之类的。

但是杜教筛的局限性比较大，如果原本的函数不能很好的表示为若干个完全积性函数的卷积的话，是很不好做的。

所以 min_25 筛便横空出世，它的应用范围更广，能在 $O\left(\frac{n^{\frac{3}{4} } }{\log n}\right)$ 内筛出积性函数前缀和。

min_25 筛的前置要求是能够把要筛的函数，**在取值为质数的时候**，能够表示为若干个完全积性函数的和，比如 $\varphi(p)=p-1$，这里的 $p$ 是一个质数。

## 约定

下文中，如果没有特殊规定，则 $p$ 表示质数，$P$ 表示质数集，$P_j$ 表示第 $j$ 个质数。$f$ 是我们要筛的积性函数，$f'$ 是一个满足 $\forall p,f'(p)=f(p)$ 的函数。

## g 函数

定义 $g(x,j)=\sum_{i=2}^{x} f'(i)[i\in P\lor \min_{p|i}p>P_j]$。

考虑 $g(x,j-1)$ 怎么转移到 $g(x,j)$。

容易发现当 ${P_j}^2>n$ 时，有 $g(x,j)=g(x,j-1)$。

当 ${P_j}^2\le x$ 时，发现只有最小公因数为 $P_{j}$ 的数会受到影响。

这些数是什么呢？容易发现它们就是 $f'(P_j)(g(\frac{x}{P_{j} }, j-1)-\sum_{i=1}^{j-1} f'(P_i))$，后面之所以减去是因为质数都可以贡献，会算重。

所以说有：

$$
g(x,j)=\begin{cases}
g(x,j-1) & {P_j}^2>x \\
g(x,j-1)-f'(P_j)(g(\frac{x}{P_{j} }, j-1)-\sum_{i=1}^{j-1} f'(P_i)) & {P_j}^2\le x
\end{cases}
$$

容易发现 $j$ 最多只会达到 $\sqrt n$，$f'$ 的前缀和我们已经假定预处理完了，所以暴力复杂度是 $O(n\sqrt n)$

欸，怎么还越来越慢了呢？

没有关系，这里其实有用的 $n$ 非常少，所以是可以优化的，具体下面会说到。

## S 函数

定义 $S(x,j)=\sum_{i=2}^{x} f(i)[\min_{p|i}p>P_j]$。

我们将答案分为质数和合数两个部分，最后答案就是两个部分相加。

对于质数部分，考虑到 $\forall p,f'(p)=f(p)$，所以在 $i\in P$ 的时候直接用 $f'$ 替代 $f$，答案就是 $g(x,|P|)-sum_{i=1}^j f'(P_i)$。

那么合数时怎么办呢？在合数处答案考虑枚举每一个数的最小质因数及他的次数，答案为：

$$
\sum_{k>j}\sum_{e=1}^{ {P_k}^e\le x} f({P_k}^e)(S(\frac{x}{ {P_k}^e},k)+[e>1])
$$

这里的 $e>1$ 是因为 $S$ 不算上为 $1$ 的数，而质数的 $1$ 次方前面已经算过了。

所以：

$$
S(x,j)=g(x,|P|)-sum_{i=1}^j f'(P_i)+\sum_{k>j}\sum_{e=1}^{ {P_k}^e\le x} f({P_k}^e)(S(\frac{x}{ {P_k}^e},k)+[e>1])
$$

答案就是 $S(n,0)+f(1)$，因为 $S$ 不算上 $1$ 的。

**注意**：发现这里的 $S$ 函数的 $x$ 的取值必定是 $\frac{n}{?}$ 的形式，容易发现取值只有 $2\sqrt n$ 个，所以我们只需要处理这 $2\sqrt n$ 个数的 $g$ 的取值就好了！

然后再乍一看是 $O(n)$ 的，实际上处理 $x$ 时，$j$ 必须要求满足 ${P_j}^2\le x$，这么一特判就是 $O\left(\frac{n^{\frac{3}{4} } }{\log n}\right)$ 的了。

## 细节

然后我们发现储存这些 $x$ 可能的取值值域非常大，当然可以用 `map`，但会多劳嗝，不好。

实际上，当 $x\le \sqrt n$ 时，我们直接用 $\sqrt n$ 的数组存；当 $x>\sqrt n$ 时，我们储存为 $\frac{n}{x}$ 的形式，也不会重复，也不会大于 $\sqrt n$，所以就可以线性了。

## 代码

https://www.luogu.com.cn/problem/P5325

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define P 1000000007
#define N 200010
bool flag[N];
int tot;
int m, sq;
ll n, prime[N], sum1[N], sum2[N], w[N], g1[N], g2[N], id1[N], id2[N];
void init() {
	for(int i = 2; i <= sq; i ++) {
		if(!flag[i]) {
			prime[++ tot] = i;
		}
		for(int j = 1; i * prime[j] <= sq && j <= tot; j ++) {
			flag[i * prime[j]] = 1;
			if(i % prime[j] == 0) break;
		}
	}
	for(int i = 1; i <= tot; i ++) {
		sum1[i] = (sum1[i - 1] + prime[i]) % P;
		sum2[i] = (sum2[i - 1] + prime[i] * prime[i] % P) % P;
	}
}
ll f1(ll x) {
	x %= P;
	return x * (x + 1) / 2 % P;
}
ll f2(ll x) {
	x %= P;
	return x * (x + 1) % P * (2 * x % P + 1) % P * 166666668 % P;
}
ll getid(ll x) {
	if(x <= sq) return id1[x];
	return id2[n / x];
}
ll S(ll x, int j) {
	if(prime[j] >= x) return 0;
	ll Ans = (g2[getid(x)] - g1[getid(x)] + P) % P - (sum2[j] - sum1[j] + P) % P;
	Ans = (Ans % P + P) % P;
	for(int i = j + 1; i <= tot && prime[i] * prime[i] <= x; i ++) {
		for(ll e = 1, sp = prime[i]; sp <= x; sp *= prime[i], e ++) {
			Ans = (Ans + sp % P * (sp % P - 1) % P * (S(x / sp, i) + (e > 1)) % P) % P;
		}
	}
	return Ans;
}
int main() {
	scanf("%lld", &n);
	sq = sqrt(n);
	init();
	for(ll l = 1, r; l <= n; l = r + 1) {
		r = (n / (n / l)), w[++ m] = n / l;
		g1[m] = f1(w[m]) - 1;
		g2[m] = f2(w[m]) - 1;
		if(w[m] <= sq) id1[w[m]] = m;
		else id2[n / w[m]] = m;
	}
	for(int i = 1; i <= tot; i ++) {
		for(int j = 1; j <= m && prime[i] * prime[i] <= w[j]; j ++) {
			g1[j] = (g1[j] - prime[i] * (g1[getid(w[j] / prime[i])] - sum1[i - 1]) % P + P) % P;
			g2[j] = (g2[j] - prime[i] * prime[i] % P * (g2[getid(w[j] / prime[i])] - sum2[i - 1]) % P + P) % P;
		}
	}
	printf("%lld\n", (S(n, 0) + 1) % P);
}
```

