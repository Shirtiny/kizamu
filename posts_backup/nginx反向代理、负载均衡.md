---
title: nginx反向代理、负载均衡
date: 2019-09-04 18:43:55
tags:
  - nginx
categories: 学习经验
---

# Nginx反向代理、负载均衡

## 反向代理

**什么是反向代理**

客户端向`代理服务器`发送请求，`代理服务器`根据这个请求去选择实际能提供相关服务的`http服务器`，然后把资源通过`代理服务器`交给客户端。此时，客户端只能知道`代理服务器`的地址，无法知道实际提供服务的`http服务器`地址。

与之对应的，是**前向代理**。前向代理中，客户端通过一个`代理客户端`来发送请求，此时`服务器`只知道`代理客户端`的地址，不知道真实客户端的地址，如VPN。

要注意的是，文中的`代理服务器`与`代理客户端`的说法是为了方便理解，实际上两者都是服务器，只是代理的对象不同，有点像学生代表、或明星的经纪人？

<!-- more -->

**Nginx如何做反向代理**

只需要在nginx的conf配置文件中，增加server代码块，修改对应的server_name、location、upstream。

也可以用这种方法做虚拟主机，这样可以两个域名指向同一台nginx服务器，用户访问不同的域名显示不同的网页内容，因为多个域名可以对应一个ip地址，最好是根据域名区分，ip或端口也行。

**先看基于域名的虚拟主机配置**

```shell
#虚拟主机1
server {
        listen       80;
        server_name  s1.shirtiny.cn;

        location / {
            root   html-s1;
            index  index.html index.htm;
        }

    }
#虚拟主机2
server {
        listen       80;
        server_name  s2.shirtiny.cn;

        location / {
            root   html-s2;
            index  index.html index.htm;
        }
    }
```

**反向代理配置**

除了upstream外，还要注意location的变化，proxy_pass。

```shell
#http服务器
upstream tomcat_server1 {
            server 192.168.101.5:8080;
        }
upstream tomcat_server2 {
            server 192.168.101.6:8080;
        }
#配置虚拟主机1
    server {
        listen 80;
        server_name aaa.test.com;
        location / {
				#域名aaa.test.com的请求全部转发到tomcat_server1即tomcat1服务上
                proxy_pass http://tomcat_server1;
				#欢迎页面，按照从左到右的顺序查找页面
                index index.jsp index.html index.htm;
        }
    }
#配置虚拟主机2
    server {
        listen 80;
        server_name bbb.test.com;

        location / {
				 #域名bbb.test.com的请求全部转发到tomcat_server2即tomcat2服务上
                  proxy_pass http://tomcat_server2;
                  index index.jsp index.html index.htm;
        }
    }
```

- [详细参考](https://www.cnblogs.com/ysocean/p/9392908.html)

## 负载均衡

Load Balance，同种服务有多个http服务器时，nginx根据http服务器被分配的权重，把请求轮换分配给某个http服务器。

只需要在`upstream`对服务器进行权重分配，weight默认为1。

```shell
upstream tomcat_server_pool{
        server 192.168.101.5:8080 weight=3;
        server 192.168.101.6:8080 weight=1;
        }
#详细说明
#定义负载均衡设备的 Ip及设备状态
upstream myServer {

    server 127.0.0.1:9090 down;
    server 127.0.0.1:8080 weight=2;
    server 127.0.0.1:6060;
    server 127.0.0.1:7070 backup;
}
#upstream 每个设备的状态:
#down 表示单前的server暂时不参与负载
#weight  默认为1.weight越大，负载的权重就越大。
#max_fails ：允许请求失败的次数默认为1.当超过最大次数时，返回proxy_next_upstream 模块定义的错误
#fail_timeout:max_fails 次失败后，暂停的时间。
#backup： 其它所有的非backup机器down或者忙的时候，请求backup机器。所以这台机器压力会最轻。

#在需要使用负载的Server节点下添加
#proxy_pass http://myServer;
 server {
        listen 80;
        server_name aaa.test.com;
        location / {
                 proxy_pass http://myServer;
                 index index.jsp index.html index.htm;
        }
    }
```

## 高可用

准备两台Nginx服务器，一主一备。都装keepalived做健康检查，两个keepalived会保持通讯，主服务器拿到虚拟ip（vip）运行中，当主Nginx服务器上的keepalived失去响应时，备用服务器上的keepalived会启动备用的Nginx，拿到主Nginx的虚拟ip（vip），代替主服务器工作。

### keepalived的安装

#### 安装环境

```shell
su - root
yum -y install kernel-devel*
yum -y install openssl-*
yum -y install popt-devel
yum -y install lrzsz
yum -y install openssh-clients
yum -y install libnl libnl-devel popt
```

#### 安装keepalived

将keepalived-1.2.15.tar.gz上传到服务器/usr/local/下。

```shell
cd /usr/local
tar -zxvf keepalived-1.2.15.tar.gz
cd keepalived-1.2.15
#执行配置命令
./configure --prefix=/usr/local/keepalived
#编译
make
#安装
make install
```

至此安装完成。

```shell
#拷贝执行文件
cp /usr/local/keepalived/sbin/keepalived /usr/sbin/
#将init.d文件拷贝到etc下,加入开机启动项
cp /usr/local/keepalived/etc/rc.d/init.d/keepalived /etc/init.d/keepalived
#将keepalived文件拷贝到etc下，加入网卡配置
cp /usr/local/keepalived/etc/sysconfig/keepalived /etc/sysconfig/
#创建keepalived文件夹
mkdir -p /etc/keepalived
#将keepalived配置文件拷贝到etc下
cp /usr/local/keepalived/etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf
#添加可执行权限
chmod +x /etc/init.d/keepalived
```

#### 加入开机启动

```shell
chkconfig --add keepalived	#添加时必须保证/etc/init.d/keepalived存在
chkconfig keepalived on
```

添加完可查询系统服务是否存在：`chkconfig --list`

#### 启动keepalived

```shell
启动：service keepalived start
停止：service keepalived stop
重启：service keepalived restart
```

#### 配置日志文件

```shell
#将keepalived日志输出到local0：
vi /etc/sysconfig/keepalived
KEEPALIVED_OPTIONS="-D -d -S 0"
#在/etc/rsyslog.conf里添加:
local0.*  /var/log/keepalived.log
#重新启动keepalived和rsyslog服务：
service rsyslog restart
service keepalived restart
```

#### 打开防火墙的通讯地址

```shell
iptables -A INPUT -d 224.0.0.18 -j ACCEPT
/etc/rc.d/init.d/iptables save
```

### 主Nginx

修改主nginx下/etc/keepalived/keepalived.conf文件

```shell
! Configuration File for keepalived

#全局配置
global_defs {
   notification_email {  #指定keepalived在发生切换时需要发送email到的对象，一行一个
     XXX@XXX.com
   }
   notification_email_from XXX@XXX.com  #指定发件人
   #smtp_server XXX.smtp.com                             #指定smtp服务器地址
   #smtp_connect_timeout 30                               #指定smtp连接超时时间
   router_id LVS_DEVEL                                    #运行keepalived机器的一个标识
}

vrrp_instance VI_1 {
    state MASTER           #标示状态为MASTER 备份机为BACKUP
    interface eth0         #设置实例绑定的网卡
    virtual_router_id 51   #同一实例下virtual_router_id必须相同
    priority 100           #MASTER权重要高于BACKUP 比如BACKUP为99
    advert_int 1           #MASTER与BACKUP负载均衡器之间同步检查的时间间隔，单位是秒
    authentication {       #设置认证
        auth_type PASS     #主从服务器验证方式
        auth_pass 8888
    }
    virtual_ipaddress {    #设置vip
        192.168.101.100       #可以多个虚拟IP，换行即可
    }
}
```

### 备Nginx

修改备nginx下/etc/keepalived/keepalived.conf文件

配置备nginx时需要注意：需要修改state为BACKUP , priority比MASTER低，virtual_router_id和master的值一致

```shell
! Configuration File for keepalived

#全局配置
global_defs {
   notification_email {  #指定keepalived在发生切换时需要发送email到的对象，一行一个
    XXX@XXX.com
   }
   notification_email_from XXX@XXX.com  				#指定发件人
   #smtp_server XXX.smtp.com                             	#指定smtp服务器地址
   #smtp_connect_timeout 30                               #指定smtp连接超时时间
   router_id LVS_DEVEL                                    #运行keepalived机器的一个标识
}

vrrp_instance VI_1 {
    state BACKUP           #标示状态为MASTER 备份机为BACKUP
    interface eth0         #设置实例绑定的网卡
    virtual_router_id 51   #同一实例下virtual_router_id必须相同
    priority 99            #MASTER权重要高于BACKUP 比如BACKUP为99
    advert_int 1           #MASTER与BACKUP负载均衡器之间同步检查的时间间隔，单位是秒
    authentication {       #设置认证
        auth_type PASS     #主从服务器验证方式
        auth_pass 8888
    }
    virtual_ipaddress {    #设置vip
        192.168.101.100       #可以多个虚拟IP，换行即可
    }
}
```

**tips：**

因为备份服务器的启动，是依据主服务器上的keepalived的响应状况判断的，所以当主服务器的keepalived意外停止，或者当nginx进程停止时，keepalived没有按计划停止，就无法启动备份服务器。

### nginx进程检测脚本

为了解决nginx进程和keepalived不同时存在的问题，需要在主服务器上编写Nginx进程检测脚本`check_nginx.sh`，判断nginx进程是否存在，如果nginx不存在就将keepalived进程杀掉。

```bash
#!/bin/bash
# 如果进程中没有nginx则将keepalived进程kill掉
A=`ps -C nginx --no-header |wc -l`      ## 查看是否有 nginx进程 把值赋给变量A
if [ $A -eq 0 ];then                    ## 如果没有进程值得为 零
       service keepalived stop          ## 则结束 keepalived 进程
fi
```

- 脚本运行测试

将check_nginx.sh拷贝至/etc/keepalived下，

将nginx停止，将keepalived启动，执行脚本：sh /etc/keepalived/check_nginx.sh，若keepalived进程被顺利杀死，即成功。

- 修改主nginx的keepalived.conf，添加脚本定义检测：

```shell
#全局配置
global_defs {
   notification_email {  #指定keepalived在发生切换时需要发送email到的对象，一行一个
     XXX@XXX.com
   }
   notification_email_from miaoruntu@itcast.cn  #指定发件人
   #smtp_server XXX.smtp.com                             #指定smtp服务器地址
   #smtp_connect_timeout 30                               #指定smtp连接超时时间
   router_id LVS_DEVEL                                    #运行keepalived机器的一个标识
}
 ##监控脚本
vrrp_script check_nginx {
    script "/etc/keepalived/check_nginx.sh"         ##监控脚本
    interval 2                                      ##时间间隔，2秒
    weight 2                                        ##权重
}
vrrp_instance VI_1 {
    state MASTER           #标示状态为MASTER 备份机为BACKUP
    interface eth0         #设置实例绑定的网卡
    virtual_router_id 51   #同一实例下virtual_router_id必须相同
    priority 100           #MASTER权重要高于BACKUP 比如BACKUP为99
    advert_int 1           #MASTER与BACKUP负载均衡器之间同步检查的时间间隔，单位是秒
    authentication {       #设置认证
        auth_type PASS     #主从服务器验证方式
        auth_pass 8888
    }
    #监控脚本
   track_script {
        check_nginx        #监控脚本
   }
    virtual_ipaddress {    #设置vip
        192.168.101.100       #可以多个虚拟IP，换行即可
    }

}
#修改后重启keepalived
#观察keepalived日志：
#tail -f /var/log/keepalived.log
```
