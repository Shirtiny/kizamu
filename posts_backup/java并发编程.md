---
title: java多线程
date: 2019-09-11 22:19:06
tags:
  - java
  - 多线程
categories: 并发编程
---

# JMM

可以看到没有volatile关键字时，线程1依然没有跳出循环，可见性

总线加锁

MESI缓存一致性协议，当修改后的数据经过总线时，cpu的其他线程通过总线嗅探机制，感知到数据已修改，然后把自己工作内存的数据失效，然后从主内存中再读进来
