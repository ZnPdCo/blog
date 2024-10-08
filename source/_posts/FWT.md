---
title: 快速沃尔什变换 (FWT)
date: 2024-05-07 00:00:00
thumbnail: https://cdn.luogu.com.cn/upload/image_hosting/zzhdk40u.png
categories: [算法]
tags: [算法, 原创, 多项式]
mathjax: true
---

> [博客园](https://www.cnblogs.com/znpdco/p/18172429)
>
> [我的博客](https://znpdco.github.io/%E7%AE%97%E6%B3%95/2024/05/07/FWT.html)

## 快速沃尔什变换解决的卷积问题

快速沃尔什变换（FWT）是解决这样一类卷积问题：

$$
c_i=\sum_{i=j\odot k}a_jb_k
$$

其中，$\odot$ 是位运算的一种。举个例子，给定数列 $a,b$，求：

$$
c_i=\sum_{j\oplus k=i} a_jb_k
$$

## FWT 的思想

看到 FWT 的名字，我们可以联想到之前学过的 FFT（很可惜，我没有写过 FFT 的笔记，所以没有链接），先看看 FFT 的原理：

1. 把 $a,b$ 变换为 $A,B$，$O(n\log n)$；
2. 通过 $C_i=A_iB_i$ 计算，$O(n)$;
3. 把 $C$ 变换回 $c$，$O(n\log n)$。

综上，时间复杂度是 $O(n\log n)$ 的。

在 FFT 中，我们构造了 $A,B$ 为 $a,b$ 的点值表示法，这么做满足 $C_i=A_iB_i$ 且容易变换。

其实 FWT 的思想也是一样的，主要也是需要构造 $A,B$，使得其满足 $C_i=A_iB_i$ 且可以快速变换。下面我们举 $\cup$（按位或）、$\cap$（按位与）和 $\oplus$（按位异或）为例。

因为数列长度是 $2$ 的幂会更好处理，所以下文认为数列长度为 $2^n$。

### 按位或

$$
c_i=\sum_{j\cup k=i} a_jb_k
$$

我们可以构造 $A_i=\sum_{i\cup j=i} a_j$。看看为什么需要这么构造。

首先，它满足 $C_i=A_iB_i$：

$$
\begin{aligned}
A_iB_i&=(\sum_{i\cup j=i} a_j)(\sum_{i\cup k=i} b_k) \\
&=\sum_{i\cup j=i}\sum_{i\cup k=i}a_jb_k \\
&=\sum_{i\cup j=i}\sum_{i\cup k=i}a_jb_k \\
&=\sum_{i\cup(j\cup k)=i}a_jb_k \\
&= C_i
\end{aligned}
$$

其次，它可以快速变换。举顺变换的例子。类比 FFT 的步骤，我们采用分治的方法来处理它。假设目前考虑到第 $i$ 位，其中 $A_0$ 和 $A_1$ 是 $i-1$ 位分治的结果：

$$
A=\text{merge}(A_0, A_0+A_1)
$$

其中，$A_0$ 是数列 $A$ 的左半部分，$A_1$ 是 $A$ 的右半部分。$\text{merge}$ 函数就是把两个数列像拼接字符串一样拼接起来。$+$ 则是将两个数列对应相加。

这么做为什么是正确的呢？容易发现，$A_0$ 恰好是当前处理到的二进制位为 $0$ 的子数列，$A_1$ 则是当前处理到的二进制位为 $1$ 的子数列。若当前位为 $0$，则只能取二进制位为 $0$ 的子数列 $A_0$ 才能使得 $i\cup j=i$。而若当前位为 $1$，则两种序列都能取。

---

考虑逆变换，则是将加上的 $A_0$ 减回去：

$$
a=\text{merge}(a_0, a_1-a_0)
$$

下面我们给出代码实现。容易发现顺变换和逆变换可以合并为一个函数，顺变换时 $\text{type}=1$，逆变换时 $\text{type}=-1$。

```cpp
void Or(ll *a, ll type) {	// 迭代实现，常数更小
	for(ll x = 2; x <= n; x <<= 1) {
		ll k = x >> 1;
		for(ll i = 0; i < n; i += x) {
			for(ll j = 0; j < k; j ++) {
				(a[i + j + k] += a[i + j] * type) %= P; 
			}
		}
	}
}
```

### 按位与

$$
c_i=\sum_{j\cap k=i} a_jb_k
$$

同理构造 $A_i=\sum_{i\cap j=i} a_j$。$C_i=A_iB_i$ 的正确性不证了。

容易发现，$A_0$ 恰好是当前处理到的二进制位为 $0$ 的子数列，$A_1$ 则是当前处理到的二进制位为 $1$ 的子数列。若当前位为 $1$，则只能取二进制位为 $1$ 的子数列 $A_0$ 才能使得 $i\cap j=i$。而若当前位为 $0$，则两种序列都能取。

$$
A=\text{merge}(A_0+A_1, A_1)
$$

$$
a=\text{merge}(a_0 - a_1, a_1)
$$

---

下面我们给出代码实现。顺变换时 $\text{type}=1$，逆变换时 $\text{type}=-1$。

```cpp
void And(ll *a, ll type) {
	for(ll x = 2; x <= n; x <<= 1) {
		ll k = x >> 1;
		for(ll i = 0; i < n; i += x) {
			for(ll j = 0; j < k; j ++) {
				(a[i + j] += a[i + j + k] * type) %= P; 
			}
		}
	}
}
```

### 按位异或

发现异或有点难搞，但这怎么会难倒沃尔什大佬呢？我们引入一个新的运算符 $\circ$。定义 $x\circ y=\text{popcnt}(x\cap y)\bmod 2$，其中 $\text{popcnt}$ 表示二进制下 $1$ 的个数，并重申一下 $\cap$ 表示按位与。

不用慌，我们也不需要你真正实现一个 $\text{popcnt}$，它仅仅只是作为一个理解的辅助罢了。

我们发现它满足 $(x\circ y)\oplus (x\circ z)=x\circ(y\oplus z)$。（重申一下 $\oplus$ 表示按位异或）

感性证明：发现这个新的运算符 $\circ$ 其实就是 $x$ 与 $y$ 相同位数的奇偶性。若 $(x\circ y)\oplus (x\circ z)=0$，则 $x$ 与 $y$、$x$ 与 $z$ 相同位数个数奇偶性相同，所以 $y\oplus z$ 和 $x$ 相同位数个数奇偶性也是相同的 ；若 $(x\circ y)\oplus (x\circ z)=1$，则 $x$ 与 $y$、$x$ 与 $z$ 相同位数个数奇偶性不同，所以 $y\oplus z$ 和 $x$ 相同位数个数奇偶性也是不同的。

设 $A_i=\sum_{i\circ j=0}a_j-\sum_{i\circ j=1}a_j$。我们来证一下 $C_i=A_iB_i$ 的正确性：

$$
\begin{aligned}
A_iB_i&=(\sum_{i\circ j=0}a_j-\sum_{i\circ j=1}a_j)(\sum_{i\circ k=0}b_k-\sum_{i\circ k=1}b_k) \\
&=(\sum_{i\circ j=0}a_j\sum_{i\circ k=0}b_k+\sum_{i\circ j=1}a_j\sum_{i\circ k=1}b_k)-(\sum_{i\circ j=0}a_j\sum_{i\circ k=1}b_k+\sum_{i\circ j=1}a_j\sum_{i\circ k=0}b_k) \\
&=\sum_{(j\oplus k)\circ i=0}a_jb_k-\sum_{(j\oplus k)\circ i=1}a_jb_k \\
&=C_i
\end{aligned}
$$

来看看怎么快速计算 $A,B$ 的值，依旧是分治：

对于 $i$ 在当前位为 $0$ 的子数列 $A_0$，进行 $\circ$ 运算时发现它和 $0$ 计算或和 $1$ 计算结果都不会变（因为 $0\cap 0=0,0\cap1=0$），所以 $A_i=\sum_{i\circ j=0}a_j-\sum_{i\circ j=1}a_j$ 中的 $\sum_{i\circ j=1}a_j=0$。

对于 $i$ 在当前位为 $1$ 的子数列 $A_1$，进行 $\circ$ 运算时发现它和 $0$ 计算结果是 $0$，和 $1$ 计算结果是 $1$（因为 $1\cap 0=0,1\cap1=1$）。

综上，有：

$$
A=\text{merge}((A_0+A_1)-0, A_0-A_1)
$$

也就是：

$$
A=\text{merge}(A_0+A_1, A_0-A_1)
$$

逆变换易得：

$$
a=\text{merge}(\frac{a_0+a_1}{2}, \frac{a_0-a_1}{2})
$$

给出代码，顺变换时 $\text{type}=1$，逆变换时 $\text{type}=\frac{1}{2}$。

```cpp
void Xor(ll *a, ll type) {
	for(ll x = 2; x <= n; x <<= 1) {
		ll k = x >> 1;
		for(ll i = 0; i < n; i += x) {
			for(ll j = 0; j < k; j ++) {
				(a[i + j] += a[i + j + k]) %= P; 
				(a[i + j + k] = a[i + j] - a[i + j + k] * 2) %= P; 
				(a[i + j] *= type) %= P;
				(a[i + j + k] *= type) %= P;
			}
		}
	}
}
```

现在大家能去切前两道模板例题，并挑战一下后面的几道题目了。

## 从另一个角度看待 FWT

我们设 $c(i,j)$ 是 $a_j$ 对 $A_i$ 的贡献系数。我们可以重新描述 FWT 变换的过程：

$$
A_i = \sum_{j=0}^{n-1} c(i,j) a_j
$$

因为有：

$$
A_iB_i=C_i
$$

所以我们可以通过简单的证明得到：$c(i,j)c(i,k)=c(i,j\odot k)$。其中 $\odot$ 是任意一种位运算。

同时，$c$ 函数还有一个重要的性质，它可以按位处理。

举个例子，我们变换的时候：

$$
A_i = \sum_{j=0}^{n-1} c(i,j) a_j
$$

这么做是比较劣的，我们将其拆分：

$$
A_i = \sum_{j=0}^{(n-1)/2} c(i,j) a_j+\sum_{j=(n-1)/2+1}^{n-1} c(i,j) a_j
$$

考虑前面的式子和后面的式子 $i,j$ 的区别，发现只有最高位不同。

所以我们将 $i,j$ 去除最高位的值为 $i',j'$，并记 $i_0$ 为 $i$ 的最高位。有：

$$
A_i = c(i_0,0)\sum_{j=0}^{(n-1)/2} c(i',j') a_j+c(i_0,1)\sum_{j=(n-1)/2+1}^{n-1} c(i',j') a_j
$$

如果 $i_0=0$，则有：

$$
A_i = c(0,0)\sum_{j=0}^{(n-1)/2} c(i',j') a_j+c(0,1)\sum_{j=(n-1)/2+1}^{n-1} c(i',j') a_j
$$

$i_0=1$ 则有：

$$
A_i = c(1,0)\sum_{j=0}^{(n-1)/2} c(i',j') a_j+c(1,1)\sum_{j=(n-1)/2+1}^{n-1} c(i',j') a_j
$$

也就是说，我们只需要：

$$
\begin{bmatrix}
c(0,0) & c(0,1) \\
c(1,0) & c(1,1)
\end{bmatrix}
$$

四个数就可以完成变换了。我们称这个矩阵为位矩阵。

---

如果我们要进行逆变换，则需要上面的位矩阵的逆矩阵。

若逆矩阵为 $c^{-1}$，可以通过类似操作得到原数：

$$
a_i = \sum_{j=0}^n c^{-1}(i,j) A_j
$$

逆矩阵不一定存在，比如如果有一排 $0$ 或者一列 $0$ 那么这个矩阵就没有逆，我们在构造时需要格外小心。

### 按位或

我们可以构造：

$$
\begin{bmatrix}
1 & 0 \\
1 & 1
\end{bmatrix}
$$

这样满足 $c(i,j)c(i,k)=c(i,j\cup k)$。我们发现，这和我们前面推出的 $A=\text{merge}(A_0, A_0+A_1)$ 一模一样！同理，下面也是一个满足这个条件的矩阵，但我们一般使用上面这个：

$$
\begin{bmatrix}
1 & 1 \\
1 & 0
\end{bmatrix}
$$

虽然下面这个矩阵也满足 $c(i,j)c(i,k)=c(i,j\cup k)$，但这个矩阵存在一排 $0$，不存在逆，所以不合法：

$$
\begin{bmatrix}
0 & 0 \\
1 & 1
\end{bmatrix}
$$

如果我们要进行逆变换，则需要对矩阵求逆，以**最上面**这个矩阵为例，得：

$$
\begin{bmatrix}
1 & 0 \\
-1 & 1
\end{bmatrix}
$$

然后按照顺变换的方法，把逆变换矩阵代入即可。

### 按位与

我们可以构造：

$$
\begin{bmatrix}
1 & 1 \\
0 & 1
\end{bmatrix}
$$

这样满足 $c(i,j)c(i,k)=c(i,j\cap k)$。

逆矩阵：

$$
\begin{bmatrix}
1 & -1 \\
0 & 1
\end{bmatrix}
$$

### 按位异或

我们可以构造：

$$
\begin{bmatrix}
1 & 1 \\
1 & -1
\end{bmatrix}
$$

这样满足 $c(i,j)c(i,k)=c(i,j\oplus k)$。

逆矩阵：

$$
\begin{bmatrix}
0.5 & 0.5 \\
0.5 & -0.5
\end{bmatrix}
$$

## FWT 的性质

FWT 是线性变换。

若 $FWT(X)$ 是 $X$ 的 FWT 变换，则有：

$$
FWT(A+B)=FWT(A)+FWT(B)
$$

以及：

$$
FWT(cA)=cFWT(A)
$$

这样就可以实现快速卷积，参考第四道例题。

## K 维 FWT

其实位运算的本质是对一个 $n$ 维 $\{0,1\}$ 向量的运算。或运算就是每一维取 $\max$。且运算就是每一维取 $\min$。异或运算则是每一维对应相加再 $\bmod 2$。

位运算有个特点：向量的每一位都是独立的。

我们把 $\{0,1\}$ 扩展到 $[0,K)\cap Z$ 也就是扩展到 $K$ 进制，看看会得到什么？

### max 运算

我们将 $\cup$ 运算拓展到 $K$ 进制，定义 $i\cup j$ 表示按位取 $\max$，有：

$$
c(i,j)c(i,k)=c(i,j\cup k)
$$

若 $j=k$，那么上式又是：

$$
c(i,j)c(i,j)=c(i,j)
$$

也就是说，每一行的 $1$ 必定只能在 $0$ 的前面，如果在后面则不合法了。手玩一下可以发现一组合法构造：

$$
\begin{bmatrix}
1 & 0 & 0 & 0 \\
1 & 1 & 0 & 0 \\
1 & 1 & 1 & 0 \\
1 & 1 & 1 & 1
\end{bmatrix}
$$

求逆可得：

$$
\begin{bmatrix}
1 & 0 & 0 & 0 \\
-1 & 1 & 0 & 0 \\
0 & -1 & 1 & 0 \\
0 & 0 & -1 & 1
\end{bmatrix}
$$

### min 运算

我们将 $\cap$ 运算拓展到 $K$ 进制，定义 $i\cap j$ 表示按位取 $\min$，有：

$$
c(i,j)c(i,k)=c(i,j\cap k)
$$

若 $j=k$，那么上式又是：

$$
c(i,j)c(i,j)=c(i,j)
$$

也就是说，每一行的 $1$ 必定只能在 $0$ 的后面，如果在前面则不合法了。手玩一下可以发现一组合法构造：

$$
\begin{bmatrix}
1 & 1 & 1 & 1 \\
0 & 1 & 1 & 1 \\
0 & 0 & 1 & 1 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

求逆可得：

$$
\begin{bmatrix}
1 & -1 & 0 & 0 \\
0 & 1 & -1 & 0 \\
0 & 0 & 1 & -1 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

前两者用得比较少，用得比较多的是：

### 不进位加法

我们将 $\oplus$ 运算拓展到 $K$ 进制，定义 $i\oplus j$ 表示按位相加再 $\bmod K$，有：

$$
c(i,j)c(i,k)=c(i,j\oplus k)
$$

我们构造 $c(i,j)=\omega_{K}^j$，就可以满足要求了：

$$
\omega_{K}^j\omega_{k}^k=\omega_{K}^{(j+k)\bmod K}
$$

但是每一行都一样矩阵也没有逆，所以我们可以构造 $c(i,j)=\omega_{K}^{(i-1)j}$ 即可。

有下面这个矩阵：

$$
\begin{bmatrix}
1 & 1 & 1 & \cdots & 1 \\
1 & \omega_{K}^1 & \omega_{K}^2 & \cdots & \omega_{K}^{k-1} \\
1 & \omega_{K}^2 & \omega_{K}^4 & \cdots & \omega_{K}^{2(k-1)} \\
1 & \omega_{K}^3 & \omega_{K}^6 & \cdots & \omega_{K}^{3(k-1)} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
1 & \omega_{K}^{k-1} & \omega_{K}^{2(k-1)} & \cdots & \omega_{K}^{k(k-1)}
\end{bmatrix}
$$

此即为 [范德蒙德矩阵](https://en.wikipedia.org/wiki/Vandermonde_matrix)，求逆可得：

$$
\frac{1}{K}\begin{bmatrix}
1 & 1 & 1 & \cdots & 1 \\
1 & \omega_{K}^{-1} & \omega_{K}^{-2} & \cdots & \omega_{K}^{-(k-1)} \\
1 & \omega_{K}^{-2} & \omega_{K}^{-4} & \cdots & \omega_{K}^{-2(k-1)} \\
1 & \omega_{K}^{-3} & \omega_{K}^{-6} & \cdots & \omega_{K}^{-3(k-1)} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
1 & \omega_{K}^{-(k-1)} & \omega_{K}^{-2(k-1)} & \cdots & \omega_{K}^{-k(k-1)}
\end{bmatrix}
$$

如果我们题目给出的模数是存在单位根的，我们就可以简单实现，可以参考第六道例题。

---

但是**单位根在模意义下可能不存在**，所以我们考虑扩域，就是人为地定义一个 $x$，满足 $x^K=1$，然后直接把 $x$ 代入计算，这样每个数都是一个关于 $x$ 的 $k-1$ 次多项式。我们只需要在 $\pmod {x^K-1}$ 下计算即可。那么矩阵可以这么表示：

$$
\begin{bmatrix}
1 & 1 & 1 & \cdots & 1 \\
1 & x^1 & x^2 & \cdots & x^{k-1} \\
1 & x^2 & x^4 & \cdots & x^{2(k-1)} \\
1 & x^3 & x^6 & \cdots & x^{3(k-1)} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
1 & x^{k-1} & x^{2(k-1)} & \cdots & x^{k(k-1)}
\end{bmatrix}
$$

但是这么做可能会存在零因子，也就是**一个数有多种表示方法**，我们无法确定一个数的真实值。

我们考虑不 $\pmod {x^K-1}$ 了，我们 $\bmod$ 分圆多项式 $\Phi_{K}(x)$，他满足 $x$ 的阶为 $k$，且在 $Q$ 上不可约。所以我们定义上面的计算是在 $\pmod {\Phi_{K}(x)}$ 下进行即可。

另一方面，如何求分圆多项式，这一点可以在[因式分解](https://www.luogu.com.cn/problem/P1520)这道题的题解区里了解。这里给出分圆多项式的表：

![](https://znpdco.github.io/blogimage/2024-05-07-FWT/cyclotomic.png)

还有一个问题是，$\bmod \Phi_{K}(x)$ 常数大（因为 $\Phi$ 本身就是一个多项式）。但是因为 $\Phi_{K}(x)\mid x^k-1$，我们只需要在计算时 $\bmod x^k -1$，最后再 $\bmod \Phi_{K}(x)$ 即可。

具体实现参考第七道例题。

## 例题

### [「洛谷 P4717」 【模板】快速莫比乌斯/沃尔什变换 (FMT/FWT)](https://www.luogu.com.cn/problem/P4717)

> 求 $\cup$、$\cap$、$\oplus$ 的三种卷积。
>
> $n\le17$

这题也就是模板题了，下文直接给出代码：

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define P 998244353
const ll N = 1 << 18;
ll n;
ll A[N], B[N];
ll a[N], b[N];
void init() {
	for(ll i = 0; i < n; i ++) a[i] = A[i], b[i] = B[i];
}
void Or(ll *a, ll type) {
	for(ll x = 2; x <= n; x <<= 1) {
		ll k = x >> 1;
		for(ll i = 0; i < n; i += x) {
			for(ll j = 0; j < k; j ++) {
				(a[i + j + k] += a[i + j] * type) %= P; 
			}
		}
	}
}
void And(ll *a, ll type) {
	for(ll x = 2; x <= n; x <<= 1) {
		ll k = x >> 1;
		for(ll i = 0; i < n; i += x) {
			for(ll j = 0; j < k; j ++) {
				(a[i + j] += a[i + j + k] * type) %= P; 
			}
		}
	}
}
void Xor(ll *a, ll type) {
	for(ll x = 2; x <= n; x <<= 1) {
		ll k = x >> 1;
		for(ll i = 0; i < n; i += x) {
			for(ll j = 0; j < k; j ++) {
				(a[i + j] += a[i + j + k]) %= P; 
				(a[i + j + k] = a[i + j] - a[i + j + k] * 2) %= P; 
				(a[i + j] *= type) %= P;
				(a[i + j + k] *= type) %= P;
			}
		}
	}
}
void calc() {
	for(ll i = 0; i < n; i ++) (a[i] *= b[i]) %= P;
}
void print() {
	for(ll i = 0; i < n; i ++) printf("%lld ", (a[i] % P + P) % P);
	printf("\n");
}
int main() {
	scanf("%lld", &n);
	n = 1 << n;
	for(ll i = 0; i < n; i ++) scanf("%lld", &A[i]);
	for(ll i = 0; i < n; i ++) scanf("%lld", &B[i]);
	
	init(); Or(a, 1); Or(b, 1); calc(); Or(a, P - 1); print();
	init(); And(a, 1); And(b, 1); calc(); And(a, P - 1); print();
	init(); Xor(a, 1); Xor(b, 1); calc(); Xor(a, 499122177); print();
}
```

### [「洛谷 P6097」 【模板】子集卷积](https://www.luogu.com.cn/problem/P6097)

> 求：
>
> $$
> c_k=\sum_{\substack{ {i \cap j=0}\\{i\cup j=k}}} a_i b_j
> $$
> 
> $n\le20$

首先，下半部分是我们喜闻乐见的 FWT 常见形式，而上半部分我们可以看成是 $i$ 与 $j$ 不交。有：

$$
i\cup j=0\Rightarrow \text{popcnt}(i)+\text{popcnt}(j)=\text{popcnt}(i\cup j)
$$

所以我们可以构造：

$$
A_{i,k}=\sum_{\substack{ {i\cup j=i}\\{\text{popcnt}(j)=k}}} a_j
$$

可以枚举 $\text{popcnt}$ 的值，分开考虑。

那么求 $C$ 的时候有 $C_{i,k}=\sum_{j=0}^n A_{i,j}B_{i,k-j}$。

然后就可以做了。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define popcnt(x) __builtin_popcountll(x)
#define ll long long
const ll M = 20, N = 1 << M, P = 1e9 + 9;
ll n, m;
ll a[M + 1][N], b[M + 1][N], c[M + 1][N];
void Or(ll *a, ll type) {
	for(ll x = 2; x <= n; x <<= 1) {
		ll k = x >> 1;
		for(ll i = 0; i < n; i += x) {
			for(ll j = 0; j < k; j ++) {
				(a[i + j + k] += a[i + j] * type) %= P;
			}
		}
	}
}
int main() {
	scanf("%lld" ,&m);
	n = 1 << m;
	for(ll i = 0; i < n; i ++) {
		scanf("%lld", &a[popcnt(i)][i]);
	}
	for(ll i = 0; i < n; i ++) {
		scanf("%lld", &b[popcnt(i)][i]);
	}
	for(ll i = 0; i <= m; i ++) {
		Or(a[i], 1);
		Or(b[i], 1);
	}
	for(ll i = 0; i <= m; i ++) {
		for(ll j = 0; j <= i; j ++) {
			for(ll k = 0; k < n; k ++) {
				(c[i][k] += a[j][k] * b[i - j][k]) %= P;
			}
		}
	}
	for(ll i = 0; i <= m; i ++) {
		Or(c[i], -1);
	}
	for(ll i = 0; i < n; i ++) {
		printf("%lld ", (c[popcnt(i)][i] % P + P) % P);
	}
}
```

### [「牛客 881D」Parity of Tuples](https://ac.nowcoder.com/acm/contest/881/D)

> 给定 $n\times m$ 的矩阵 $a$，定义 $\text{cnt}(x)$ 为矩阵中有多少行对于 $x$ 是合法的，合法的定义为这一行中每一个数 $a_{i,j}\cap x$ 的二进制值中**都有**奇数个 $1$。
>
> 你需要求出对于所有的 $x$，$\text{cnt}$ 的取值。
>
> $n\le10^5,m\le10,x\le2^{20}$

再次重申，$\cap$ 是按位与的意思。

首先我们用数学公式定义一下 $\text{cnt}$（因为公式复杂，所以加了 $\tt large$）：

$$
\large \text{cnt}(x)=\frac{1}{2^m}\sum_{i=1}^n\prod_{j=1}^m (1-(-1)^{\text{popcnt}(a_{i,j}\cap x)})
$$

说明一下正确性。如果 $\text{popcnt}(a_{i,j}\cap x)$ 是奇数的话，那么 $(-1)^{\text{popcnt}(a_{i,j}\cap x)}$ 的结果就是 $-1$。最后 $1-(-1)^{\text{popcnt}(a_{i,j}\cap x)}$ 就是 $2$，最后会被 $\frac{1}{2^m}$ 除去；如果 $\text{popcnt}(a_{i,j}\cap x)$ 是偶数的话，那么 $(-1)^{\text{popcnt}(a_{i,j}\cap x)}$ 的结果就是 $1$。最后 $1-(-1)^{\text{popcnt}(a_{i,j}\cap x)}$ 就是 $0$，那么整行的结果都是 $0$。

然后我们发现它是可以展开的：

$$
\large \begin{aligned}
\prod_{j=1}^m (1-(-1)^{\text{popcnt}(a_{i,j}\cap x)}) &= (1-(-1)^{\text{popcnt}(a_{i,1}\cap x)})(1-(-1)^{\text{popcnt}(a_{i,2}\cap x)})\cdots(1-(-1)^{\text{popcnt}(a_{i,m}\cap x)}) \\
&= 1 - \sum_{a=1}^m (-1)^{\text{popcnt}(a_{i,a}\cap x)} + \sum_{a=1}^m\sum_{b=a+1}^m (-1)^{\text{popcnt}(a_{i,a}\cap x)+\text{popcnt}(a_{i,b}\cap x)} - \\
& \sum_{a=1}^m\sum_{b=a+1}^m\sum_{c=b+1}^m (-1)^{\text{popcnt}(a_{i,a}\cap x)+\text{popcnt}(a_{i,b}\cap x)+\text{popcnt}(a_{i,c}\cap x)} + \cdots
\end{aligned}
$$

然后我们有一个性质：

$$
\large (-1)^{\sum_{i=1}^n\text{popcnt}(a_i\cap x)}=(-1)^{\text{popcnt}((\oplus_{i=1}^na_i)\cap x)}
$$

也就是 $\sum_{i=1}^n\text{popcnt}(a_i\cap x)$ 的奇偶性与 $\text{popcnt}((\oplus_{i=1}^na_i)\cap x)$ 的相同。这点在上面的新的运算符 $\circ$ 的性质中有类似的体现。

容易得到：

$$
\large\begin{aligned}
&=1 - \sum_{a=1}^m (-1)^{\text{popcnt}(a_{i,a}\cap x)} + \sum_{a=1}^m\sum_{b=a+1}^m (-1)^{\text{popcnt}(a_{i,a}\cap x)+\text{popcnt}(a_{i,b}\cap x)} - \\
& \sum_{a=1}^m\sum_{b=a+1}^m\sum_{c=b+1}^m (-1)^{\text{popcnt}(a_{i,a}\cap x)+\text{popcnt}(a_{i,b}\cap x)+\text{popcnt}(a_{i,c}\cap x)} + \cdots \\
&=1 - \sum_{a=1}^m (-1)^{\text{popcnt}(a_{i,a}\cap x)} + \sum_{a=1}^m\sum_{b=a+1}^m (-1)^{\text{popcnt}((a_{i,a}\oplus a_{i,b})\cap x)} - \\
& \sum_{a=1}^m\sum_{b=a+1}^m\sum_{c=b+1}^m (-1)^{\text{popcnt}((a_{i,a}\oplus a_{i,b}\oplus a_{i,c})\cap x)} + \cdots \\
\end{aligned}
$$

我们发现一加一减的可以容斥，我们容斥计算 $f_i$ 表示 $n$ 行的所有式子中 $(-1)^i$ 前面的系数和。

```cpp
// num 处理到第几列
// x 当前的指数
// mu 当前的系数（+1 or -1）
void dfs(ll *a, ll num, ll x, ll mu) {
	if(num > m) {
		f[x] += mu;
		return;
	}
	dfs(a, num + 1, x, mu);	// 不加入第 num 列，系数不变
	dfs(a, num + 1, x ^ a[num], -mu);
}
```

这样我们就可以进一步化简：

$$
\begin{aligned}
&= \sum_{i=0}^{2^k-1} f_{x\cap i}(-1)^{x\cap i}
\end{aligned}
$$

我们突然发现后面这个 $(-1)^i$ 取值只有两种，当 $x\cap i$ 是奇数时取值为 $-1$，否则为 $1$。

好了，现在我们的问题转换为了求出：

$$
\sum_{\text{popcnt}(x\cap i)\bmod2=0} f_i-\sum_{\text{popcnt}(x\cap i)\bmod2=1} f_i
$$

这不就是 FWT 中的异或变换吗：

$$
A_i=\sum_{i\circ j=0}a_j-\sum_{i\circ j=1}a_j
$$

综上，我们发现这题就是推式子容斥之后得到 FWT 的形式。

---

原题需要将输出加密：

$$
\bigoplus\limits_{x = 0}^{2^k - 1} (\text{cnt}(x) \times 3^x \bmod (10^9 + 7))
$$

```cpp
#include <bits/stdc++.h>
#define ll long long
using namespace std;
const ll P = 1e9 + 7;
#define N 100010
#define M 20
#define K 21
ll n, m, k;
ll f[1 << K];
ll a[N][M];
// num 处理到第几列
// x 当前的指数
// mu 当前的系数（+1 or -1）
void dfs(ll *a, ll num, ll x, ll mu) {
	if(num > m) {
		f[x] += mu;
		return;
	}
	dfs(a, num + 1, x, mu);	// 不加入第 num 列，系数不变
	dfs(a, num + 1, x ^ a[num], -mu);
}
void Xor(ll *a, ll type) {
	for(ll x = 2; x <= (1 << k); x <<= 1) {
		ll z = x >> 1;
		for(ll i = 0; i < (1 << k); i += x) {
			for(ll j = 0; j < z; j ++) {
				(a[i + j] += a[i + j + z]) %= P;
				(a[i + j + z] = a[i + j] - 2 * a[i + j + z]) %= P;
				(a[i + j] *= type) %= P;
				(a[i + j + z] *= type) %= P;
			}
		}
	}
}
ll qpow(ll x, ll y) {
	if(y == 0) return 1;
	if(y % 2 == 1) return x * qpow(x, y - 1) % P;
	ll tmp = qpow(x, y / 2);
	return tmp * tmp % P;
}
int main() {
	while(scanf("%lld %lld %lld", &n, &m, &k) != EOF) {
		for(ll i = 0; i < (1 << k); i ++) f[i] = 0;
		for(ll i = 1; i <= n; i ++) {
			for(ll j = 1; j <= m; j ++) {
				scanf("%lld", &a[i][j]);
			}
			dfs(a[i], 1, 0, 1);
		}
		Xor(f, 1);
		ll pw = 1, inv = qpow(1 << m, P - 2), ans = 0;
		for(ll i = 0; i < (1 << k); i ++) {
			ans ^= f[i] * pw % P * inv % P;
			(pw *= 3) %= P;
		}
		printf("%lld\n", ans);
	}
}
```

### [「AT ABC212H」 Nim Counting](https://atcoder.jp/contests/abc212/tasks/abc212_h)

> 给定两个数 $N,K$，以及一个长度为 $K$ 的整数数组 $(A_1,A_2,\cdots, A_K)$。
>
> 两个人玩 Nim 游戏。
>
> 现在通过以下方式生成一个游戏：
>
> > 任意选择一个 $1\le M\le N$，$M$ 表示石子堆数。
> >
> > 对于每一堆，其石子数是 $A$ 中任意一个数。
>
> 对于 $\sum_{i=1}^N K^i$ 种游戏，求先手获胜的游戏数，答案对 $998244353$ 取模。
>
> $n\le2\times10^5,K\le2^{16},a_i\le2^{16}$

根据玩 Nim 游戏的经验，可以发现先手获胜当且仅当 $\bigoplus_{i=0}^n A_i\neq 0$。

所以我们定义 dp 式子 $f_{i,j}$ 表示有 $i$ 个石堆，且石堆异或和为 $j$ 的获胜方案数，有：

$$
f_{i-1,j}\to \sum_{k=1}^Kf_{i,j\oplus a_k}
$$

答案就是 $\sum_{i=1}^n\sum_{j\neq0} f_{i,j}$。

直接转移是朴素的，发现上面的式子刚好是 FWT 异或操作，也就是：

$$
f_{i,j}=\sum_{k\oplus x=j} f_{i-1,k}a_x
$$

我们定义 $a$ 是一个全是 $1$ 的数组即可。

同时，我们发现其实不需要真的进行 $n$ 次卷积，其实只需要将 FWT 变换过之后的结果 $A$，求出 $A+A^2+A^3+\cdots+A^n$ 即可。

上面的可以通过等比数列求和公式计算。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define P 998244353
const ll K = 1 << 20; 
ll n, k, ans;
ll f[K];
void FWT(ll *a, ll type) {
	for(ll x = 2; x <= K; x <<= 1) {
		ll k = x >> 1;
		for(ll i = 0; i < K; i += x) {
			for(ll j = 0; j < k; j ++) {
				(a[i + j] += a[i + j + k]) %= P;
				(a[i + j + k] = a[i + j] - 2 * a[i + j + k]) %= P;
				(a[i + j] *= type) %= P;
				(a[i + j + k] *= type) %= P;
			}
		}
	}
}
ll qpow(ll x, ll y) {
	if(y == 0) return 1;
	if(y % 2 == 1) return x * qpow(x, y - 1) % P;
	ll tmp = qpow(x, y / 2);
	return tmp * tmp % P;
}
int main() {
	scanf("%lld %lld", &n, &k);
	for(ll i = 1; i <= k; i ++) {
		ll x;
		scanf("%lld", &x);
		f[x] ++;
	}
	FWT(f, 1);
	for(ll i = 0; i < K; i ++) {
		if(f[i] == 1) f[i] = n;
		else {
			f[i] = f[i] * (qpow(f[i], n) - 1) % P * qpow(f[i] - 1, P - 2) % P;
		}
	}
	FWT(f, 499122177);
	for(ll i = 1; i < K; i ++) {
		(ans += f[i]) %= P;
	}
	printf("%lld", (ans % P + P) % P);
}
```

### [「AT ARC100E」 Or Plus Max](https://atcoder.jp/contests/arc100/tasks/arc100_c)

> 给你一个长度为 $2^n$ 的序列 $a$，每个$1\le K\le 2^n-1$，找出最大的 $a_i+a_j$（$i \cup j \le K$，$0 \le i < j < 2^n$）并输出。
>
> $n\le18$

就是要求 $\max_{i\cup j=k} a_i+a_j$。

我们维护 $f_{i}$ 表示 $\max_{i\cup j=i} a_i$，$g_i=\text{max2}_{i\cup j=i} a_i$，$\text{max2}$ 表示次大值。

然后就像 FWT 的或变换一样了。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll long long
const ll N = 1 << 18;
ll n;
struct node {
	ll mx1, mx2;
	node(ll a = 0, ll b = 0):mx1(a), mx2(b) {}
	friend node operator +(const node &x, const node &y) {
		if(x.mx1 > y.mx1) {
			return node(x.mx1, max(x.mx2, y.mx1));
		}
		return node(y.mx1, max(y.mx2, x.mx1));
	}
} a[N];
void FWT(node *a) {
	for(ll x = 2; x <= n; x <<= 1) {
		ll k = x >> 1;
		for(ll i = 0; i < n; i += x) {
			for(ll j = 0; j < k; j ++) {
				a[i + j + k] = a[i + j] + a[i + j + k];
			}
		}
	}
}
int main() {
	scanf("%lld", &n);
	n = 1 << n;
	for(ll i = 0; i < n; i ++) {
		scanf("%lld", &a[i].mx1);
	}
	FWT(a);
	for(ll i = 0; i < n; i ++) {
		a[i].mx1 = a[i].mx1 + a[i].mx2;
	}
	ll ans = 0;
	for(ll i = 1; i < n; i ++) {
		ans = max(ans, a[i].mx1);
		printf("%lld\n", ans);
	}
}
```

### [「HDU 6618」 Good Numbers](https://acm.hdu.edu.cn/showproblem.php?pid=6618)

> 定义一个正整数 $n$ 是好数当且仅当 $n$ 在 8 进制表示下所有的数码出现的次数为 3 的倍数（出现 0 次亦可）。
>
> 有多少个 $k$ 位的 8 进制数（不含前导 0），满足这个数是好的，且是 $p$ 的倍数。对 $10^9+9$ 取模。
>
> 例如：当 $k=3,p=2$ 时，好数有 $222,444,666$ 三个。
>
> $k\le10^{18},p<8$

考虑状压 dp，设 $f_{i,s,j}$ 表示第 $i$ 位，$8$ 种数出现次数对 $3$ 取模的状压情况，以及数对 $p$ 取模的结果为 $j$。

答案就是 $f_{k,0,0}$。

直接暴力枚举位数转移是朴素的，瓶颈在于 $k$，考虑优化掉 $k$。

发现我们可以使用像快速幂一样的方法，也就是倍增 dp。

转移公式就是：

$$
f_{2i,s_1\oplus s_2,j_1+t\times j_2}\gets f_{i,s_1,j_1}f_{i,s_2,j_2}
$$

其中 $t$ 是转移的位数，而 $\oplus$ 在这里是不进位三进制加法。

发现这样多了瓶颈——我们需要枚举 $s_1$ 和 $s_2$。

但是我们发现这不就是 FWT 中异或的形式吗：$c_{i\oplus j}\gets a_ib_j$。考虑三进制 FWT 加速。下面给出 FWT 的代码，`w1` 是原根的一次方，`w2` 是原根的二次方：

```cpp
void FWT(ll *a, ll type) {
	for (ll x = 3; x <= N; x *= 3) {
		ll k = x / 3;
		for (ll i = 0; i < N; i += x) {
			for (ll j = 0; j < k; j ++) {
				for (ll l = 0; l < 3; l++) tmp1[l] = a[i + j + l * k];
				if (type == 1) {
					tmp2[0] = (tmp1[0] + tmp1[1] + tmp1[2]) % P;
					tmp2[1] = (tmp1[0] + tmp1[1] * w1 + tmp1[2] * w2) % P;
					tmp2[2] = (tmp1[0] + tmp1[1] * w2 + tmp1[2] * w1) % P;
				} else {
					tmp2[0] = (tmp1[0] + tmp1[1] + tmp1[2]) % P;
					tmp2[1] = (tmp1[0] + tmp1[1] * w2 + tmp1[2] * w1) % P;
					tmp2[2] = (tmp1[0] + tmp1[1] * w1 + tmp1[2] * w2) % P;
					for (ll l = 0; l < 3; l++) (tmp2[l] *= inv3) %= P;
				}
				for (ll l = 0; l < 3; l++) a[i + j + l * k] = tmp2[l];
			}
		}
	}
}
```

因为 $1e9+9$ 存在原根 $2$，然后就朴素实现了，注意位矩阵：
$$
\begin{bmatrix}
1 & 1 & 1 \\
1 & \omega_{3}^1 & \omega_{3}^2 \\
1 & \omega_{3}^2 & \omega_{3}^4 \\
\end{bmatrix}
$$
代码：

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll long long
const ll P = 1e9 + 9;
ll qpow(ll x, ll y) {
	if(y == 0) return 1;
	if(y % 2 == 1) return x * qpow(x, y - 1) % P;
	ll tmp = qpow(x, y / 2);
	return tmp * tmp % P; 
}
const ll G = 2;
const ll w1 = qpow(G, (P - 1) / 3);
const ll w2 = qpow(G, (P - 1) / 3 * 2);
const ll inv3 = qpow(3, P - 2);
const ll N = 3 * 3 * 3 * 3 * 3 * 3 * 3 * 3;
ll n, p;
ll tmp[8][N], res[8][N], one[8][N];
ll a[8][N], b[8][N];
ll pw3[8];
ll tmp1[3], tmp2[3];
void FWT(ll *a, ll type) {
	for (ll x = 3; x <= N; x *= 3) {
		ll k = x / 3;
		for (ll i = 0; i < N; i += x) {
			for (ll j = 0; j < k; j ++) {
				for (ll l = 0; l < 3; l++) tmp1[l] = a[i + j + l * k];
				if (type == 1) {
					tmp2[0] = (tmp1[0] + tmp1[1] + tmp1[2]) % P;
					tmp2[1] = (tmp1[0] + tmp1[1] * w1 + tmp1[2] * w2) % P;
					tmp2[2] = (tmp1[0] + tmp1[1] * w2 + tmp1[2] * w1) % P;
				} else {
					tmp2[0] = (tmp1[0] + tmp1[1] + tmp1[2]) % P;
					tmp2[1] = (tmp1[0] + tmp1[1] * w2 + tmp1[2] * w1) % P;
					tmp2[2] = (tmp1[0] + tmp1[1] * w1 + tmp1[2] * w2) % P;
					for (ll l = 0; l < 3; l++) (tmp2[l] *= inv3) %= P;
				}
				for (ll l = 0; l < 3; l++) a[i + j + l * k] = tmp2[l];
			}
		}
	}
}
ll base = 1;
void fun(ll x) {
	if(x == 1) {
		memset(res, 0, sizeof res);
		memset(tmp, 0, sizeof tmp);
		memset(one, 0, sizeof one);
		for(ll i = 1; i < 8; i ++) res[i % p][pw3[i]] = 1;
		for(ll i = 0; i < 8; i ++) tmp[i % p][pw3[i]] = 1;
		for(ll i = 0; i < 8; i ++) one[i % p][pw3[i]] = 1;
		for (int i = 0; i < p; i ++) {
			FWT(tmp[i], 1);
			FWT(res[i], 1);
			FWT(one[i], 1);
		}
		base = 8 % p;
		return;
	}
	if(x % 2 == 1) {
		fun(x - 1);
		memset(a, 0, sizeof a);
		memset(b, 0, sizeof b);
		for (ll i = 0; i < p; i ++) {
			for (ll j = 0; j < p; j ++) {
				ll k = (i * 8 + j) % p;
				for (ll x = 0; x < N; x ++)
					(a[k][x] += tmp[i][x] * one[j][x]) %= P,
					(b[k][x] += res[i][x] * one[j][x]) %= P;
			}
		}
		memcpy(tmp, a, sizeof a);
		memcpy(res, b, sizeof b);
		(base *= 8) %= P;
		return;
	}
	fun(x / 2);
	memset(a, 0, sizeof a);
	memset(b, 0, sizeof b);
	for (ll i = 0; i < p; i ++) {
		for (ll j = 0; j < p; j ++) {
			ll k = (i * base + j) % p;
			for (ll x = 0; x < N; x ++)
				(a[k][x] += tmp[i][x] * tmp[j][x]) %= P,
				(b[k][x] += res[i][x] * tmp[j][x]) %= P;
		}
	}
	memcpy(tmp, a, sizeof a);
	memcpy(res, b, sizeof b);
	(base *= base) %= p;
}
int main() {
	pw3[0] = 1;
	for(ll i = 1; i <= 8; i ++) {
		pw3[i] = pw3[i - 1] * 3;
	}
	while(scanf("%lld %lld", &n, &p) != EOF) {
		fun(n);
		FWT(res[0], -1);
		printf("%lld\n", res[0][0]);
	}
}
```

### [「CF 1103E」Radix sum](https://www.luogu.com.cn/problem/CF1103E)

> 给定一个长度为 $n$ 的序列 $a_1,a_2,...,a_n$，对于每一个 $p \in [0,n-1]$，求满足下列条件的整数序列 $i_1,i_2,...,i_n$ 的方案数，对 $2^{58}$ 取模：
>
> - $\forall j \in [1,n] , i_j \in [1,n]$；
> - $\sum\limits_{j=1}^n a_{i_j} = p$，这里的加法定义为十进制不进位加法。
>
> $n\le10^5,a_i\le10^5$

我们可以想到 dp：设计状态 $f_{i,s}$ 表示考虑到第 $i$ 个数，当前加法状态为 $s$。因为 FWT 变换是线性的，可以先变换为 FWT 点值表示法，然后变成自己的 $n$ 次幂，最后再变换回来。

上面是平凡的，但是题目给出了模数 $2^{58}$。发现没有单位根，所以考虑扩域。

这里的分圆多项式 $\Phi_{10}(x)=x^4-x^3+x^2-x+1$。

然而我们发现 IFWT 时，需要除去进制 $10$，然而我们发现 $10$ 在 $2^{58}$ 下没有逆元。实际上我们发现 $5$ 在 $2^{58}$ 下是有逆元的：$57646075230342349$，我们只需要再除去一个 $2$ 就可以了。设已经除以了 $5$ 的答案为 $x$，真正的答案为 $y$，也就是 $2^5y\equiv x\pmod{2^{64}}$，显然，我们有 $y\equiv \frac{x}{2^5}\pmod{2^{64-5}}$，也就是 $y\equiv \frac{x}{2^5}\pmod{2^{59}}$，所以直接将最后的答案除以 $2^5$ 即可。虽然出题人不知道为什么要模 $2^{58}$，但再取下模即可。

然后就是平凡实现了：

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll unsigned long long
const ll P = 1ull << 58, N = 1e5 + 10;
const ll m = 5, K = 10;
ll inv5;
ll n;
ll pw[m + 1];
ll qpow(ll x, ll y) {
	if(y == 0) return 1;
	if(y % 2 == 1) return x * qpow(x, y - 1);
	ll tmp = qpow(x, y / 2);
	return tmp * tmp;
}
struct poly {
	ll a[30];
	poly() {memset(a, 0, sizeof a);}
	ll operator [](ll x) const {return a[x];}
	ll& operator [](ll x) {return a[x];}
	friend poly operator *(const poly &x, const poly &y) {
		poly z;
		for(ll i = 0; i < K; i ++) {
			for(ll j = 0; j < K; j ++) {
				z[(i + j) % K] += x[i] * y[j];
			}
		}
		return z;
	}
	friend poly operator *(const poly &x, const ll &y) {
		poly z;
		for(ll i = 0; i < K; i ++) {
			z[i] += x[i] * y;
		}
		return z;
	}
	friend poly operator +(const poly &x, const poly &y) {
		poly z;
		for(ll i = 0; i < K; i ++) {
			z[i] += x[i] + y[i];
		}
		return z;
	}
	poly w(ll x) {
		poly res;
		for(ll i = 0; i < K; i ++) {
			res[(i + x) % K] += a[i];
		}
		return res;
	}
} T, f[N], one;
poly qpow(poly x, ll y) {
	if(y == 0) return one;
	if(y % 2 == 1) return x * qpow(x, y - 1);
	poly tmp = qpow(x, y / 2);
	return tmp * tmp;
}
poly tmp1[30], tmp2[30];
void FWT(poly *a, ll type) {
	for(ll x = K; x <= pw[m]; x *= K) {
		ll k = x / K;
		for(ll i = 0; i < pw[m]; i += x) {
			for(ll j = 0; j < k; j ++) {
				for(ll l = 0; l < K; l ++) tmp1[l] = a[i + j + l * k], tmp2[l] = poly();
				if(type == 1) {
					for(ll l = 0; l < K; l ++) {
						for(ll v = 0; v < K; v ++) {
							tmp2[l] = tmp2[l] + tmp1[v].w(l * v % K);
						}
					}
					for(ll l = 0; l < K; l ++) a[i + j + l * k] = tmp2[l];
				} else {
					for(ll l = 0; l < K; l ++) {
						for(ll v = 0; v < K; v ++) {
							tmp2[l] = tmp2[l] + tmp1[v].w((K - (l * v % K)) % K);
						}
					}
					for(ll l = 0; l < K; l ++) a[i + j + l * k] = tmp2[l] * inv5;
				}
			}
		}
	}
}
ll mod(poly x){
	ll n = 4;
	for(ll i = K - 1; i >= n; i --){
		ll u = x[i];
		for(ll j = 1; j <= n; j ++) x[i - j] -= u * T[n - j];
	}
	ll u = x[0];
	u >>= m;
	return u % P;
}
int main() {
	pw[0] = 1;
	for(ll i = 1; i <= m; i ++) pw[i] = pw[i - 1] * K;
	T[0] = 1, T[1] = -1, T[2] = 1, T[3] = -1, T[4] = 1;	// 分圆多项式phi10
	one[0] = 1;
	inv5 = 57646075230342349ull;
	scanf("%llu", &n);
	for(ll i = 1; i <= n; i ++) {
		ll x;
		scanf("%llu", &x);
		f[x][0] ++;
	}
	FWT(f, 1);
	for(ll i = 0; i < pw[m]; i ++) f[i] = qpow(f[i], n);
	FWT(f, -1);
	for(ll i = 0; i < n; i ++) cout<<mod(f[i])<<'\n';
}
```

### [「洛谷 P10890」【烂题杯 Round 1】可持久化糖果树](https://www.luogu.com.cn/problem/P10890)

> 给出 $n$ 个 $k$  维向量 $m$ 元组，$q$ 次询问，每次询问也给出一个 $k$ 维向量 $v$，求多少个 $m$ 元组满足其中任何一个向量与 $v$ 点积为 $0$，所有向量间的运算都在模 $3$ 意义下进行。
>
> - $1\le n\le 10^5$，$1\le m\le 4$，$1\le k\le 12$，$0\le q\le 10^6$

所有 $a_{i,j,x}$ 和 $z$ 都可以对 $3$ 取模，所以可以将 $a_{i,j}$ 表示为 $k$ 位的三进制，为了方便，以下所有的运算都是在三进制下进行的。

我们定义 $a\cap b$ 表示在三进制下不进位按位乘，$|x|$ 表示 $x$ 在三进制下的数位和，那么容易发现答案就是以下的式子：
$$
\frac{1}{(\omega_3^1-1)^m(\omega_3^2-1)^m}\sum_{i=1}^n\prod_{j=1}^m (\omega_3^1-\omega_3^{|a_{i,j}\cap x|})(\omega_3^2-\omega_3^{|a_{i,j}\cap x|})
$$
说明一下正确性，容易发现 $\omega_3$ 以 $3$ 为循环，那么当 $|a_{i,j}\cap x|$ 为 $1$ 或 $2$ 时，都会被 $\omega_3^1$ 或 $\omega_3^2$ 减去，只要这 $m$ 项中有任何一项 $|a_{i,j}\cap x|$ 为 $1$ 或 $2$，那么这个式子就是 $0$。当 $|a_{i,j}\cap x|=0$ 时，式子就是 $(\omega_3^1-1)^m(\omega_3^2-1)^m$，我们在前面除去就好了。

我们推一下里面的式子：
$$
\begin{aligned}
& \prod_{j=1}^m (\omega_3^1-\omega_3^{|a_{i,j}\cap x|})(\omega_3^2-\omega_3^{|a_{i,j}\cap x|}) \\
=& (\omega_3^1-\omega_3^{|a_{i,1}\cap x|})\cdots(\omega_3^1-\omega_3^{|a_{i,m}\cap x|})(\omega_3^2-\omega_3^{|a_{i,1}\cap x|})\cdots(\omega_3^2-\omega_3^{|a_{i,m}\cap x|}) \\
=& (\omega_3^1)^m-(\omega_3^1)^{m-1}\sum_{j=1}^m\omega_3^{|a_{i,j}\cap x|}+(\omega_3^1)^{m-2}\sum_{j=1}^m\sum_{k=j+1}^m\omega_3^{|a_{i,j}\cap x|+|a_{i,k}\cap x|}-\cdots+\\
& (\omega_3^2)^m-(\omega_3^2)^{m-1}\sum_{j=1}^m\omega_3^{|a_{i,j}\cap x|}+ (\omega_3^2)^{m-2}\sum_{j=1}^m\sum_{k=j+1}^m\omega_3^{|a_{i,j}\cap x|+|a_{i,k}\cap x|}-\cdots \\
\end{aligned}
$$

可以通过简单的分类讨论发现有：
$$
\large \omega_3^{\sum_{i=1}^n|a_i\cap x|}=\omega_3^{|(\oplus_{i=1}^na_i)\cap x|}
$$

这里我们不予证明。

那么：
$$
\begin{aligned}
& (\omega_3^1)^m-(\omega_3^1)^{m-1}\sum_{j=1}^m\omega_3^{|a_{i,j}\cap x|}+(\omega_3^1)^{m-2}\sum_{j=1}^m\sum_{k=j+1}^m\omega_3^{|a_{i,j}\cap x|+|a_{i,k}\cap x|}-\cdots+\\
& (\omega_3^2)^m-(\omega_3^2)^{m-1}\sum_{j=1}^m\omega_3^{|a_{i,j}\cap x|}+ (\omega_3^2)^{m-2}\sum_{j=1}^m\sum_{k=j+1}^m\omega_3^{|a_{i,j}\cap x|+|a_{i,k}\cap x|}-\cdots \\
&= (\omega_3^1)^m-(\omega_3^1)^{m-1}\sum_{j=1}^m\omega_3^{|a_{i,j}\cap x|}+(\omega_3^1)^{m-2}\sum_{j=1}^m\sum_{k=j+1}^m\omega_3^{|(a_{i,j}\oplus a_{i,k})\cap x|}-\cdots+\\
& (\omega_3^2)^m-(\omega_3^2)^{m-1}\sum_{j=1}^m\omega_3^{|a_{i,j}\cap x|}+ (\omega_3^2)^{m-2}\sum_{j=1}^m\sum_{k=j+1}^m\omega_3^{|(a_{i,j}\oplus a_{i,k})\cap x|}-\cdots \\
\end{aligned}
$$
我们对指数与 $sum$ 有关的式子进行容斥，设 $f_i$ 表示指数为 $|i\cap x|$ 的数的系数，那么容易有：
$$
\begin{aligned}
& (\omega_3^1)^m-(\omega_3^1)^{m-1}\sum_{j=1}^m\omega_3^{|a_{i,j}\cap x|}+(\omega_3^1)^{m-2}\sum_{j=1}^m\sum_{k=j+1}^m\omega_3^{|(a_{i,j}\oplus a_{i,k})\cap x|}-\cdots+\\
& (\omega_3^2)^m-(\omega_3^2)^{m-1}\sum_{j=1}^m\omega_3^{|a_{i,j}\cap x|}+ (\omega_3^2)^{m-2}\sum_{j=1}^m\sum_{k=j+1}^m\omega_3^{|(a_{i,j}\oplus a_{i,k})\cap x|}-\cdots \\
=& \sum \omega_3^{|i\cap x|}f_{i} \\
=& \sum_{|i\cap x|=0} f_{i}+\sum_{|i\cap x|=1} \omega_3^1f_{i}+\sum_{|i\cap x|=2} \omega_3^2f_{i}
\end{aligned}
$$
现在发现它具有 FWT 的样子，我们考虑 3-FWT 的实际意义：

定义 $A_i=\sum_{|i\cap j|=0} a_j+\sum_{|i\cap j|=1} \omega_3^1a_j+\sum_{|i\cap j|=2} \omega_3^2a_j$，容易证明 $A_iB_i=C_i$：
$$
\begin{aligned}
A_iB_i&=(\sum_{|i\cap j|=0} a_j+\sum_{|i\cap j|=1} \omega_3^1a_j+\sum_{|i\cap j|=2} \omega_3^2a_j)(\sum_{|i\cap k|=0} b_k+\sum_{|i\cap k|=1} \omega_3^1b_k+\sum_{|i\cap k|=2} \omega_3^2b_k) \\
&=(\sum_{|i\cap j|=0}\sum_{|i\cap k|=0} a_{j}b_{k}+\sum_{|i\cap j|=1}\sum_{|j\cap k|=2} a_jb_k+\sum_{|i\cap j|=2}\sum_{|j\cap k|=1} a_{j}b_k)+ \\
& \omega_3^1(\sum_{|i\cap j|=0}\sum_{|i\cap k|=1} a_{j}b_{k}+\sum_{|i\cap j|=1}\sum_{|j\cap k|=0} a_jb_k+\sum_{|i\cap j|=2}\sum_{|j\cap k|=2} a_{j}b_k)+ \\
& \omega_3^2(\sum_{|i\cap j|=0}\sum_{|i\cap k|=2} a_{j}b_{k}+\sum_{|i\cap j|=1}\sum_{|j\cap k|=1} a_jb_k+\sum_{|i\cap j|=2}\sum_{|j\cap k|=0} a_{j}b_k) \\
&=\sum_{|(j\oplus k)\cap i|=0}a_jb_k+\sum_{|(j\oplus k)\cap i|=1}\omega_3^1a_jb_k+\sum_{|(j\oplus k)\cap i|=2}\omega_3^2a_jb_k \\
&=C_i
\end{aligned}
$$
考虑快速计算 $A_i$，使用分治，假设当前考虑到第 $x$ 位，如果这一位是 $0$，有 $0\cap0=0\cap1=0\cap2=0$；如果这一位是 $1$，有 $1\cap0=0，1\cap1=1，1\cap2=2$；如果这一位是 $2$，有 $2\cap0=0,2\cap1=2,2\cap2=1$。

类似 FWT 地，有：
$$
A_i=merge(A_0+A_1+A_2,A_0+\omega_3^1A_1+\omega_3^2A_2,A_0+\omega_3^2A_1+\omega_3^1A_2)
$$
同理地得出位矩阵：
$$
\begin{bmatrix}
1 & 1 & 1 \\
1 & \omega_{3}^1 & \omega_{3}^2 \\
1 & \omega_{3}^2 & \omega_{3}^4 \\
\end{bmatrix}
$$
这就是 3-FWT 的转移位矩阵，所以我们只需要对容斥后的 $f$ 计算一次 3-FWT 就可以得出答案了。

可持久化容易实现，这里不予说明。

注意到在 $10^9+9$ 下 $3$ 具有单位根，所以我们在 $10^9+9$ 意义下计算就好了。

时间复杂度由容斥与 3-FWT 组合，瓶颈在于容斥。

复杂度：$O(2^{2m}nk+3^{k}\log 3^k)$。

可以做到 $O(3^mn)$，这里不予说明，详见：https://www.luogu.com.cn/article/1d7aiemo。

```cpp
#include <bits/stdc++.h>
#define ll long long
using namespace std;
namespace IO{
	const int sz=1<<22;
	char a[sz+5],b[sz+5],*p1=a,*p2=a,*t=b,p[105];
	inline char gc(){
		return p1==p2?(p2=(p1=a)+fread(a,1,sz,stdin),p1==p2?EOF:*p1++):*p1++;
	}
	template<class T> void read(T& x){
		x=0; char c=gc();
		for(;c<'0'||c>'9';c=gc());
		for(;c>='0'&&c<='9';c=gc())
			x=x*10+(c-'0');
	}
	inline void flush(){fwrite(b,1,t-b,stdout),t=b; }
	inline void pc(char x){*t++=x; if(t-b==sz) flush(); }
	template<class T> void write(T x,char c='\n'){
		if(x<0) pc('-'), x=-x;
		if(x==0) pc('0'); int t=0;
		for(;x;x/=10) p[++t]=x%10+'0';
		for(;t;--t) pc(p[t]); pc(c);
	}
	struct F{~F(){flush();}}f;
}
using IO::read;
using IO::write;
const ll P = 1e9 + 9;
const ll N = 1e5 + 10;
const ll M = 6;
const ll K = 21;
ll qpow(ll x, ll y) {
	if(y == 0) return 1;
	if(y % 2 == 1) return x * qpow(x, y - 1) % P;
	ll tmp = qpow(x, y / 2);
	return tmp * tmp % P;
}
const ll G = 13;
const ll w1 = qpow(G, (P - 1) / 3);
const ll w2 = qpow(G, (P - 1) / 3 * 2);
const ll inv3 = qpow(3, P - 2);
ll tmp1[3], tmp2[3], pw3[K];
ll num1[K], num2[K];
ll n, m, k, q, X;
ll f[1000010];
ll a[N][M];
ll ver[1000010];
ll root;
struct base3 {
	int num[K];
	base3(int x = 0) {
		memset(num, 0, sizeof num);
		int len = 0;
		while(x) {
			num[++ len] = x % 3;
			x /= 3;
		}
	}
	friend base3 operator ^(const base3 &x, const base3 &y) {
		base3 z;
		for(int i = 1; i < K; i ++) {
			z.num[i] = (x.num[i] + y.num[i]) % 3;
		}
		return z;
	}
	int to_int() {
		int x = 0;
		for(ll i = 1; i < K; i ++) {
			x += pw3[i - 1] * num[i];
		}
		return x;
	}
} b[M];
ll Change(ll x, ll y, ll z) {
	ll len = 0;
	while(x) {
		num1[++ len] = x % 3;
		x /= 3;
	}
	for(ll i = 1; i <= len; i ++) {
		if(i == y) num1[i] = (num1[i] * z) % 3;
		x += pw3[i - 1] * num1[i];
		num1[i] = 0;
	}
	return x;
}
void dfs(ll num, base3 x, ll mu) {
	if(num > 2 * m) {
		(f[x.to_int()] += mu) %= P;
		return;
	}
	if(num <= m) {
		dfs(num + 1, x, (mu * w1) % P);
		dfs(num + 1, x ^ b[num], (P - mu) % P);
	} else {
		dfs(num + 1, x, (mu * w2) % P);
		dfs(num + 1, x ^ b[num - m], (P - mu) % P);
	}
}
void FWT(ll *a, ll type, ll len) {
	for (ll x = 3; x <= len; x *= 3) {
		ll k = x / 3;
		for (ll i = 0; i < len; i += x) {
			for (ll j = 0; j < k; j ++) {
				for (ll l = 0; l < 3; l++) tmp1[l] = a[i + j + l * k];
				if (type == 1) {
					tmp2[0] = (tmp1[0] + tmp1[1] + tmp1[2]) % P;
					tmp2[1] = (tmp1[0] + tmp1[1] * w1 + tmp1[2] * w2) % P;
					tmp2[2] = (tmp1[0] + tmp1[1] * w2 + tmp1[2] * w1) % P;
				} else {
					tmp2[0] = (tmp1[0] + tmp1[1] + tmp1[2]) % P;
					tmp2[1] = (tmp1[0] + tmp1[1] * w2 + tmp1[2] * w1) % P;
					tmp2[2] = (tmp1[0] + tmp1[1] * w1 + tmp1[2] * w2) % P;
					for (ll l = 0; l < 3; l++) (tmp2[l] *= inv3) %= P;
				}
				for (ll l = 0; l < 3; l++) a[i + j + l * k] = tmp2[l];
			}
		}
	}
}
int main() {
	read(n), read(m), read(k), read(X);
	pw3[0] = 1;
	for(int i = 1; i <= k; i ++) {
		root = root * 3 + 1;
		pw3[i] = pw3[i - 1] * 3;
	}
	for(int i = 1; i <= n; i ++) {
		for(int j = 1; j <= m; j ++) {
			for(int x = 1; x <= k; x ++) {
				ll tmp = (X + X * i + (X ^ (j * x))) % 1000000000;
				tmp %= 3;
				a[i][j] += pw3[x - 1] * tmp;
			}
			b[j] = base3(a[i][j]);
		}
		dfs(1, base3(), 1);
	}
	ll inv = qpow(qpow(w1 - 1, m), P - 2) * qpow(qpow(w2 - 1, m), P - 2) % P;
	FWT(f, 1, pw3[k]);
	ver[0] = root;
	ll ans = f[ver[0]] * inv % P;
	read(q);
	for(int i = 1; i <= q; i ++) {
		int x = (X ^ i) % i, y = (X ^ i) % k + 1, z = (X + (X ^ i)) % 3;
		ver[i] = Change(ver[x], y, z);
		ans ^= (f[ver[i]] * inv % P);
	}
	write(ans);
}
```

