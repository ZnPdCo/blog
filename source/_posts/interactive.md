---
title: 使用 python 的 subprocess 模块实现多平台的 stdio 交互题对拍
date: 2024-07-27 17:42:49
tags: [python, OI, 原创]
thumbnail: https://znpdco.github.io/blogimage/interactive/thumbnail.webp
categories: [OI]
mathjax: true
---

最近苦于 stdio 交互题的对拍，发现网上没有多少相关的文章。我自己处理的方法是把 stdio 交互题改造为函数式交互题。虽然解决了问题，但是还是比较繁琐。

在此之后，我看到了一篇文章 [交互题本机评测器 - Sshwy's Notes](https://notes.sshwy.name/Interactive-Prob-Judger/)，这是在 linux 下的实现，虽然可以解决问题，但是还是不能在 Windows 下方便地使用。

但是它使用管道通信的方法给了我很大的启发，而 python 的 subprocess 模块提供了一种多平台管道通信的实现方法。

下面是我用 python 的 subprocess 模块实现的 stdio 交互题对拍器：

```python
import sys
import subprocess
from threading import Thread

def judger(argv):
    if len(argv) != 3:
        print(f"Usage: {argv[0]} [command1] [command2]", file=sys.stderr)
        return 1
    
    command1 = argv[1]
    command2 = argv[2]

    def run_command(p1, p2):
        while True:
            line = p2.stdout.readline()
            if not line:
                break
            p1.stdin.write(line)
            p1.stdin.flush()

    p1 = subprocess.Popen(command1, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    p2 = subprocess.Popen(command2, stdin=subprocess.PIPE, stdout=subprocess.PIPE)

    t1 = Thread(target=run_command, args=(p1, p2))
    t2 = Thread(target=run_command, args=(p2, p1))

    t1.start()
    t2.start()

    p1.wait()
    p2.wait()

    return 0

if __name__ == "__main__":
    sys.exit(judger(sys.argv))
```

使用方法：

```bash
$ cd demo
$ g++ ./problem.cpp -o ./problem
$ g++ ./grader.cpp -o ./grader
$ python ../interactive.py ./problem ./grader
? 258
0    
? 129
0    
? 65 
1    
? 97 
1    
? 113
1    
? 121
0
? 117
0
? 115
0
? 114
1
! 114
AC
$ 
```

在 Github 上的链接：[Github](https://github.com/znpdco/interactive)。