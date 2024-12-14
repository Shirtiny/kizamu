---
title: 远程连接Linux搭建环境
date: 2019-08-03 18:48:20
tags:
  - 开发知识
  - Linux系统
  - 远程连接
categories: 学习经验
---

# 远程连接、Linux环境搭建

## 1. 安装工具

**环境准备：**

各种安装包：Xshell Plus 6|Xshell 6、Xftp 5、[linux版本的jdk](https://download.oracle.com/otn/java/jdk/8u221-b11/230deb18db3e4014bb8e3e8324f81b43/jdk-8u221-linux-x64.tar.gz)、[Linux版本的MySQL](https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.17-1.el7.x86_64.rpm-bundle.tar)、[Linux版本的Nginx](https://nginx.org/download/nginx-1.17.1.tar.gz)

现在下载jdk需要登录Oracle：[Oracle账号分享](http://bugmenot.com/view/oracle.com)

> 我当时用的账号
>
> 用户名：nicabeta@email-wizard.com
>
> 密码：MQEemoh3pOsRAn2c4tjh

注册机：NetSarang_AIO_7in1_Keygen_v1.4_DFoX_URET

<!-- more -->

百度网盘（可能会失效）：

[Xshell Plus 6](https://pan.baidu.com/s/1tLSLjLQ69WfQEd3xJ6gdsA) 【j5r8】

[Xftp 5](https://pan.baidu.com/s/1A2toG9Ks61iIIKBZg_UJ_w) 【d3jq】

[注册机](https://pan.baidu.com/s/1p1eheGD1elpPLEehyFJsVw) 【6zcp】

[RDM](https://pan.baidu.com/s/1pUSgQsaENYFBpH9-zfdQNw) 【2m91】

[Nginx-Linux](https://pan.baidu.com/s/1tMwzkNLJjLXUFOJV_iQFAw) 【xnno】

[jdk-Linux](https://pan.baidu.com/s/1VlJAkzt7srmuJGyfa8TLDw) 【bph9】

**开始安装**

- Xshell Plus 6 或 Xshell 6

1. 运行注册机，选择你安装的软件,点击Fix Host+Register，然后点击Generate，然后复制生成的序列号

![](https://file.moetu.org/images/2019/08/03/6c5ece4f5a3b15ce2e42a4377e6a4cd5a309630e350f261e.png)

2. 输入上一步获得的序列号，用户名和公司名称随意，选择路径后安装即可。

![](https://file.moetu.org/images/2019/08/03/08729b7904025f053fc534129a2aef1d41c0e665d31a33f2.png)

- Xftp同上：

![](https://file.moetu.org/images/2019/08/04/4c6a625e68ad26f176088e16125af4e928eb7848fe817f29.png)

![](https://file.moetu.org/images/2019/08/04/fbbbd4b91d95d962b6ffda9461402f8b1ed2beb69b28c392.png)

![](https://file.moetu.org/images/2019/08/04/f33c89083aeae41e5bb93fd5b9a2478ab5743f04e1951ffb.png)

​ 点下一步，安装即可。

## 2. 更换服务器的JDK

### 2.1. 拿到服务器ip

买的服务器会直接给你ip的，这里我用的虚拟机，桥接模式下与我本机的ip应该是一样的。

![](https://file.moetu.org/images/2019/08/04/d88c704c3055427cffa74a3b708c688284fb8cf8cdead45c.png)

点左上角Applications，点Favorites下的 Terminal：

![](https://file.moetu.org/images/2019/08/04/e4fc5b52a092306685aada0c5c54b68ad9d5a80d73e46070.png)

在弹出的命令行窗口，输入：

```shell
ifconfig
#获取ip配置信息，windows下命令是ipconfig
```

回车，即可看到ip信息，复制ens33里的inet后的ip地址：

![](https://file.moetu.org/images/2019/08/04/1b0ba70cd8ae57cc714f75dd8109b867a4871bb2bef003ef.png)

### 2.2. 使用Xshell建立连接

打开Xshell 6，新建会话，名称随意，主机是刚刚的ip地址：

![](https://file.moetu.org/images/2019/08/04/3e034ad559c27149e2979604a86db52c29c616becf5a8bf9.png)

点击连接，在提示框输入服务器需要的用户名密码，都正确的话会连接成功，有时候第一次连接会报错，再连一次就好了。连接成功会显示：

![](https://file.moetu.org/images/2019/08/04/c32e7f4d2da173f4a8112fb22efd42851995e96704360c16.png)

### 2.3. 卸载open JDK

1.Xshell输入：

```shell
java -version
```

可看到当前java版本：

![](https://file.moetu.org/images/2019/08/04/7618635d3a5ae65bd1e4e16b092edbd2132c9b05756756d7.png)

2.Xshell输入：

```shell
rpm -qa | grep jdk
#抓取jdk
```

![](https://file.moetu.org/images/2019/08/04/24166f93837f3efa8cadc9e120b1a0976f5f163c56300d8a.png)

3.Xshell输入：

```shell
rpm -e --nodeps #加要删除对象的完整名称（上面抓取时显示了），需要root身份，这里是：
rpm -e --nodeps java-1.8.0-openjdk-1.8.0.181-7.b13.el7.x86_64
rpm -e --nodeps java-1.8.0-openjdk-headless-1.8.0.181-7.b13.el7.x86_64
```

不报错，并且输入java -version提示找不到文件，即卸载成功：

![](https://file.moetu.org/images/2019/08/04/e61dbd80eaaea14fc10196e593fa857b4d955cacc14038ae.png)

### 2.4. 安装准备的JDK

1.Xshell输入：

```shell
pwd
#获取当前所在的目录（文件夹）路径
```

此时在/root目录下。

2.Xshell输入：

```shell
cd /usr/local
#进入指定目录，可用pwd确认当前所在的目录
mkdir java
#在当前目录 创建java文件夹
cd java
#进入java文件夹内，可用pwd确认当前所在的目录
```

![](https://file.moetu.org/images/2019/08/04/4e4b42881449063c9db3a31db4efe0c12a854c6a2a9b7f84.png)

点击帮助正下方的绿色按钮，打开Xftp，右边一般会自动定位到服务器的当前目录，左边是本机电脑，把下载好的jdk拖到右边就行了，注意目录：

![](https://file.moetu.org/images/2019/08/04/fd52ce16b5d1c6bc402f938d51aebdb6bc115668b71f8702.png)

3.Xshell输入

```shell
ls
#列出当前目录的文件名称
ll
#列出当前目录文件的详细信息

tar -zxvf 文件名
#解压tar包压缩文件，此处为：
tar -zxvf jdk-8u221-linux-x64.tar.gz

ls
#列出当前目录的文件名称
cd jdk1.8.0_221
#进入jdk解压后的文件夹
ls
#列出当前目录的文件名称
```

4.Xshell输入

```shell
vim /etc/profile
#编辑指定的文件，这里是配置环境变量
```

5.键盘按I键，进入Insert编辑，按方向键把光标移到最下方：

![](https://file.moetu.org/images/2019/08/04/2eb763dbe97de3fa4c7c17a980af1d473a25d8d3bd02e4db.png)

输入（##是注释）：

```shell
##jdk1.8
export JAVA_HOME=/usr/local/java/jdk1.8.0_221
export PATH=$JAVA_HOME/bin:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
```

键盘按esc，输入冒号wq（意为保存并退出），回车。

此处输入：

```shell
:wq
#保存并退出
```

扩展知识：

```shell
:q!
#不保存强制退出s
```

6.Xshell输入：

```shell
cat /etc/profile
#将指定文件显示出来，这里是看一下刚刚的文件是否已保存
source /etc/profile
#使刚刚的配置文件生效
java -version
#验证jdk
```

正常的结果：

![](https://file.moetu.org/images/2019/08/04/ae7510d73b276d4e98fc8e3838dc085da26df6b37a396232.png)

到此JDK安装配置结束。

## 3. 安装MySQL

**环境准备**

卸载mariadb

```shell
rpm -qa | grep mariadb
rpm -e maria....
```

**安装mysql**

- yum安装方式：

```shell
#下载rpm文件
wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
#yum安装
yum -y install mysql80-community-release-el7-3.noarch.rpm
#安装mysql
yum -y install mysql-community-server
```

- 官网下载`mysql-8.0.17-1.el7.x86_64.rpm-bundle.tar`安装包的方式

解压安装包，会得到common、server、client等rpm文件，依次安装即可。

安装common

```shell
#rpm -ivh rpm文件名 --nodeps --force
#--nodeps就是安装时不检查依赖关系
#--force就是强制安装
rpm -ivh mysql-c...-common... --nodeps --force
```

同样的命令再去装libs、client、server

**配置mysql**

- 检查数据包

```shell
rpm -qa | grep mysql
```

- 初始化

```shell
mysqld --initialize
```

- 防火墙授权

```shell
#赋予myslq操作文件夹的权限
chown mysql:mysql /var/lib/mysql -R;
#启动mysql服务
systemctl start mysqld.service;
#设置开启启动
systemctl enable mysqld;
```

- 查看密码

```shell
cat /var/log/mysqld.log | grep password
```

- 登录

```shell
mysql -u root -p
```

- 修改密码

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
```

- 退出

```shell
exit
```

再用自己密码登录就行了

- 开启远程访问，新建用户然后授权

```shell
#创建新用户，地址是任意地址
#@后面可以填ip
create USER 'sh'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
#授权
grant all privileges on *.* to 'root'@'%' with grant option;

flush privileges;
```

- 开放防火墙端口

```shell
#查看防火墙状态
systemctl status firewalld
#开启
systemctl start firewalld
#防火墙开放xxxx端口，xxx是端口号
firewall-cmd --zone=public --add-port=xxx/tcp --permanent
#重启防火墙
firewall-cmd --reload
```

- 注意，linux严格区分大小写，查询语句也是如此，配置mysql忽略大小写的方法：

修改mysql配置文件

```shell
vim /etc/my.cnf
[mysqld]
lower_case_table_names=1
```

- 若没找到该文件，用which看下mysql的安装位置

```shell
which mysqld
```

然后用得到的路径：

```shell
路径 --verbose --help |grep -A 1 'Default options'
```

会显示几个默认的文件位置，都没有的话，在这几个位置建个cnf文件就行了：

```shell
#参考的cnf文件：
安装路径/mysql/support-files/my-default.cnf
```

mysql日志位置：

```shell
cat /var/log/mysqld.log
#G跳到最后一行
vim /var/log/mysqld.log
```

## 4. 安装Redis

非关系型数据库，Redis是一个开源的使用C语言编写(3万多行代码)，支持网络，可基于内存亦可持久化的日志型，Key-Value数据库，并提供多种语言的API。

**持久化**

Redis是内存数据库，数据都是存储在内存中，为了避免进程退出导致数据的永久丢失，需要定期将Redis中的数据以某种形式（数据或命令）从内存保存到硬盘。

- `RDB模式`，默认启用，每隔一段时间，达到指定操作次数后，将数据存为文件。

- `AOF模式`，默认不用，根据设置的条件，每秒或每次操作或由系统决定，将数据经历的指令保存为文件。
  - AOF重写，Redis会根据AOF的体积进行AOF重写，重写是将指令重新执行，然后把等价于最后结果的指令替换原来的一堆指令。
  - 持久化文件损坏修复，会把文件损坏的部分切掉，会牺牲部分数据，相当于截肢，之后数据会有所偏差。
- 两种模式都启用时，以AOF为准。

> 通常，Redis将数据存储于内存中，或被配置为使用虚拟内存。通过两种方式可以实现数据持久化：使用快照（snapshot）的方式，将内存中的数据不断写入磁盘，或使用类似MySQL的binlog日志（aof但并不用于主从同步）方式，记录每次更新的日志。前者性能较高，但是可能会引起一定程度的数据丢失；后者相反。

**数据类型**

作为Key-value型存储系统数据库，Redis提供了键（Key）和值（value）映射关系。但是，除了常规的数值或字符串，Redis的键值还可以是以下形式之一，下面为最为常用的数据类型：

> ```java
> String 字符串
> Hash 哈希表
> List 列表
> Set 集合
> Sorted set 有序集合
> ```

### 4.1. 准备安装包或wget下载

[离线下载](http://download.redis.io/releases/redis-5.0.5.tar.gz)

或

服务器上选个存放安装包的目录，用wget下载

```shell
#进入存放目录
cd /usr/local
#wget加下载地址
wget http://download.redis.io/releases/redis-5.0.5.tar.gz
```

### 4.2. 准备安装环境

安装需要gcc编译，所以安装前需要看一下gcc的版本

```shell
#查看gcc版本
gcc -v
```

确认gcc版本是不是4.2以上，若没有gcc或版本不够，需要再安装gcc

```shell
#安装gcc
yum install gcc
```

装好后确认一下gcc版本。

### 4.3. Redis安装

解压下载好的Redis的压缩包

```shell
#解压
tar -zxvf redis-5.0.5.tar.gz
#进入解压出的文件夹
cd redis-5.0.5
```

尝试安装测试（必要）

```shell
#若报错，去百度对应提示
make MALLOC=libc
#测试安装，不管有没有错误，都会回滚。出错的话，根据错误提示去百度解决
make test
```

我这里错误是提示需要tcl支持，所以要安装tcl

```shell
#安装tcl
yum install tcl
#继续make测试，直到无错误提示
make test
```

**正式安装**

```shell
cd src
make install
```

无错，即成功。

### 4.4. 运行Redis

#### 前台运行

在Redis安装目录下

```shell
#前台运行redis
./redis-server
```

前台运行的话，不能关闭那个界面，关闭的话就会关闭服务。

#### 后台运行

**配置服务**

应该使用后台运行的方式，需要进行如下配置：

**①**修改redis配置文件为后台模式启动

```shell
#修改redis配置文件
vi /usr/local/redis-5.0.5/redis.conf
```

- 按i进入编辑模式，将`daemonize no`改为`daemonize yes`，esc，`:wq`保存退出。

**daemonize**意思为：是否守护线程启动（是否后台模式启动）

- 修改ip绑定，将bind 127.0.0.1 修改为bind 0.0.0.0 （4个0），表示所有ip都可以连接。注意别改错了，是没有#号的bind 127.0.0.1。（这个时指定redis的客户端地址，安全考虑）

```shell
#bind 127.0.0.1
#->
bind 0.0.0.0
```

- 设置密码（可选）

esc退出编辑模式，输入/require（搜索require），把#号去掉，然后requirepass后的值就是你的密码

```shell
requirepass password
```

**②**将redis配置文件`redis.conf`复制到`/etc/redis`目录下，并改名为`6379.conf`

```shell
cd /etc
mkdir redis
cd redis
#把目标文件复制到当前目录
cp  /usr/local/redis-5.0.5/redis.conf ./
#把目标文件移动到本目录，并重命名为
mv redis.conf 6379.conf
#tips：把目标文件覆盖复制到当前目录并改名为（cp -f 目标目录 6379.conf）

```

**③**复制启动脚本到`/etc/rc.d/init.d`/，并改名为`redisd`

启动脚本为：/usr/local/redis-5.0.5/utils/redis_init_script

```shell
#把目标文件复制到指定目录下，并命名为redisd
cp /usr/local/redis-5.0.5/utils/redis_init_script /etc/rc.d/init.d/redisd
#或手动改名：
#cd /etc/rc.d/init.d/
#ls
#mv redis_init_script redisd
```

**④**修改刚刚重命名的`redisd`文件，让它成为服务

```shell
cd /etc/rc.d/init.d/
vim redisd
```

按i进入编辑模式

- 老版本需要在脚本文件的第一行后，加入一行（包括#号）：

```shell
#chkconfig:2345 80 90
```

新版不用加。

- 然后，修改EXEC、CLIEXEC的路径：

```shell
#原内容
EXEC=/usr/local/bin/redis-server
CLIEXEC=/usr/local/bin/redis-cli

#修改后的内容
EXEC=/usr/local/redis-5.0.5/src/redis-server
CLIEXEC=/usr/local/redis-5.0.5/src/redis-cli
```

- 最后，找到case\*\*in什么的那一块代码，在`$EXEC $CONF` 后面加上 `& `（空格+&符号+空格）

**启动Redis**

```shell
#添加开机启动
chkconfig redisd on
#防火墙开放6379端口
firewall-cmd --zone=public --add-port=6379/tcp --permanent
firewall-cmd --reload
```

```shell
#运行redis
service redisd start
#停止redis
service redisd stop
#修改redis配置文件
vi /etc/redis/6379.conf
#查看运行状态
ps -ef | grep redis
#强行kill进程，14399是目标进程的id
kill -9 14399
#移除pid文件
rm -f /var/run/redis_6379.pid
```

### 4.5. Redis使用

```shell
cd /usr/local/redis-5.0.5/src/
ls
#redis客户端
redis-cli
```

redis的一些命令，自行百度

```shell
#设置
set abc 123
#取值
get abc
#显示全部key
keys *
```

[Redis命令表](http://www.redis.cn/commands.html)

[RDM](https://pan.baidu.com/s/1pUSgQsaENYFBpH9-zfdQNw) 提取码：【2m91】

## 5. 安装Nginx

### 5.1. 准备安装包

把安装文件传到服务器。

或者使用weget方式在服务器内下载也行：

```shell
cd /usr/local
weget http://nginx.org/download/nginx-1.17.1.tar.gz
#下载安装包到usr/local
```

解压

```shell
tar -zxvf nginx-1.17.1.tar.gz
#解压，z表示gzip压缩格式，x表示提取文件，v表示显示解压过程，f指定文件
ll
#显示当前文件夹的文件
```

### 5.2. 准备安装环境

安装前必须安装nginx所需的依赖库。

安装依赖，仔细执行：

```shell
yum install gcc-c++
yum install pcre
yum install pcre-devel
yum install zlib
yum install zlib-devel
yum install openssl
yum install openssl-devel
#遇到选项输y即可
```

### 5.3. Nginx安装

```shell
ll
#显示当前文件夹的文件
cd nginx-1.17.1
ll
#显示当前文件夹的文件
./configure
#执行configure文件，输一半名字按tab会自动补全文件名的
```

执行make安装

```shell
make install
#注意在nginx-1.17.1目录下执行
#它会将nginx安装到/usr/local/nginx目录下
cd ..
#返回上一目录
ll
#显示当前文件夹的文件
cd nginx
pwd
#显示当前所在的目录
```

配置Nginx开机启动

```shell
cd /lib/systemd/system
vim nginx.service
#创建nginx.service文件并编辑，也可以用touch命令创建。
#vim不行就vi
```

按I，添加如下内容：

```shell
[Unit]
Description=nginx
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/nginx/sbin/nginx
ExecReload=/usr/local/nginx/sbin/nginx reload
ExecStop=/usr/local/nginx/sbin/nginx quit
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

esc

:wq 保存并退出，用cat检查下刚刚的文件。

接着输入：

```shell
systemctl enable nginx.service
#使其开机启动
```

安装配置，到此就完成了。

### 5.4. Nginx指令、运行检查

```shell
systemctl start nginx.service
#启动

systemctl stop nginx.service
#停止

systemctl restart nginx.service
#重启
```

启动Nginx，浏览器输入ip，若访问不到：

```shell
#添加80端口配置防火墙
firewall-cmd --zone=public --add-port=1422/tcp --permanent
#重新加载
firewall-cmd --reload
```

再去访问即可。

```shell
chmod a+x /usr/local/nginx
#访问权限,a+x ==> all user can execute  所有用户可执行
```

**关于路径**

nginx根目录是/nginx/html文件夹。我的是：/usr/local/nginx/html

比如在html文件夹下建images文件夹，里面放张图片123.png，那么图片的路径就是：http://ip地址/images/123.png

**路径配置**

比如在根部吗建立data文件夹，在data下建立www和images两个文件夹：

```shell
mkdir /data
cd /data
mkdir www
cd ..
mkdir images
ll
```

然后打开nginx的配置文件/usr/local/nginx/conf/nginx.conf

注释掉原文http｛｝代码块，或者再其基础上修改成:

```shell
http{
server {
	#root的路径实际是nginx文件夹内的相对路径,/是主机根目录
	#把访问时的ip地址/，设置为本机根目录下的/data/www文件夹
	# 首页设为其文件夹下的index.html或index.htm
    location / {
        root /data/www;
   		index  index.html index.htm;

    }
	#地址栏里"/"后的路径是直接匹配目录/data下的路径
	#如访问ip地址/images时,配匹配/data/images
	#把访问时的ip/images路径，设置为
    location /images/ {
        root /data;
    }
}
}
```

关于[SSL证书](https://www.jianshu.com/p/3f6a39064f7d)

## 6.Tomcat&Maven热部署

**Tomcat准备**

Tomcat的安装与Windows一致，解压相应的tomcat-\*.tar.gz文件即可

- 端口号的修改在conf/server.xml配置文件中改
- 增加角色和权限，修改conf/tomcat-user.xml：

```xml
<role rolename="manager-gui" />
<role rolename="manager-script" />
<user username="tomcat" password="tomcat" roles="manager-gui, manager-script"/>
```

然后在tomcat-manager界面，deploy你的war包即可，热部署无需重启服务器。

**Maven插件配置**

增加Pom.xml中的tomcat7插件

```xml
<!-- 配置Tomcat插件 -->
			<plugin>
				<groupId>org.apache.tomcat.maven</groupId>
				<artifactId>tomcat7-maven-plugin</artifactId>
				<configuration>
					<port>8081</port>
					<path>/</path>  <!--对应tomcat中的ROOT文件夹-->
				    <url>http://yourIpAndPort/manager/text</url> <!--其中/manager/text是固定写法-->
					<username>tomcat</username> <!--你的tomcat角色用户名和密码-->
					<password>tomcat</password>
				</configuration>
			</plugin>
```

路径为`/`时，由于tomcat中ROOT目录已经存在，所以使用tomcat7:redeploy命令，若path为其他值，直接deploy即可，建议先clean，-Dskiptest可以跳过测试阶段，-X输出debug信息。
