---
layout: post
title: 单纯形算法学习笔记
categories: [算法]
tags: [算法, 原创, 数学]
thumbnail: https://znpdco.github.io/blogimage/2024-05-02-simplex/thumbnail.webp
date: 2024-05-02 00:00:00
mathjax: true
---

> 开始前的一点碎碎念：这篇文章原本是在 4 月 20 日写的，然后就经历了 gitee 爆炸导致博客园样式不能用，我就在 github 上建立了这个博客，把它转存到这里了。
>
> 由于这里的 markdown 较为严格，应该不会把博客园搬过来了……
>
> 这篇文章在 [博客园](https://www.cnblogs.com/znpdco/p/18147653) 的地址。
>
> 转载请附上 [原文地址](https://znpdco.github.io/blog/2024/05/02/simplex/)。

## 阅读本文你将会知道

- 线性规划与单纯形算法
- 单纯形算法时间复杂度分析
- 单纯形 C++ 代码实现
- 单纯形算法在算法题目中的运用

## 线性规划简介

首先引入机床厂问题：

> 某机床厂生产甲、乙两种机床，每台销售后的利润分别为 $4000$ 元与 $3000$ 元。 生产甲机床需用 $A$、$B$ 机器加工，加工时间分别为每台 $2$ 小时和 $1$ 小时；生产乙机床需用 $A$、$B$、$C$ 三种机器加工，加工时间为每台各一小时。若每天可用于加工的机器时数分别为 $A$ 机器 $10$ 小时、$B$ 机器 $8$ 小时和 $C$ 机器 $7$ 小时，问该厂每天应生产甲、乙机床各几台，才能使该天的总利润最大？

上述问题的数学模型：设该厂生产 $x_1$ 台甲机床和 $x_2$ 台乙机床时总利润最大，则 $x_1$、$x_2$ 应满足：

$$
\begin{aligned}
& \max z=4x_1+3x_2 \\
& \text{s.t.}\begin{cases}
2x_1+x_2\le10 & (A\ 机器)\\
x_1+x_2\le8 & (B\ 机器)\\
x_2\le7 & (C\ 机器)\\
x_1,x_2\ge0
\end{cases}
\end{aligned}
$$

这里变量 $x_1$、$x_2$ 称之为**决策变量**，上面的最大式被称为问题的**目标函数**，下面约束条件中的几个不等式是问题的**约束条件**，记为 $\text{s.t.}$（即 subject to）。由于上面的目标函数及约束条件均为线性函数，故被称为线性规划问题。 

### 线性规划的标准形

线性规划的标准形式如下：

$$
\begin{aligned}
& \max z = \sum_{j = 1}^{n}c_jx_j \\ 
& \text{s.t}\begin{cases}  
\displaystyle \sum_{j = 1}^{n}a_{ij}x_j \le b_i\\ 
x_j\ge0
\end{cases}
\end{aligned}
$$

### 一般型转标准型

- 如果题目要求最小值，那么可以把目标函数的系数均乘上 $-1$ 转换为最大值；
- 如果约束为 $ax=b$，那么转换为 $ax\le b$ 和 $ax\ge b$ 两个约束；
- 如果约束为 $ax\ge b$，该约束的系数均乘上 $-1$ 就可以变成 $-ax\le-b$；
- 如果对 $x$ 的值域没有要求，那么可以用 $x'-x''$ 替代 $x$，其中 $x',x''\ge0$；
- 其它情况读者可以自行尝试。

### < 与 ≤

那么有人可能要问了，为什么不能将 $x<1$ 的一般型转换为标准型呢？

举个例子：

$$
\begin{aligned}
& \max z = x_1 \\ 
& x_1<1
\end{aligned}
$$

发现是无解的。

### 线性规划的松弛形

因为不等式处理起来不如等式方便，所以我们定义松弛型：

$$
\begin{aligned}
& \max z = \sum_{j = 1}^{n}c_jx_j \\ 
& \text{s.t}\begin{cases}  
\displaystyle \sum_{j = 1}^{n}a_{ij}x_j \textcolor{red}{=} b_i\\ 
x_j\ge0
\end{cases}
\end{aligned}
$$

### 标准型转松弛形

考虑加入辅助变量 $x_{n+1}\sim x_{n+m}$，如下：

$$
\sum_{j = 1}^{n}a_{ij}x_j \le b_i \Rightarrow x_{n+i}+\sum_{j = 1}^{n}a_{ij}x_j = b_i\ (x_{n+i}\ge0)
$$

那么就有：

$$
\sum_{j = 1}^{n}a_{ij}x_j \le b_i \Rightarrow x_{n+i} = b_i-(\sum_{j = 1}^{n}a_{ij}x_j)
$$

以机床厂问题为例：

$$
\begin{aligned}
& \max z=4x_1+3x_2 \\
& \text{s.t.}\begin{cases}
2x_1+x_2\le10 \\
x_1+x_2\le8 \\
x_2\le7 \\
x_1,x_2\ge0
\end{cases}
\end{aligned}
$$

可以被转换成：

$$
\begin{aligned}
& \max -z=0-(4x_1+3x_2) \\
& \text{s.t.}\begin{cases}
x_3=10-(2x_1+x_2) \\
x_4=8-(x_1+x_2) \\
x_5=7-(x_2) \\
x_1,x_2,x_3,x_4,x_5\ge0
\end{cases}
\end{aligned}
$$

其中，$x_3\sim x_5$ 是辅助变量。我们给它们起一个名字，叫做**基本变量**。同理，$x_1\sim x_2$ 就是**非基本变量**。

也就是说，$x_{1}\sim x_n$ 为非基本变量，$x_{n+1}\sim x_{n+m}$ 为基本变量。

## 单纯形算法

我们接下来就会介绍单纯形算法——一个求解线性规划的经典方法。

它有三步：

1. 找到一个初始的基本可行解；
2. 不断的进行旋转（pivot）操作；
3. 重复 2 直到结果最优。

我们以上面的线性规划松弛型为例子（此后，我们会省略变量均大于等于 $0$ 这一要求，请读者自行理解）：

$$
\begin{array}{}
-z & = & 0 & - & ( & 4x_1 & + & 3x_2 & ) \\
x_3 & = & 10 & - & ( & 2x_1 & + & x_2 & ) \\
x_4 & = & 8 & - & ( & x_1 & + & x_2 & ) \\
x_5 & = & 7 & - & ( &  &  & x_2 & ) \\
\end{array}
$$

### 基本可行解

此时我们要进行第一步，找到一个**基本可行解**。

所谓基本可行解，就是找到一组**基本变量的取值**，使得其满足题目要求。

我们假设非基本变量取值都是 $0$，以此得到基本变量的取值，然后容易发现，$x_1=0,x_2=0,x_3=10,x_4=8,x_5=7,-z=0$。

发现它们都是满足 $x_1,x_2,x_3,x_4,x_5\ge0$ 的要求的。所以这是基本可行解。

当然，也存在不合法的初始情况，称为基本不可行解，这一点我们后面再说。

### 如何判断最优

我们知道，目标函数可以由非基本变量得出：

$$
z=\sum_{j = 1}^{n}c_jx_j
$$

当达到最优解时，我们发现 $c_j$ 必定都小于等于 $0$。

为什么，因为若 $c_j$ 大于 $0$，那么 $z$ 的值则会与 $x_j$ 成正比例关系，若 $x_j$ 变大，$z$ 也会变大，所以当前并不是最优解。

我们发现，当前的 $z=4x_1+3x_2$，都是大于 $0$ 的系数，不是最优值。

所以，当我们发现 $z$ 的系数全部都小于等于 $0$ 时，此时答案最优！

如何修改目标函数的系数呢？我们可以通过**旋转操作**。

### 旋转操作

所谓旋转操作，就是**将非基本变量与基本变量交换**的操作。

可能有点拗口，举个例子：

$$
\begin{array}{}
-z & = & 0 & - & ( & 4x_1 & + & 3x_2 & ) \\
x_3 & = & 10 & - & ( & 2x_1 & + & x_2 & ) \\
x_4 & = & 8 & - & ( & x_1 & + & x_2 & ) \\
x_5 & = & 7 & - & ( &  &  & x_2 & ) \\
\end{array}
$$

将 $x_1$ 与 $x_3$ 交换，我们就用 $x_3$ 来表示 $x_1$：

$$
\begin{array}{}
-z & = & 0 & - & ( & 4x_1 & + & 3x_2 & ) \\
\frac{1}{2}x_3 & = & 5 & - & ( & x_1 & + & \frac{1}{2}x_2 & ) \\
x_4 & = & 8 & - & ( & x_1 & + & x_2 & ) \\
x_5 & = & 7 & - & ( &  &  & x_2 & ) \\
\end{array}
$$

$$
\Downarrow
$$

$$
\begin{array}{}
-z & = & 0 & - & ( & 4x_1 & + & 3x_2 & ) \\
x_1 & = & 5 & - & ( &  &  & \frac{1}{2}x_2 & + & \frac{1}{2}x_3 & ) \\
x_4 & = & 8 & - & ( & x_1 & + & x_2 & ) \\
x_5 & = & 7 & - & ( &  &  & x_2 & ) \\
\end{array}
$$

然后把 $x_1$ 当作基本变量，将 $x_3$ 当作非基本变量，把 $x_1$ 代入其它式子：

$$
\begin{array}{}
-z & = & 0 & - & ( & 4(5-\frac{1}{2}x_2-\frac{1}{2}x_3) & + & 3x_2 & ) \\
x_1 & = & 5 & - & ( &  &  & \frac{1}{2}x_2 & + & \frac{1}{2}x_3 & ) \\
x_4 & = & 8 & - & ( & (5-\frac{1}{2}x_2-\frac{1}{2}x_3) & + & x_2 & ) \\
x_5 & = & 7 & - & ( &  &  & x_2 & ) \\
\end{array}
$$

$$
\Downarrow
$$

$$
\begin{array}{}
-z & = & -20 & - & ( & x_2 & + & -2x_3 & ) \\
x_1 & = & 5 & - & ( & \frac{1}{2}x_2 & + & \frac{1}{2}x_3 & ) \\
x_4 & = & 3 & - & ( & \frac{1}{2}x_2 & + & -\frac{1}{2}x_3 & ) \\
x_5 & = & 7 & - & ( & x_2 & ) \\
\end{array}
$$

因为交换了，我们把 $x_3$ 移动到 $x_1$ 原本那一列，看看和原式子有什么不同：

$$
\begin{array}{}
-z & = & -20 & - & ( & -2x_3 & + & x_2 & ) \\
x_1 & = & 5 & - & ( & \frac{1}{2}x_3 & + & \frac{1}{2}x_2 & ) \\
x_4 & = & 3 & - & ( & -\frac{1}{2}x_3 & + & \frac{1}{2}x_2 & ) \\
x_5 & = & 7 & - & ( & & & x_2 & ) \\
\end{array}
$$

比较一下：

$$
\begin{array}{}
-z & = & 0 & - & ( & 4x_1 & + & 3x_2 & ) \\
x_3 & = & 10 & - & ( & 2x_1 & + & x_2 & ) \\
x_4 & = & 8 & - & ( & x_1 & + & x_2 & ) \\
x_5 & = & 7 & - & ( &  &  & x_2 & ) \\
\end{array}
\quad\Rightarrow\quad
\begin{array}{}
-z & = & -20 & - & ( & -2x_3 & + & x_2 & ) \\
x_1 & = & 5 & - & ( & \frac{1}{2}x_3 & + & \frac{1}{2}x_2 & ) \\
x_4 & = & 3 & - & ( & -\frac{1}{2}x_3 & + & \frac{1}{2}x_2 & ) \\
x_5 & = & 7 & - & ( & & & x_2 & ) \\
\end{array}
$$

我们发现，对于将基本变量 $x_3$ 与非基本变量 $x_1$ 交换的操作，**原本**的 $x_3$ 这一行（第二行）除去 $x_1$ 自己，其它的系数都除以了 $x_1$ 的系数 $2$，而 $x_1$ 自己则是因为与 $x_3$ 交换变成了 $x_3$ 的系数（也就是 $1$）之后才除以了 $x_1$ 原本的系数。

仔细观察其它列的变换，我们发现它们都减去了自己原本 $x_1$ 系数倍的 $x_3$ 这一行的值，比如对于第一行的第一项，它减去了原本 $x_1$ 的系数（也就是 $4$）乘以第二行的第一项 $5$（注意是更新后的）也就是减去了 $20$；比如对于第一行的第二项，它自己先是变成了 $x_3$ 的系数 $0$，再减去了原本 $x_1$ 的系数（也就是 $4$）乘以第二行的第二项 $\frac{1}{2}$（注意也是更新后的）也就是减去了 $2$。

---

没有理解没有关系，我们换个角度：

我们以矩阵的形式观察，首先可以将这原本的松弛型式子的系数转换为矩阵（定义矩阵下标从 $0$ 开始，矩阵右边多出来的三列就是基本变量的系数，我们将基本变量标红）：

$$
\begin{array}{}
-z & = & 0 & - & ( & 4x_1 & + & 3x_2 & ) \\
x_3 & = & 10 & - & ( & 2x_1 & + & x_2 & ) \\
x_4 & = & 8 & - & ( & x_1 & + & x_2 & ) \\
x_5 & = & 7 & - & ( &  &  & x_2 & ) \\
\end{array}
\quad\Rightarrow\quad
\begin{pmatrix}
\text{常数} & x_1 & x_2 & \textcolor{red}{x_3} & \textcolor{red}{x_4} & \textcolor{red}{x_5} \\
0 & 4 & 3 & 0 & 0 & 0 \\
10 & 2 & 1 & 1 & 0 & 0 \\
8 & 1 & 1 & 0 & 1 & 0 \\
7 & 0 & 1 & 0 & 0 & 1 \\
\end{pmatrix}
$$

我们进行换元操作时把 $x_1$ 与 $x_3$ 交换，$x_1$ 变成基本变量，$x_3$ 变成非基本变量：

$$
\begin{pmatrix}
\text{常数} & \textcolor{red}{x_1} & x_2 & x_3 & \textcolor{red}{x_4} & \textcolor{red}{x_5} \\
0 & 4 & 3 & 0 & 0 & 0 \\
10 & 2 & 1 & 1 & 0 & 0 \\
8 & 1 & 1 & 0 & 1 & 0 \\
7 & 0 & 1 & 0 & 0 & 1 \\
\end{pmatrix}
$$

同时我们对第二行进行处理以保证基本变量系数均为 $1$：

$$
\begin{pmatrix}
\text{常数} & \textcolor{red}{x_1} & x_2 & x_3 & \textcolor{red}{x_4} & \textcolor{red}{x_5} \\
0 & 4 & 3 & 0 & 0 & 0 \\
5 & 1 & \frac{1}{2} & \frac{1}{2} & 0 & 0 \\
8 & 1 & 1 & 0 & 1 & 0 \\
7 & 0 & 1 & 0 & 0 & 1 \\
\end{pmatrix}
$$

我们此时需要将其他行原本的 $x_1$ 系数化为 $0$，实际上就是将每一项都减去这一行原本 $x_1$ 系数倍的第二行，同时因为其他行的 $x_3$ 系数都是 $0$，所以需要替换：

$$
\begin{pmatrix}
\text{常数} & \textcolor{red}{x_1} & x_2 & x_3 & \textcolor{red}{x_4} & \textcolor{red}{x_5} \\
0-4\times5 & 0 & 3-4\times\frac{1}{2} & 0-4\times\frac{1}{2} & 0 & 0 \\
5 & 1 & \frac{1}{2} & \frac{1}{2} & 0 & 0 \\
8-1\times5 & 0 & 1-1\times\frac{1}{2} & 0-1\times\frac{1}{2} & 1 & 0 \\
7-0\times5 & 0 & 1-0\times\frac{1}{2} & 0-0\times\frac{1}{2} & 0 & 1 \\
\end{pmatrix}
$$

得到：

$$
\begin{pmatrix}
\text{常数} & \textcolor{red}{x_1} & x_2 & x_3 & \textcolor{red}{x_4} & \textcolor{red}{x_5} \\
-20 & 0 & 1 & -2 & 0 & 0 \\
5 & 1 & \frac{1}{2} & \frac{1}{2} & 0 & 0 \\
3 & 0 & \frac{1}{2} & -\frac{1}{2} & 1 & 0 \\
7 & 0 & 1 & 0 & 0 & 1\\
\end{pmatrix}
$$

---

发现实际上三个基本变量都是 $1$ 或者 $0$，所以我们将它们省略，得到一个更简略的矩阵：

$$
\begin{array}{}
-z & = & 0 & - & ( & 4x_1 & + & 3x_2 & ) \\
x_3 & = & 10 & - & ( & 2x_1 & + & x_2 & ) \\
x_4 & = & 8 & - & ( & x_1 & + & x_2 & ) \\
x_5 & = & 7 & - & ( &  &  & x_2 & ) \\
\end{array}
\quad\Rightarrow\quad
\begin{pmatrix}
0 & 4 & 3 \\
10 & 2 & 1 \\
8 & 1 & 1 \\
7 & 0 & 1 \\
\end{pmatrix}
$$

同理的变换方法，交换系数（左边是包含那三个基本变量的过程，右边是**省略三个基本变量**（注意，是基本变量，不一定是 $x_3,x_4,x_5$）的过程，对照着看更清晰）：

$$
\left.\begin{pmatrix}
\text{常数} & \textcolor{red}{x_1} & x_2 & x_3 & \textcolor{red}{x_4} & \textcolor{red}{x_5} \\
0 & 4 & 3 & 0 & 0 & 0 \\
5 & 1 & \frac{1}{2} & \frac{1}{2} & 0 & 0 \\
8 & 1 & 1 & 0 & 1 & 0 \\
7 & 0 & 1 & 0 & 0 & 1 \\
\end{pmatrix}\right|\begin{pmatrix}
0 & 4 & 3 \\
5 & \frac{1}{2} & \frac{1}{2} \\
8 & 1 & 1 \\
7 & 0 & 1 \\
\end{pmatrix}
$$

将其它行的 $x_1$ 都消掉：

$$
\left.\begin{pmatrix}
\text{常数} & \textcolor{red}{x_1} & x_2 & x_3 & \textcolor{red}{x_4} & \textcolor{red}{x_5} \\
-20 & 0 & 1 & -2 & 0 & 0 \\
5 & 1 & \frac{1}{2} & \frac{1}{2} & 0 & 0 \\
3 & 0 & \frac{1}{2} & -\frac{1}{2} & 1 & 0 \\
7 & 0 & 1 & 0 & 0 & 1\\
\end{pmatrix}\right|
\begin{pmatrix}
-20 & -2 & 1 \\
5  & \frac{1}{2} & \frac{1}{2} \\
3 & -\frac{1}{2} & \frac{1}{2} \\
7 & 0 & 1 \\
\end{pmatrix}
$$

在代码实现上，明显省略三个基本变量会更加好写。

对于将基本变量 $x_{n+l}$ 与非基本变量 $x_e$ 交换，有以下代码：

```cpp
void pivot(int l, int e) {
	double t = a[l][e];
	a[l][e] = 1;	// 变成 x_n+l 的系数 1
	for(int i = 0; i <= n; i ++) a[l][i] /= t;
	for(int i = 0; i <= m; i ++) if(i != l && abs(a[i][e]) > eps) {
		t = a[i][e]; a[i][e] = 0;	// 变成 x_n+l 在这一行的系数 0
		for(int j = 0; j <= n; j ++) {
			a[i][j] -= a[l][j] * t;
		}
	}
}
```

### 如何通过旋转更新解？

我们的目标是将第一行目标函数的系数都变成小于等于 $0$ 的，而我们发现将在目标函数中系数大于 $0$ 的非基本变量 $x_1$ 与在这列系数同样大于 $0$ 的非基本变量 $x_3$ 交换时，可以使得这一个目标函数的系数变得小于等于 $0$。

原理是在交换时 `a[i][e] = 0` 又会 `a[i][j] -= a[l][j] * t`，所以当 $i=0,j=e$ 时，这一个系数将会变得小于等于 $0$。

所以我们考虑找到一个 $a_{0,e}>0(1\le e\le n)$，如果没有，那么就满足目标函数的系数全部都小于等于 $0$，当前就是最优解。

否则我们就再一次找到一个 $a_{l,e}>0(1\le l\le m)$，如果没有，说明当前 $e$ 无法变成非正系数，就说明解可以无穷大（unbounded）。

然后，我们旋转 $l$ 与 $e$。

重复这个操作就可以了。

### 退化与布兰德规则

在进行上述过程中，我们可能会进入一个死循环，目标值不变，我们称当前遇到了退化（degeneracy），退化可能会导致死循环。而应对它的方法就是[布兰德规则](https://personal.math.ubc.ca/~anstee/math340/340blandsrule.pdf)（bland），我们可以根据如下法则选择 $l$ 与 $e$：

- 在选择 $e$ 时，选择下标最小的那个；
- 在选择 $l$ 时，选择约束最紧的那个（也就是 $\frac{a_{l,0}}{a_{l,e}}$ 最小的那个，它限制了取值范围）。

根据布兰德规则，我们可以写出如下代码：

```cpp
void simplex() {
	while(1) {
		ll l = 0, e = 0;
		ld mn = inf;
		for(ll i = 1; i <= n; i ++) {
			if(a[0][i] > eps) {
				e = i;
				break;
			}
		}
		if(!e) break;
		for(ll i = 1; i <= m; i ++) {
			if(a[i][e] > eps && a[i][0] / a[i][e] < mn) {
				l = i;
				mn = a[i][0] / a[i][e];
			}
		}
		if(!l) {
			printf("Unbounded");
			exit(0);
		}
		pivot(l, e);
	}
}
```

### 基本不可行解

我们发现，在求解基本可行解中，如果出现某一个基本变量小于 $0$ 的情况，是不可行的。

比如：

$$
\begin{aligned}
& \max z=x_1+x_2 \\
& \text{s.t.}\begin{cases}
x_1+x_2\ge10 \\
2x_1+3x_2\le-3 \\
x_1,x_2\ge0
\end{cases}
\end{aligned}
$$

那么转换为标准型：

$$
\begin{aligned}
& \max z=x_1+x_2 \\
& \text{s.t.}\begin{cases}
-x_1-x_2\le-10 \\
2x_1+3x_2\le-3 \\
x_1,x_2\ge0
\end{cases}
\end{aligned}
$$

转换为松弛型：

$$
\begin{aligned}
& \max z=x_1+x_2 \\
& \text{s.t.}\begin{cases}
x_3=-10-(-x_1-x_2) \\
x_4=-3-(2x_1+3x_2) \\
x_1,x_2,x_3,x_4\ge0
\end{cases}
\end{aligned}
$$

我们发现，当 $x_1=0,x_2=0$ 时，$x_3=-10,x_4=-3$，它是不满足 $x_3\ge0,x_4\ge0$ 的要求的，所以我们认为它不合法。

我们观察以下基本不可行解有什么特点，我们将上面的松弛型整理一下：

$$
\begin{array}{}
-z & = & 0 & - & ( & x_1 & + & x_2 & ) \\
x_3 & = & -10 & - & ( & -x_1 & + & -x_2 & ) \\
x_4 & = & -3 & - & ( & 2x_1 & + & 3x_2 & ) \\
\end{array}
$$

我们发现，当我们将这些非基本变量都取为 $0$ 时，因为 $a_{1,0}=-10$，所以导致 $x_3=-10$。同理因为 $a_{2,0}=-8$，所以 $x_4=-8$。

也就是说，一个初始解可行当且仅当对于任意的 $i$ 都满足 $a_{i,0}\ge0$。

---

生成一个初始可行解有几种方法：一种是创建一个辅助线性规划（auxiliary linear program），但在算法竞赛中我们常用的是第二种方法，随机选择法：

我们先随机找到一个 $a_{l,0}<0$，我们希望能将其变为大于等于 $0$ 的。如果没有这样的 $l$，说明当前已经是初始可行解。

否则再随机找到一个 $a_{l,e}<0$，根据上面的经验，我们将 $l$ 与 $e$ 旋转之后就可以把 $a_{l,0}$ 变为大于等于 $0$ 的。如果不存在这样的 $e$ 说明当前这个位置不能变成大于等于 $0$ 的，那么无解（infeasible）。

```cpp
void init() {
	while(1) {
		ll l = 0, e = 0;
		for(ll i = 1; i <= m; i ++) {
			if(a[i][0] < -eps && (!l || rnd() % 2 == 0)) {
				l = i;
			}
		}
		if(!l) break;
		for(ll i = 1; i <= n; i ++) {
			if(a[l][i] < -eps && (!e || rnd() % 2 == 0)) {
				e = i;
			}
		}
		if(!e) {
			printf("Infeasible");
			exit(0);
		}
		pivot(l, e);
	}
}
```

## 单纯形算法的几何意义

我们换一个角度来看线性规划：通过图的视角。考虑以下问题：

$$
\begin{aligned}
& \max x + y \\
& \text{s.t.}\begin{cases}
5x-2y\le-2 \\
4x-y\ge8 \\
2x+y\ge10 \\
\end{cases}
\end{aligned}
$$

我们可以画出以下图表：

![](https://znpdco.github.io/blogimage/2024-05-02-simplex/simplex-1.png)

容易发现，最优解必定在顶点上，不需要考虑内部点。（因为围成的可行域一定是凸的）

---

同时，因为可行域是凸的，我们可以求每个顶点的高度，找出其中最高的一个，肯定就是最优点。

但是我们还有个更简单的方法：

先找到一个顶点，然后从这个顶点，沿着某条边线，走到下一个顶点，直到最优。方向的选择可以有很多种，最多使用的是比较短视的方法：沿着最陡峭的那一条，追求当前步上升最快。

![](https://znpdco.github.io/blogimage/2024-05-02-simplex/simplex-2.png)

因为可行域它是凸的，就保证了要么解无穷大要么只有一个极值。

当我们进行一次旋转操作时，相当于沿着一条边移动到另一个顶点上，所以进行若干次操作后必定可以移动到最值上。

我们设移动的方向是 $\lambda$，距离是 $\theta$，我们进行旋转操作相当于走 $x'=x-\theta\lambda$。

对应到单纯形中的矩阵，例如还是机床厂问题：

$$
\begin{pmatrix}
-z\text{ or 常数} & x_1 & x_2 & \textcolor{red}{x_3} & \textcolor{red}{x_4} & \textcolor{red}{x_5} \\
0 & 4 & 3 & 0 & 0 & 0 \\
10 & 2 & 1 & 1 & 0 & 0 \\
8 & 1 & 1 & 0 & 1 & 0 \\
7 & 0 & 1 & 0 & 0 & 1 \\
\end{pmatrix}
$$

我们的方向 $\lambda$ 就相当与某一个非基本变量的那一列，比如此处我们选择第一列，可以发现  $4(-z)+-x_1+0x_2+2x_3+1x_4+0x_5=0$，那么就是 $\lambda=(4,-1,0,2,1,0)$。

我们走多少呢？走过多会超出区域，过少会达不到顶点。可以发现最多只能是 $\theta=5$，也就是限制最紧的那一个：$10\div2=5$，我们就可以得到解：

$x'=(0,0,0,10,8,7)-(4,-1,0,2,1,0)\times5=(-20,5,0,0,3,7)$，发现是对应的：

$$
\begin{pmatrix}
-z\text{ or 常数} & \textcolor{red}{x_1} & x_2 & x_3 & \textcolor{red}{x_4} & \textcolor{red}{x_5} \\
-20 & 0 & 1 & -2 & 0 & 0 \\
5 & 1 & \frac{1}{2} & \frac{1}{2} & 0 & 0 \\
3 & 0 & \frac{1}{2} & -\frac{1}{2} & 1 & 0 \\
7 & 0 & 1 & 0 & 0 & 1\\
\end{pmatrix}
$$

---

同时，如果可行域不包括原点，那么我们也是需要建立一个初始可行解的，否则我们就没有在顶点上跑，矛盾。

![](https://znpdco.github.io/blogimage/2024-05-02-simplex/simplex-3.png)

## 单纯形算法的时间复杂度分析

我们发现，旋转一次的时间复杂度为 $O(nm)$。假设旋转 $k$ 次，那么时间复杂度就是 $O(knm)$。

在很长一段时间内，人们认为单纯形是多项式时间复杂度的。直到 V. Klee and G. L. Minty[1972] 构造了一个例子，我们称它为 Klee–Minty 问题：

$$
\begin{aligned}
& \max x_n \\
& \text{s.t.}\begin{cases}
0\le x_1\le 1 \\
\delta x_{j-1}\le x_j\le1-\delta x_{j-1} & \text{for } j=2,3,\cdots,n
\end{cases}
\end{aligned}
$$

其中，$0<\delta\le\frac{1}{3}$。

该问题的时间复杂度是质数级别的。该问题的可行域是顶点被扰动了的单位超立方体（unit hypercube），如果选择全零作为初始可行解进行单纯形算法，在几何意义下，单纯形算法将会遍历每一个顶点，进行 $2^n-1$ 次转动操作，才可以得到最优解。

![](https://znpdco.github.io/blogimage/2024-05-02-simplex/simplex-4.png)

但是，Borgwardt (1982) 证明单纯形算法的平均复杂度是多项式时间的；Haimovich (1983) 证明了迭代次数的数学期望实际上是线性的；Spielman and Teng (2004) 引入了平滑型复杂度理论（smoothed analysis）。Spielman & Teng 定理断言：**在线性规划问题上加入随机高斯扰动，单纯形算法期望用多项式步数求解**。

所以我们在最开始时进行若干次随机扰动可以使得单纯形算法期望可以在多项式时间复杂度内求解。一般来说，旋转的次数是在 $2(n+m)$ 左右的。

### 线性规划问题有更优的做法吗？

答案是有的。尽管单纯形是指数时间复杂度，但是 L. G. Khachiyan 提出的椭球法与 N. Karmarkar 提出的内点法具有多项式时间复杂度。这里由于篇幅问题不展开。

而在一般的算法竞赛中，单纯形更为常用且表现更好。

## 对偶定理

当我们的线性规划是求**最小值**的同时约束也都是**大于等于**时，我们不仅可以通过将系数都乘以 $-1$ 以转换为一般型，也可以通过对偶定理实现。

我们称原问题为 LP，对偶问题为 DP。

原问题有：

$$
\begin{aligned}
& \max z=CX \\
& \text{s.t.}\begin{cases}
AX\le b \\
X\ge 0
\end{cases}
\end{aligned}
$$

对偶问题有：

$$
\begin{aligned}
& \min w=b^TX \\
& \text{s.t.}\begin{cases}
A^TY\ge C^T \\
X\ge 0
\end{cases}
\end{aligned}
$$

简单来说，我们将单纯形矩阵进行矩阵转置后再进行朴素单纯形即可。还是以机床厂问题为例：

$$
\begin{pmatrix}
0 & 4 & 3 \\
10 & 2 & 1 \\
8 & 1 & 1 \\
7 & 0 & 1 \\
\end{pmatrix}
$$

它的 DP 是：

$$
\begin{pmatrix}
0 & 10 & 8 & 7 \\
4 & 2 & 1 & 0 \\
3 & 1 & 1 & 1 \\
\end{pmatrix}
$$

即原矩阵的转置。

| 对偶问题（下）\\原问题（右） | 最优解 | 无界解 | 无可行解 |
| ---------------------------- | ------ | ------ | -------- |
| 最优解                       | $x$    | \\     | \\       |
| 无界解                       | \\     | \\     | $x$      |
| 无可行解                     | \\     | $x$    | 无法判断 |

所以部分问题可以通过转换为对偶问题以省略初始找可行解的过程。

## 全幺模矩阵

若矩阵满足任意一个子方阵的行列式为 $0,-1,1$，那么我们称这个矩阵为全幺模矩阵（totally unimodular matrix）。

若矩阵是全幺模矩阵，该线性规划最优解为整数。

![](https://znpdco.github.io/blogimage/2024-05-02-simplex/simplex-5.png)

我们观察后可以发现，如果一个规划问题它的可行域多面体的所有顶点都是整数点的话（例如图中 $P$ 就满足这个条件，而 $P1$ 和 $P2$ 都不满足这个条件），那就可以满足线性规划最优解为整数了。

证明全幺模矩阵可行域的顶点都在整点上：一个顶点无非是将一些线性无关的不等式改成等式后的线性方程组的解。如果矩阵 $A$ 是全幺模的，若满足 $A_S$ 是 $A$ 的[非奇异方阵](https://baike.baidu.com/item/奇异矩阵/9658459)，那么就有 $\det A_S=\pm1$（因为全幺模矩阵保证了 $\det A_S=0\text{ or }\pm1$，而非奇异方阵保证了 $\det A_S\neq0$）。若 $\det A_S^{(i)}\|b_S$ 是将方阵 $A_S$ 的第 $i$ 列替换为 $b$ 得到的矩阵，那么依[克莱姆法则](https://baike.baidu.com/item/克莱姆法则/7211518)（Cramer's Rule）可知：

$$
x_i=\dfrac{\det A_S^{(i)}|b_S}{\det A_S}
$$

因为 $A_S^{(i)}\|b_S$ 方阵中的每一个数均为整数，所以 $\det A_S^{(i)}\|b_S$ 为整数。同时因为 $\det A_S=\pm1$，所以 $x_i$ 必定为整数。以此类推，所以顶点均为整点。

---

以下命题中的矩阵是全幺模矩阵：

- 无向二分图的关联矩阵是全幺模矩阵（无向二分图的关联矩阵为行表示结点，列表示边，如果结点和边关联，则单元格值为 $1$，否则为 $0$）；
- 有向图的关联矩阵是全幺模矩阵（有向图的关联矩阵为行表示结点，列表示边，每条边与入点的单元格值为 $1$，与出点的单元格值为 $-1$，否则为 $0$）；
- 任何最大流、最小费用最大流的线性规划都是全幺模矩阵。

具体证明可以查看参考资料。

---

证明一个矩阵是全幺模其实还有一个骚操作：我们随机造若干数据，如果这些数据的结果都是整数，那么这个矩阵八成是全幺模的。

## 例题

### [「UOJ #179」线性规划](https://uoj.ac/problem/179)

> 求解一个 $n$ 个变量与 $m$ 条约束的标准型线性规划。
>
> $n,m\le20$。

如果你实现朴素的单纯形，你就会发现没有通过 hack 数据，[提交记录](https://uoj.ac/submission/685493)。实际上我们可以在开头进行若干次的随机扰动以实现期望线性。

可惜的是依旧没过（我太菜了），这次是被卡精度了，实现一下高精度浮点数或许能过。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define N 100
#define ll long long
#define ld long double
#define eps 1e-8
#define inf 1e15
ll n, m, t;
ld a[N][N];
ll r[N];
ld ans[N];
std::mt19937 rnd(time(0));
void pivot(ll l, ll e) {
	swap(r[n + l], r[e]);
	ld t = a[l][e];
	a[l][e] = 1;
	for(ll i = 0; i <= n; i ++) a[l][i] /= t;
	for(ll i = 0; i <= m; i ++) if(i != l && abs(a[i][e]) > eps) {
		t = a[i][e]; a[i][e] = 0;
		for(ll j = 0; j <= n; j ++) {
			a[i][j] -= a[l][j] * t;
		}
	}
}
void noise() {
	for(ll i = 1; i <= 10; i ++) {
		ll l = 0, e = 0;
		for(ll i = 1; i <= m; i ++) {
			if(abs(a[i][0]) > eps && (!l || rnd() % 2 == 0)) {
				l = i;
			}
		}
		if(!l) break;
		for(ll i = 1; i <= n; i ++) {
			if(abs(a[l][i]) > eps && (!e || rnd() % 2 == 0)) {
				e = i;
			}
		}
		if(!e) continue;
		pivot(l, e);
	}
}
void init() {
	while(1) {
		ll l = 0, e = 0;
		for(ll i = 1; i <= m; i ++) {
			if(a[i][0] < -eps && (!l || rnd() % 2 == 0)) {
				l = i;
			}
		}
		if(!l) break;
		for(ll i = 1; i <= n; i ++) {
			if(a[l][i] < -eps && (!e || rnd() % 2 == 0)) {
				e = i;
			}
		}
		if(!e) {
			printf("Infeasible");
			exit(0);
		}
		pivot(l, e);
	}
}
void simplex() {
	while(1) {
		ll l = 0, e = 0;
		ld mn = inf;
		for(ll i = 1; i <= n; i ++) {
			if(a[0][i] > eps) {
				e = i;
				break;
			}
		}
		if(!e) break;
		for(ll i = 1; i <= m; i ++) {
			if(a[i][e] > eps && a[i][0] / a[i][e] < mn) {
				l = i;
				mn = a[i][0] / a[i][e];
			}
		}
		if(!l) {
			printf("Unbounded");
			exit(0);
		}
		pivot(l, e);
	}
}
int main() {
	scanf("%lld %lld %lld", &n, &m, &t);
	for(ll i = 1; i <= n; i ++) {
		scanf("%Lf", &a[0][i]);
	}
	for(ll i = 1; i <= m; i ++) {
		for(ll j = 1; j <= n; j ++) {
			scanf("%Lf", &a[i][j]);
		}
		scanf("%Lf", &a[i][0]);
	}
	for(ll i = 1; i <= n; i ++) r[i] = i;
	noise();
	init();
	simplex();
	if(abs(a[0][0]) < eps) printf("0\n");
	else printf("%.10Lf\n", -a[0][0]);
	if(t) {
		for(ll i = 1; i <= m; i ++) ans[r[n + i]] = a[i][0];
		for(ll i = 1; i <= n; i ++) printf("%.10Lf ", ans[i]);
	}
}
```

### [「NOI2008」志愿者招募](https://www.luogu.com.cn/problem/P3980)

> $n$ 天，每天需要 $a_i$ 个人。有 $m$ 种人，每种人可以从 $s_i$ 工作到 $t_i$，费用为 $c_i$，求最小费用。
>
> $1\le n\le1000,1\le m\le10000$。

单纯形板题，设变量 $x_1\sim x_m$ 表示每种志愿者招募多少个，第 $i$ 条约束是第 $i$ 天可以工作志愿者的和大于等于 $a_i$。最小化 $x_ic_i$ 的和。

发现既是求最小值又是大于等于的约束，所以可以通过对偶实现。

我们发现志愿者都要求是正数的，所以需要证明这个矩阵是全幺模矩阵。

但是我们发现矩阵比较特殊，都是 $0$ 和 $1$，且每一列的 $1$ 有且仅有连续的一段。

$$
\begin{pmatrix}
1 & 1 & 1 & 0 & 0 & 0 & 0 \\
1 & 1 & 1 & 1 & 1 & 0 & 0 \\
0 & 1 & 1 & 1 & 0 & 0 & 0 \\
0 & 1 & 1 & 1 & 1 & 1 & 0 \\
0 & 0 & 1 & 1 & 1 & 0 & 0 \\
0 & 0 & 0 & 1 & 1 & 1 & 1 \\
0 & 0 & 0 & 0 & 1 & 0 & 0 \\
\end{pmatrix}
$$
我们可以将这个矩阵的每一列乘上 $-1$ 再累加到后一列，我们发现这些操作对矩阵的行列式是没有影响的：

$$
\begin{pmatrix}
1 & 0 & 0 & -1 & 0 & 0 & 0 \\
1 & 0 & 0 &  0 & 0 &-1 & 0 \\
0 & 1 & 0 &  0 &-1 & 0 & 0 \\
0 & 1 & 0 &  0 & 0 & 0 &-1 \\
0 & 0 & 1 &  0 & 0 &-1 & 0 \\
0 & 0 & 0 &  1 & 0 & 0 & 0 \\
0 & 0 & 0 &  0 & 1 &-1 & 0 \\
\end{pmatrix}
$$
此时该矩阵属于有向图的关联矩阵，是全幺模矩阵，所以可以得到最优整数解。

同理，我们可以在开头进行若干次的随机扰动以实现期望线性。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ld double
#define N 1010
#define M 10010
const ld eps = 1e-8, inf = 1e9;
int n, m;
ld a[M][N];
std::mt19937 rnd(time(0));
void pivot(int l, int e) {
	ld t = a[l][e];
	a[l][e] = 1;
	for(int i = 0; i <= n; i ++) {
		a[l][i] /= t;
	}
	for(int i = 0; i <= m; i ++) if(i != l && abs(a[i][e]) > eps){
		t = a[i][e];
		a[i][e] = 0;
		for(int j = 0; j <= n; j ++) {
			a[i][j] -= a[l][j] * t;
		}
	}
}
void noise() {
	for(int i = 1; i <= 100; i ++) {
		int l = 0, e = 0;
		for(int i = 1; i <= m; i ++) {
			if((a[i][0] > eps || a[i][0] < -eps) && (!l || rnd() % 2 == 0)) {
				l = i;
			}
		}
		if(!l) break;
		for(int i = 1; i <= n; i ++) {
			if((a[l][i] > eps || a[l][i] < -eps) && (!e || rnd() % 2 == 0)) {
				e = i;
			}
		}
		if(!e) continue;
		pivot(l, e);
	}
}
void init() {
	while(1) {
		int l = 0, e = 0;
		for(int i = 1; i <= m; i ++) {
			if(a[i][0] < -eps && (!l || rnd() % 2)) l = i;
		}
		if(!l) break;
		for(int i = 1; i <= n; i ++) {
			if(a[l][i] < -eps && (!e || rnd() % 2)) e = i;
		}
		pivot(l, e);
	}
}
void simplex() {
	while(1) {
		int l = 0, e = 0;
		ld mn = inf;
		for(int i = 1; i <= n; i ++) {
			if(a[0][i] > eps) {
				e = i;
				break;
			}
		}
		if(!e) break;
		for(int i = 1; i <= m; i ++) {
			if(a[i][e] > eps && a[i][0] / a[i][e] < mn) {
				l = i;
				mn = a[i][0] / a[i][e];
			}
		}
		pivot(l, e);
	}
}
int main() {
	scanf("%d %d", &n, &m);
	for(int i = 1; i <= n; i ++) {
		scanf("%lf", &a[0][i]);
	}
	for(int i = 1; i <= m; i ++) {
		int s, t;
		scanf("%d %d %lf", &s, &t, &a[i][0]);
		for(int j = s; j <= t; j ++) {
			a[i][j] = 1.0;
		}
	}
	noise();
	init();
	simplex();
	printf("%.lf", -a[0][0]);
}
```

### [「ABC231H」Minimum Coloring](https://atcoder.jp/contests/abc231/tasks/abc231_h)

> 一个 $H \times W$ 的网格图，初始所有点都是白色的。
>
> 有 $N$ 个点可以被改变成黑色，这 $N$ 个点的坐标是 $a_i,b_i$，改变颜色的代价是 $c_i$。
>
> 你需要找到最小代价使得每行每列都至少有一个黑色节点。
>
> 数据保证有解。
>
> $1\leq N,H,W\leq10^3$

首先，我们设 $x_i=0/1$ 表示第 $i$ 个涂不涂。然后为了保证每一行都有，前 $h$ 个约束为第 $i$ 行所有的 $x$ 加起来大于等于 $1$；为了保证每一列都有，后 $w$ 个约束为第 $i-h$ 列所有的 $x$ 加起来大于等于 $1$。目标就是要求 $\sum x_ic_i$ 尽可能小。

对偶一下就可以了。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define N 2010
double eps = 1e-8, inf = 1e15;
ll h, w, n, m;
double a[N][N];
void pivot(ll l, ll e) {
	double t = a[l][e];
	a[l][e] = 1;
	for(ll i = 0; i <= m; i ++) {
		a[l][e] /= t;
	}
	for(ll i = 0; i <= n; i ++) if(i != l && abs(a[l][e]) > eps) {
		t = a[i][e], a[i][e] = 0;
		for(ll j = 0; j <= m; j ++) {
			a[i][j] -= t * a[l][j];
		}
	}
}
void simplex() {
	while(1) {
		ll l = 0, e = 0;
		double mn = inf;
		for(ll i = 1; i <= m; i ++) if(a[0][i] > eps) {
			e = i;
			break;
		}
		if(!e) break;
		for(ll i = 1; i <= n; i ++) if(a[i][e] > eps && a[i][0] / a[i][e] < mn) {
			l = i;
			mn = a[i][0] / a[i][e];
		}
		pivot(l, e);
	}
}
int main() {
	scanf("%lld %lld %lld", &h, &w, &n);
	m = h + w;
	for(ll i = 1; i <= n; i ++) {
		ll x, y, c;
		scanf("%lld %lld %lld", &x, &y, &c);
		a[i][0] = c;
		a[i][x] = 1;
		a[i][h + y] = 1;
	}
	for(ll i = 1; i <= m; i ++) {
		a[0][i] = 1;
	}
	simplex();
	printf("%.lf", -a[0][0]);
}
```

### [「SHOI2004」最小生成树](https://www.luogu.com.cn/problem/P4412)

> 给定一个 $n$ 点 $m$ 边的简单图，每条边将边权修改为 $w_i'\gets w_i+c$ 具有代价 $\|c\|$，给定简单图上的一棵生成树 $T$，要求最小的代价修改简单图上的每一个边权使得这颗生成树 $T$ 变为最小生成树。
>
> $1\le n\le 50,1\le m\le 1500$

对于一条非树边 $j$，它肯定跟若干条树边构成了一个环，那么这个非树边权值一定要大于等于环上的所有边。设其中一条是 $i$，我们有一个贪心的策略——减小 $i$ 的边权，增加 $j$ 的边权。

所以有：$w_i-x_i\le w_j+x_j$。

也就是 $w_i-w_j\le x_i+x_j$。目标是最小化 $x$ 的和。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define N 60
#define M 1510
const double eps = 1e-8, inf = 1e9;
mt19937 rnd(time(0));
ll n, m;
bool vis[N];
ll head[N], nxt[M * 2], to[M * 2], cnt;
ll road[N][N];
ll U[M], V[M], W[M];
void addEdge(ll u, ll v) {
	cnt ++;
	to[cnt] = v;
	nxt[cnt] = head[u];
	head[u] = cnt;
}
ll fa[N], dep[N];
void dfs(ll u) {
	for(ll i = head[u]; i; i = nxt[i]) {
		ll v = to[i];
		if(v == fa[u]) continue;
		fa[v] = u;
		dep[v] = dep[u] + 1;
		dfs(v);
	}
}
double a[M][M];
ll tot;
void pivot(ll l, ll e) {
	double t = a[l][e]; a[l][e] = 1;
	for(ll i = 0; i <= tot; i ++) {
		a[l][i] /= t;
	}
	for(ll i = 0; i <= m; i ++) if(i != l && abs(a[i][e]) > eps) {
		t = a[i][e]; a[i][e] = 0;
		for(ll j = 0; j <= tot; j ++) {
			a[i][j] -= t * a[l][j];
		}
	}
}
void init() {
	while(1) {
		ll l = 0, e = 0;
		for(ll i = 1; i <= m; i ++) {
			if(a[i][0] < -eps && (!l || rnd() % 2 == 0)) {
				l = i;
			}
		}
		if(!l) break;
		for(ll i = 1; i <= tot; i ++) {
			if(a[l][i] < -eps && (!e || rnd() % 2 == 0)) {
				e = i;
			}
		}
		pivot(l, e);
	}
}
void simplex() {
	while(1) {
		ll l = 0, e = 0;
		double mn = inf;
		for(ll i = 1; i <= tot; i ++) {
			if(a[0][i] > eps) {
				e = i;
				break;
			}
		}
		if(!e) break;
		for(ll i = 1; i <= m; i ++) {
			if(a[i][e] > eps && a[i][0] / a[i][e] < mn) {
				l = i;
				mn = a[i][0] / a[i][e];
			}
		}
		pivot(l, e);
	}
}
int main() {
	scanf("%lld %lld", &n, &m);
	for(ll i = 1; i <= m; i ++) {
		scanf("%lld %lld %lld", &U[i], &V[i], &W[i]);
		road[U[i]][V[i]] = road[V[i]][U[i]] = i;
	}
	for(ll i = 1; i < n; i ++) {
		ll u, v;
		scanf("%lld %lld", &u, &v);
		addEdge(u, v);
		addEdge(v, u);
	}
	dfs(1);
	for(ll i = 1; i <= m; i ++) {
		ll u = U[i], v = V[i];
		a[i][0] = 1;
		while(u != v) {
			if(dep[u] < dep[v]) swap(u, v);
			ll x = u;
			u = fa[u];
			if(W[road[x][u]] > W[i]) {
				// W[road[x][u]] - x[road[x][u]] <= W[i] + x[i]
				// x[i] + x[road[x][u]] >= W[road[x][u]] - W[i]
				a[0][++ tot] = W[road[x][u]] - W[i];
				a[i][tot] = 1;
				a[road[x][u]][tot] = 1;
			}
		}
	}
	init();
	simplex();
	if(a[0][0] > -eps && a[0][0] < eps) printf("0");
	else printf("%.lf", -a[0][0]);
}
```

### [「CF1430G」Yet Another DAG Problem](https://codeforces.com/problemset/problem/1430/G)

> 给定一个 $n$ 点 $m$ 边的有向无环图，每条边都有 $w_i$ 的权重，给每个点分配权值 $a_i$，对于每条连接 $(u,v)$ 的边，定义其权值为 $b_i=a_u-a_v$，要求：
>
> 1. $b_i>0$
>
> 2. $\sum w_ib_i$ 最小
>
> 请输出一种分配方案。
>
> $1\le n\le 18,1\le m\le n(n-1)/2$

这里 $b_i>0$ 看似不是线性规划，实际上因为 $b$ 为整数，所以同等于 $b_i\ge 1$。每条边可以被描述为限制 $1a_u+-1a_v\ge1$。$\min \sum w_ib_i$ 可以被拆分为 $\min\sum(w_i a_u+-w_i a_v)$，然后单纯形做就好了。

因为要求每一个点的取值，所以我不用对偶，直接将每一项系数乘以 $-1$ 也可以达到同样的效果。

有向图的关联矩阵是全幺模矩阵，所以最优解是整数的。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define db long double
#define N 20
#define M 400
const db inf = 1e9, eps = 1e-8;
ll n, m;
db a[M][N], ans[N];
ll r[N + M];
mt19937 rnd(114514191);
void pivot(ll l, ll e) {
	swap(r[n + l], r[e]);
	db t = a[l][e];
	a[l][e] = 1;
	for(ll i = 0; i <= n; i ++) {
		a[l][i] /= t;
	}
	for(ll i = 0; i <= m; i ++) if(i != l && abs(a[i][e]) > eps) {
		t = a[i][e]; a[i][e] = 0;
		for(ll j = 0; j <= n; j ++) {
			a[i][j] -= t * a[l][j];
		}
	}
}
void init() {
	while(1) {
		ll l = 0, e = 0;
		for(ll i = 1; i <= m; i ++) {
			if(a[i][0] < -eps && (!l || rnd() % 2)) {
				l = i;
			}
		}
		if(!l) break;
		for(ll i = 1; i <= n; i ++) {
			if(a[l][i] < -eps && (!e || rnd() % 2)) {
				e = i;
			}
		}
		pivot(l, e);
	}
}
void simplex() {
	while(1) {
		ll l = 0, e = 0;
		db mn = inf;
		for(ll i = 1; i <= n; i ++) {
			if(a[0][i] > eps) {
				e = i;
				break;
			}
		}
		if(!e) break;
		for(ll i = 1; i <= m; i ++) {
			if(a[i][e] > eps && a[i][0] / a[i][e] < mn) {
				l = i;
				mn = a[i][0] / a[i][e];
			}
		}
		pivot(l, e);
	}
}
int main() {
	scanf("%lld %lld", &n, &m);
	for(ll i = 1; i <= m; i ++) {
		ll u, v, w;
		scanf("%lld %lld %lld", &u, &v, &w);
		a[i][u] = -1;
		a[i][v] = 1;
		a[i][0] = -1;
		a[0][u] -= w;
		a[0][v] += w;
	}
	for(ll i = 1; i <= n; i ++) {
		r[i] = i;
	}
	init();
	simplex();
	for(ll i = 1; i <= m; i ++) {
		ans[r[n + i]] = a[i][0];
	}
	for(ll i = 1; i <= n; i ++) {
		printf("%.Lf ", ans[i]);
	}
}
```

## 参考资料

- [线性规划-单纯形算法详解 \| 细语呢喃](https://www.hrwhisper.me/introduction-to-simplex-algorithm/)
- [数学规划（3）单纯形法的进一步讨论](https://zhuanlan.zhihu.com/p/680244753)
- [线性规划 \| Daltao's blog!](https://taodaling.github.io/blog/2019/06/27/%E7%BA%BF%E6%80%A7%E8%A7%84%E5%88%92/)