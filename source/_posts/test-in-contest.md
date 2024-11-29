---
title: 考场上自测与快速配置Arbiter
mathjax: true
date: 2024-11-29 09:07:35
tags:
---

## 1.在虚拟机下编译运行所有程序（必选）

在比赛还剩1小时到半小时时，停止写代码（按照规划，应该在前面就把暴力写完了），打开虚拟机进行自测。

虚拟机打开方式因考场而异，大部分考场配置了拖放功能。但拖放有要领：

1. **不能拖放到桌面！**会失败。
2. 打开一个文件夹，**保证这个文件夹窗口置于虚拟机的最上方！**，将整个文件夹拖入虚拟机。

如果无法拖放，可以尝试将文件复制进去。

打开终端进行操作。

使用编译指令（一般来说，是 `g++ ***.cpp -o *** -std=c++14 -O2 -static`）将每个文件编译。

将输入文件重命名为 `***.in`（`cp ex_***1.in ***.in`）。

运行程序。这里需要测时空的话，可以：

```
/bin/time -p -v ./***
```

`Maximum resident set size (kbytes)` 的值就是空间的字节数。

**注意**：这个值是你用多少测多少，不是你开多少测多少，小心！！

如果你想要测你开多少测多少，可以在码代码时在开头添加 `bool ST;` 结尾添加 `bool ED;`，然后 `cerr << (&ST-&ED)/1024.0/1024.0 << endl;`。

## 使用 sanitize 测 ub（尽量选）

使用 `-fsanitize=undefined,address`（开了就不能开 `-static`）编译（记不住没关系，打个类似的会提示你的：`g++: error: unrecognized command line option ‘-fsaniti’; did you mean ‘-fsanitize=’?`）然后运行程序，如果出现越界访问之类的会报错：

<pre><font color="#CC0000"><b>==6840==ERROR: AddressSanitizer: global-buffer-overflow on address 0x5625875f49f0 at pc 0x5625875eb455 bp 0x7ffd33f7dbf0 sp 0x7ffd33f7dbe0</b></font>
<font color="#3465A4"><b>WRITE of size 8 at 0x5625875f49f0 thread T0</b></font>
    #0 0x5625875eb454 in main (/home/noi/players/day1/GD-0001/mod/mod+0x3454)
    #1 0x7f8187c45082 in __libc_start_main ../csu/libc-start.c:308
    #2 0x5625875eb2cd in _start (/home/noi/players/day1/GD-0001/mod/mod+0x32cd)
Address 0x5625875f49f0 is a wild pointer.
SUMMARY: AddressSanitizer: global-buffer-overflow (/home/noi/players/day1/GD-0001/mod/mod+0x3454) in main
Shadow bytes around the buggy address:
  0x0ac530eb68e0: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
  0x0ac530eb68f0: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
  0x0ac530eb6900: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
  0x0ac530eb6910: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
  0x0ac530eb6920: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
=&gt;0x0ac530eb6930: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>[<font color="#CC0000"><b>f9</b></font>]<font color="#CC0000"><b>f9</b></font>
  0x0ac530eb6940: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
  0x0ac530eb6950: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
  0x0ac530eb6960: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
  0x0ac530eb6970: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
  0x0ac530eb6980: <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font> <font color="#CC0000"><b>f9</b></font>
Shadow byte legend (one shadow byte represents 8 application bytes):
  Addressable:           00
  Partially addressable: 01 02 03 04 05 06 07 
  Heap left redzone:       <font color="#CC0000"><b>fa</b></font>
  Freed heap region:       <font color="#75507B"><b>fd</b></font>
  Stack left redzone:      <font color="#CC0000"><b>f1</b></font>
  Stack mid redzone:       <font color="#CC0000"><b>f2</b></font>
  Stack right redzone:     <font color="#CC0000"><b>f3</b></font>
  Stack after return:      <font color="#75507B"><b>f5</b></font>
  Stack use after scope:   <font color="#75507B"><b>f8</b></font>
  Global redzone:          <font color="#CC0000"><b>f9</b></font>
  Global init order:       <font color="#06989A"><b>f6</b></font>
  Poisoned by user:        <font color="#3465A4"><b>f7</b></font>
  Container overflow:      <font color="#3465A4"><b>fc</b></font>
  Array cookie:            <font color="#CC0000"><b>ac</b></font>
  Intra object redzone:    <font color="#C4A000"><b>bb</b></font>
  ASan internal:           <font color="#C4A000"><b>fe</b></font>
  Left alloca redzone:     <font color="#3465A4"><b>ca</b></font>
  Right alloca redzone:    <font color="#3465A4"><b>cb</b></font>
  Shadow gap:              cc
==6840==ABORTING
</pre>

## 使用 arbiter 测试（可选）

这个是最后一步，应当在考前熟悉，最后20分钟进行测试。

arbiter 有几个注意点：

1. 不会告诉你有什么问题，要自己找；
2. 不断按保存！
3. 比较方式不要选择全文比较，按照题目输出来比较，不然有bug；
4. 你勾选选手的时候要点那个编号不是那个复选框！不然勾不到！