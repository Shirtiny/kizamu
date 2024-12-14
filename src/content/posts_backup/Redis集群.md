---
title: Redis集群
date: 2019-08-18 16:30:00
tags:
  - Redis
  - Linux
categories: 学习经验
---

# Redis集群搭建

**集群描述**

Redis集群至少需要奇数个主节点，因为需要投票的方式来确认某一节点的运行状况。每个主节点需要有个备份节点，提高容错。所以，假设有3个主节点，1主2从，主只写数据，从只读数据，加上备份则需要6个节点来完成集群，所以集群最少为6个。

<!-- more -->

**主从关系**

一般1主2从，主服务器读写，从服务器只读，内部会进行数据同步。

主机关机，从服务器依然是从，无法写数据。

从服务器重启后，需要重新建立主从关系。

**哨兵**

准备多台哨兵，询问主从服务器是否宕机，持续问答，心跳检查。若大多数哨兵判定主服务器无响应，便在从服务器中选出一个做主服务器，投票决定结果，若主服务器再回来，会把它设为从服务器。从服务器宕机不做什么事，不过从服务器启动时，自动设置从服务器主从关系。

主观下线：哨兵视角，看到目标服务器下线。

客观下线：实际情况，由哨兵们投票确定。

## 环境准备

**ruby环境**

redis集群管理工具redis-trib.rb依赖ruby环境，首先需要安装ruby环境。

```shell
#使用yum之前，记得更新一下yum
yum -y update
#安装ruby
yum install ruby
yum install rubygems
```

**安装ruby和redis的接口程序**

把[redis-3.0.0.gem](http://server.shirtiny.cn/file/redis-3.0.0.gem)传到服务器，然后拷贝redis-3.0.0.gem至/usr/local文件夹下。

```shell
gem install /usr/local/redis-3.0.0.gem
```

## 集群创建

因为本人没必要租6个服务器或创建6个虚拟机，这里使用6个Redis实例，同一台服务器用不同的端口表示不同的redis服务器来模拟集群。

- 模拟6个redis服务器，有6个redis服务器的话，只需在配置文件开启集群模式，然后运行脚本即可。

  将redis安装目录bin下的文件拷贝到每个700X目录内，同时将redis源码目录src下的**redis-trib.rb**拷贝到redis-cluster目录下。

```shell
#创建一个文件夹，用于存放6个redis实例
mkdir /usr/local/redis-cluster
##依次复制并创建6个文件夹，分别存放对应redis节点
cp -r /usr/local/redis/bin /usr/local/redis-cluster/7001
cp -r /usr/local/redis/bin /usr/local/redis-cluster/7002
cp -r /usr/local/redis/bin /usr/local/redis-cluster/7003
cp -r /usr/local/redis/bin /usr/local/redis-cluster/7004
cp -r /usr/local/redis/bin /usr/local/redis-cluster/7005
cp -r /usr/local/redis/bin /usr/local/redis-cluster/7006
#同时将redis源码目录src下的redis-trib.rb拷贝到redis-cluster目录下。
cp /usr/local/redis-5.0.5/src/redis-trib.rb /usr/local/redis-cluster
```

修改每个节点目录下的redis.conf配置文件

把port 改为对应的端口号、bind 设为 0.0.0.0、cluster-enabled 设为yes（#去掉）。

tips：`/`是搜索

```shell
#修改每个节点目录下的redis.conf配置文件
vi /usr/local/redis-cluster/7001/redis.conf
vi /usr/local/redis-cluster/7002/redis.conf
vi /usr/local/redis-cluster/7003/redis.conf
vi /usr/local/redis-cluster/7004/redis.conf
vi /usr/local/redis-cluster/7005/redis.conf
vi /usr/local/redis-cluster/7006/redis.conf
```

修改完成后，依次开启每个节点，然后运行集群脚本。

```shell
#依次开启每个节点
/usr/local/redis-cluster/7001/src/redis-server /usr/local/redis-cluster/7001/redis.conf

/usr/local/redis-cluster/7002/src/redis-server /usr/local/redis-cluster/7002/redis.conf

/usr/local/redis-cluster/7003/src/redis-server /usr/local/redis-cluster/7003/redis.conf

/usr/local/redis-cluster/7004/src/redis-server /usr/local/redis-cluster/7004/redis.conf

/usr/local/redis-cluster/7005/src/redis-server /usr/local/redis-cluster/7005/redis.conf

/usr/local/redis-cluster/7006/src/redis-server /usr/local/redis-cluster/7006/redis.conf
#查看运行状态
ps -ef | grep redis
#开放防火墙
firewall-cmd --zone=public --add-port=7005/tcp --permanent
#...
```

- 运行脚本集群

```shell

/usr/local/redis-cluster/redis-trib.rb create  --replicas 1 192.168.1.103:7001 192.168.1.103:7002 192.168.1.103:7003 192.168.1.103:7004 192.168.1.103:7005 192.168.1.103:7006

redis-cli --cluster create 192.168.1.103:7001 192.168.1.103:7002 192.168.1.103:7003 192.168.1.103:7004 192.168.1.103:7005 192.168.1.103:7006 --cluster-replicas 1

```

## 集群操作

```shell
#其中-c表示以集群方式连接redis，-h指定ip地址，-p指定端口号
./redis-cli -c -h 192.168.1.103:7001 -p 7001
# 查询集群结点信息
cluster nodes
```

**添加节点**

```shell
./redis-trib.rb add-node  192.168.1.103:7007 192.168.1.103:7001
```

**hash槽分配**

redis集群有16384个槽，集群中的每个结点分配自已槽，通过查看集群结点可以看到槽占用情况。

- 连接上集群

```shell
#连接集群中任意一个可用结点都行
./redis-trib.rb reshard  192.168.1.103:7001
```

- 输入要分配的槽数量

  ![](https://file.moetu.org/images/2019/08/18/6b8b53dbc9b2f4efad566fbbcb5cf37b39980dce21557c53.png)

- 输入接收槽的结点id

  通过cluster nodes查看7007结点id为15b809eadae88955e36bcdbb8144f61bbbaf38fb

  ![](https://file.moetu.org/images/2019/08/18/540b9ecf3d0eddff90c4d0e8d0b4572021e697456a6135e1.png)

  输入：

  ```shell
  15b809eadae88955e36bcdbb8144f61bbbaf38fb
  ```

- 输入源结点id，这里输入all

![](https://file.moetu.org/images/2019/08/18/c27bd7a4a67a06b1b3d8b23360109629f3ca88d1787c602e.png)

- 输入yes开始移动槽到目标结点id

![](https://file.moetu.org/images/2019/08/18/683bd26643f23fd77fe9ef0d985a635d26957e1d5a50787a.png)

**添加从节点**

添加7008从结点，将7008作为7007的从结点。

```shell
#主节点id 添加节点的ip和端口 集群中已存在节点ip和端口
./redis-trib.rb add-node --slave --master-id
```

执行：

```shell
#cad9f7413ec6842c971dbcc2c48b4ca959eb5db4  是7007结点的id，可通过cluster nodes查看。
./redis-trib.rb add-node --slave --master-id cad9f7413ec6842c971dbcc2c48b4ca959eb5db4  192.168.101.3:7008 192.168.101.3:7001
```

![](https://file.moetu.org/images/2019/08/18/e1c3380e5314845905a89b66f4c7b1408e30b7f79d730218.png)

**tips:**

如果原来该结点在集群中的配置信息已经生成cluster-config-file指定的配置文件中（如果cluster-config-file没有指定则默认为nodes.conf），这时可能会报错：

> [ERR] Node XXXXXX is not empty. Either the node already knows other nodes (check with CLUSTER NODES) or contains some key in database 0

解决方法是删除生成的配置文件nodes.conf，删除后再执行**./redis-trib.rb add-node**指令。

**删除节点**

```shell
./redis-trib.rb del-node 127.0.0.1:7005 4b45eb75c8b428fbd77ab979b85080146a9bc017
```

删除已经占有hash槽的结点会失败，报错如下：

> [ERR] Node 127.0.0.1:7005 is not empty! Reshard data away and try again.

需要将该结点占用的hash槽分配出去。
