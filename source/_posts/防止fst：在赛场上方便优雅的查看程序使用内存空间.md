---
title: 防止fst：在赛场上方便优雅的查看程序使用内存空间
date: 2024-10-10 12:14:28
tags: [OI, 比赛]
---

我没有在重大比赛 mle 过，但是我有一些朋友因为 mle 爆零了。

所以 csp 将至，有必要学习一下。

---

有时间当然是用 [Arbiter](https://oi-wiki.org/tools/judger/arbiter/) 测试啦，无论准确度还是放心程度都是最高的。

当然我们可以使用 `/bin/time` 命令，执行命令 `/bin/time -v -p [PROGRAM]` 即可，`[PROGRAM]` 替换成你的程序。如果出现 `permission denied` 是没有设置好读写权限，直接 `sudo chmod -R 777`。

`Maximum resident set size` 就是峰值 RAM 使用量。

