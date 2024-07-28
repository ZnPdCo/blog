---
title: 如何在忘记密码的情况下设置 Ubuntu 系统的密码
date: 2024-07-28 10:48:12
tags: [Ubuntu, Linux]
categories: [Linux]
mathjax: true
---

最近忘记了电脑上虚拟机里的 Ubuntu 系统的密码，于是想着如何在忘记密码的情况下设置密码。

在开机后长按 shift 键，转到 grub 菜单。

选择“Advanced options for Ubuntu”，进入高级菜单。

在这里，你可以看到进入恢复模式的选项：“Ubuntu, with Linux 4.13.0-12-generic (recovery mode)”（前面是什么不要紧，一定要有后面的“recovery mode”）。

之后将进入黑屏，并快速显示几行输出。在这里等待几秒钟。

在这里有不同的恢复模式选项，选择 “Root – Drop to root shell prompt”。

然后下面便会出现一个命令行，按 Enter 即可进入。

我们需要具有根分区的写入权限。默认情况下，它具有只读访问权限。

使用以下命令获得写权限：

```bash
mount -rw -o remount /
```

然后执行以下命令查看所有的用户：

```bash
ls /home
```

选择你需更改密码的用户，执行：

```bash
passwd username
```

然后就可以更改密码啦。

执行以退出：

```bash
exit
```

最后选择恢复菜单的 “resume – Resume normal boot” 启动系统。

将会出现有关图形模式兼容性的警告。不用担心。直接 OK 就可以了。

---

如果重置 Ubuntu 密码这么简单，这不是一个安全风险吗？

其实不然，我们认为 Ubuntu 安全是因为我们远程连接时很难更改它的密码。而当我们接触到实体机时，我们认为就算没有更改密码 Ubuntu 也是不安全的了，因为我们可以使用更改启动盘来实现破解密码——除非我们将硬盘加密。