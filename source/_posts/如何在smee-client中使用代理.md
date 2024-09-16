---
title: 如何在smee-client中使用代理
date: 2024-09-16 10:57:39
tags:
---

最近在调试 webhook 使用了 smee，但是 smee 不支持使用代理，而 smee.io 国内连接也不好，所以会报错：

```
Event { type: 'error', message: 'connect ETIMEDOUT 20.119.128.0:443' }
Event { type: 'error', message: 'connect ETIMEDOUT 20.119.128.0:443' }
Event { type: 'error', message: 'connect ETIMEDOUT 20.119.128.0:443' }
Event { type: 'error', message: 'connect ETIMEDOUT 20.119.128.0:443' }
```

我们可以通过修改源码来解决这个问题：

下载 `smee-client`：

```
npm install smee-client --save
```

编写下面的 smee 启动代码：

```
const SmeeClient = require('smee-client')

const smee = new SmeeClient({
  source: 'https://smee.io/<yourkey>',
  target: 'http://localhost:3000/events',
  logger: console
})

const events = smee.start()

process.on('SIGINT', function() {
	events.close()
});
```

保存为 `start.js`，打开 `node_modules/smee-client/index.js`，找到 `const events = new eventsource_1.default(this.source);` 这一行，修改添加代理：

```
const events = new eventsource_1.default(this.source, {proxy: 'http://127.0.0.1:7890'});
```

然后就可以连接成功了：

```
Connected https://smee.io/<yourkey>
```

