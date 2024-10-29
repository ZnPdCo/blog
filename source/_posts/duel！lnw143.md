---
title: duel！lnw143
date: 2024-10-29 21:27:41
tags: 
mathjax: true
---

Z 为我胜，L 为 lnw 胜。

## [Problem - 526C - Codeforces](https://codeforces.com/problemset/problem/526/C) [Z](http://www.ealex.top/duel/duel/7110/)

看到感觉和之前某一道 ABC E 很相像，就是枚举红色吃多少个，然后计算代价，因为代价计算公式是有一个下取整的，猜测大体是单调的，但是局部内不是单调的，所以直接枚举前后两个段就可以了。然后发现 $W_r$ 不像 AT 那道题一样很小，所以随便枚举 $[0, 10^6]$ 和 $[C/W_r-10^6,C/W_r]$ 一段。

发现跑过了非常多的点，大概50多个点才wa，觉得已经和正解很近了。查看 wa 的点，发现是：

```
999999999 10 499999995 2 99999999
```

嗯，也就是说把 $r$ 和 $b$ swap 一下再做一遍就可以了？

交上去就过了。

```cpp
#include <bits/stdc++.h>
#define ll long long
using namespace std;
ll c, hr, hb, wr, wb, ans;
ll calc(ll x) {
    ll use = x * wr;
    if(use > c) return 0;
    ll less = c - use;
    ll y = less / wb;
    ans = max(ans, x * hr + y * hb);
    return x * hr + y * hb;
}
void run(ll l, ll r) {
    l = max(l, 0LL);
    r = min(r, c);
    for(ll i = l; i <= r; i++) {
        ans = max(ans, calc(i));
    }
}
int main() {
    cin >> c >> hr >> hb >> wr >> wb;
    run(0, 1000000);
    run(c / wr - 1000000, c / wr + 1);
    run(c / wb - 1000000, c / wb + 1);
    run(wr - 1000000, wr + 1000000);
    run(wb - 1000000, wb + 1000000);
    swap(hr, hb);
    swap(wr, wb);
    run(0, 1000000);
    run(c / wr - 1000000, c / wr + 1);
    run(c / wb - 1000000, c / wb + 1);
    run(wr - 1000000, wr + 1000000);
    run(wb - 1000000, wb + 1000000);
    printf("%lld\n", ans);
}
```

看了题解发现和 AT 那道题什么关系都没有。考虑若吃红糖 $i$ 颗，那么吃蓝糖 $(c-iw_r)/w_b$ 颗。所以直接根号暴力即可，红糖做 $\sqrt c$ 个，蓝糖做 $\sqrt c$ 个，时间复杂度 $O(\sqrt c)$。

## [Problem - 1851F - Codeforces](https://codeforces.com/problemset/problem/1851/F) [L](http://www.ealex.top/duel/duel/7139/)

赛时翻译软件炸掉了，把火星数的定义弄消失了，结果没看懂题……

好了不推卸责任，容易想到 01 trie，然后直接去做。

其实也可以做，但是比较麻烦。有一个简单的做法：

可以发现本题中如果两数在一位下两两不同，那么最终答案这一位下肯定为 0，否则就可以为 1，想到这里本题就很简单了，找到异或和最小的二元组即可，不过需要一点贪心处理，那就是排完序就可以线性复杂度求异或和最小的二元组了。

赛后死在异或运算优先级比比较优先级低。

```cpp
#include <bits/stdc++.h>
#define N 2000010
using namespace std;
#define ll long long
ll T;
ll n, k;
struct node {
    ll idx, val;
} a[N];
void solve() {
    cin >> n >> k;
    for(int i = 1; i <= n; i ++) {
        cin >> a[i].val;
        a[i].idx = i;
    }
    sort(a + 1, a + n + 1, [](node a, node b) {
        return a.val < b.val;
    });
    // for(int i = 1; i <= n; i ++) {
    //     cerr << a[i].val << " ";
    // }
    // cerr << endl;
    ll ans = 1e18, x, y, anss;
    for(int i = 1; i < n; i ++) {
        if((a[i].val ^ a[i + 1].val) < ans) {
            ans = a[i].val ^ a[i + 1].val;
            x = a[i].idx;
            y = a[i + 1].idx;
            anss = ((1<<k) - 1) ^ (a[i].val | a[i + 1].val);
        }
    }
    cout << x << " " << y << " " << anss << endl;
}
int main() {
    cin >> T;
    while(T --) {
        solve();
    }
}
```

