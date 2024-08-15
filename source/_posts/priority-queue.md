---
title: 手写堆
date: 2024-08-15 22:14:07
tags: [OI]
categories: [OI]
---

最近打GMOJ老是被卡常，发现确实还需要备一个堆的模板，因为太懒了：

```cpp
struct Priority_queue {
	pair<ll, ll> a[N];
	int siz;
	void yh(int &s){if(s<siz&&a[s+1]>a[s])s++;}
	void dnn(int &x,int &s){swap(a[s],a[x]),x=s,s=x*2;}
	void up(int x){while(x>1)if(a[x/2]<a[x])swap(a[x],a[x/2]),x/=2;else break;}
	void dn(int x){int s=x*2;while(s<=siz){yh(s);if(a[s]>a[x])dnn(x,s);else break;}}
	void push(pair<ll, ll> x){a[++siz]=x;up(siz);}
	void pop(){a[1]=a[siz--];dn(1);}
	bool empty(){return !(bool)siz;}
	pair<ll, ll> top(){return a[1];}
} que;
```

把上面的 `pair<ll, ll>` 替换为堆的类型即可。