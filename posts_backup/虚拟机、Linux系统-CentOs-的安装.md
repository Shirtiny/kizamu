---
title: 虚拟机、Linux系统(CentOs)的安装
date: 2019-08-03 14:39:14
tags:
  - 开发知识
  - Linux系统
  - 虚拟机
categories: 学习经验
---

# 虚拟机、Linux系统

**环境准备：**

- 虚拟机工具：[VMwear安装包](https://pan.baidu.com/s/1eg7JeuxrMgW7ylbKrU2dtg)【提取码：8k77】
- Linux系统：[CentOS7镜像](http://mirrors.aliyun.com/centos/7.6.1810/isos/x86_64/)

<!-- more -->

# 1. 安装虚拟机

### 1.1. 安装VMwear

运行VMwear安装包，过程很简单。

### 1.2. 创建虚拟机

1. VMwear安装完成后，**打开**它:

![](https://file.moetu.org/images/2019/08/03/364b18798861d29bc6cfc97e3eaae27d7e4ccd411d4426e0.png)

2. 选择创建新的虚拟机，若选典型会自动为新手配置一些东西，这里选**自定义**：

![](https://file.moetu.org/images/2019/08/03/a780cc193118ac83b4a7f66370e424ee59619f7d0f14d771.png)

3. **兼容性**问题，VMwear是高版本兼容低版本的，低版本不兼容高版本，这里选当前VMwear的版本就好，我给的资源版本号是12：

![](https://file.moetu.org/images/2019/08/03/0708fb79c9cad33809640705cacf34f41f4d7a25483e7e43.png)

4. 下一步，选**稍后安装系统**：

![](https://file.moetu.org/images/2019/08/03/618e96d8d1ae5d5a926b65f56aff323a71d99b086ca00ff8.png)

5. 选择**Linux系统**，版本是**CentOs 64位**：

![](https://file.moetu.org/images/2019/08/03/8a3f2bb93d26bfd6beb11d7647615891c7f401546d6a2308.png)

6. **为虚拟机指定名称和位置**，我新建了一个目录来存放，方便自己以后查找：

![](https://file.moetu.org/images/2019/08/03/e882f4a780b4e6d42bce3f60c1e31a29133c98d3451a3b80.png)

![](https://file.moetu.org/images/2019/08/03/24a6d50944f83f18e76c3e3fcc28d0bd0c28f2523a3cfe08.png)

7. 根据自己的实际需求来**分配cpu**，以后使用中CPU不够的话可以加，这里我选的11：

![](https://file.moetu.org/images/2019/08/03/8f27baac76076f05e15f7c8020f76ea642a9ce6b8e92198c.png)

8. **分配内存**，要考虑到本机的空闲内存：

我计算机是8G内存，日常使用中，除开系统占用，开了几个浏览器、视频，只剩余了3G内存。

![](https://file.moetu.org/images/2019/08/03/d756733e6bdd83c74b2c551423829ef58084f559a6f8c652.png)

又考虑到会模拟多台服务器的运行，所以分配内存不能太大，也不能过低。

我选的1G内存，装了半天的系统，不过没关系，后面在设置里可以改的。

![](https://file.moetu.org/images/2019/08/03/34859c4f1b741115b5f82896e29e50a43f7f650bdde9a97c.png)

9. 选择网络类型，这里选**桥接**：

![](https://file.moetu.org/images/2019/08/03/b8417164a91ce2dbdec6323d9810f2598f86cad5df60715b.png)

**tips：**

桥接：选择桥接模式的话虚拟机和宿主机在网络上就是平级的关系，相当于连接在同一交换机上。

NAT：NAT模式就是虚拟机要联网得先通过宿主机才能和外面进行通信。

仅主机：虚拟机与宿主机直接连起来

![img](https://file.moetu.org/images/2019/08/03/d7bdc1ca1e7267f9c6f9936461fb680e41fdbd6741f3c156.png)

10. I/O控制器类型&和磁盘类型选**默认**的即可：

![](https://file.moetu.org/images/2019/08/03/dbfb8e60a211d5768a877dd7652ce1bfb1e0f93d7f9f1847.png)

![](https://file.moetu.org/images/2019/08/03/9809a9e60c390f7a0a4f480c9880a5ac2cbf326e30b7dcc9.png)

11. 由于是第一次使用虚拟机，选择**创建新的虚拟磁盘**：

![](https://file.moetu.org/images/2019/08/03/32845f65cb2c6af4d51b1f5c2492948d584931cc554d7383.png)

12. 磁盘空间分配：

![](https://file.moetu.org/images/2019/08/03/0b88455d12b5dc8e5253f1884c049e81993032907540c751.png)

我在VMwear下新建了一个VsFile文件夹，用来保存虚拟磁盘的文件：

![](https://file.moetu.org/images/2019/08/03/ed6e65efed5f1e081bab52affb404be951316d0aa4d405b1.png)

**tips:**

磁盘容量暂时分配50G即可后期可以随时增加，不要勾选立即分配所有磁盘，否则虚拟机会将50G直接分配给CentOS，会导致宿主机所剩硬盘容量减少。

勾选将虚拟磁盘拆分成多个文件，这样可以使虚拟机方便用储存设备拷贝复制。

13. 自定义硬件：

![](https://file.moetu.org/images/2019/08/03/5804ad7e60df9f038a9816254a71092317c9e0d34e6e7d83.png)

移除不需要的硬件，如声卡、打印机。

然后点击**完成**，即可创建一个虚拟机。

## 2. 安装Linux系统(CentOs)

### 2.1. 连接光盘

右击刚创建的虚拟机，选择设置，选择下载好的CentOS映像，注意勾选**启动时链接**

![](https://file.moetu.org/images/2019/08/03/6072c363f65f5574e9361792e1ad5f34f89d69fb1b93c998.png)

### 2.2. 运行虚拟机

虚拟机创建完成后，点**开启此虚拟机**即可。

![](https://file.moetu.org/images/2019/08/03/4b51ebbbb2fc45904bfbedb7ee90c59aa754e2f5e31771fe.png)

### 2.3. 安装系统

1. 安装向导

启动后会看到以下选项：

1. Install CentOS 7 安装CentOS 7
2. Test this media & install CentOS 7 测试安装文件并安装CentOS 7
3. Troubleshooting 修复故障

![](https://file.moetu.org/images/2019/08/03/1d109f1658484251800f2820484c542e8ebec1f1dc34e6ea.png)

选择选项：Install CentOS 7，回车。

- 选择语言English、时间、时区，这个按自己需要选，不再赘述。

- 在Software selection里面选Server with GUI，然点左上角的done，就行了。

![](https://file.moetu.org/images/2019/08/03/b99fc02f2d971241a82368cbd2c0e04a289f0c95bcf5eeda.png)

- 设置主机名与网卡信息

![](https://file.moetu.org/images/2019/08/03/5f4762a8308557474ca0319cf94cd19de88705d6b51ac7e6.png)

![](https://file.moetu.org/images/2019/08/03/ba260dc85ea47977aeb653f4f2526b474e5dea2dcc9fa3ed.png)

- 暂时选自动挂载分区（实际开发中需要仔细配置）

![](https://file.moetu.org/images/2019/08/03/d736aef3de4ebbc89fe55fbb1fdccf2063da2d215da1de63.png)

- 点击右下角开始安装，设置密码（用户可不设置），以后用Root登录

![](https://file.moetu.org/images/2019/08/03/5dd7f7075d54b0e5f926f592e2f295826857a74d3789191f.png)

![](https://file.moetu.org/images/2019/08/03/9bb7efaad45c2508e9e4ed872648438d11f7e9f6bd8d0577.png)

![](https://file.moetu.org/images/2019/08/03/04c5f6007c0e1e8d2af287e12287702d6d5dcd81dba0b2be.png)

- 等待安装即可。

![](https://file.moetu.org/images/2019/08/03/82b35ccee7c26cf46fb468bf28dfb20ea9834fe6b46f8f79.png)

- 完毕后会让你点Reboot重启：

![](https://file.moetu.org/images/2019/08/03/1046d839539f0517613c10253db944870164d9d5eeebc3e4.png)

- 重启后，需要同意协议

![](https://file.moetu.org/images/2019/08/03/42641e0f60c0f7ca02f7c0a00711f79b4e1af0691c0eea12.png)

点finish,到此Linux系统就安装完成了。

关于更多的配置，我找到一个很详细的[文章](https://blog.csdn.net/babyxue/article/details/80970526)，可以参照。
