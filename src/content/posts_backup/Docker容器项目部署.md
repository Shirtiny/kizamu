---
title: Docker容器项目部署
date: 2019-10-10 19:40:26
tags:
  - Docker
  - linux
  - ubuntu
  - Vue
  - Go
  - nginx
categories: 闲谈
---

# 使用Docker部署Vue、Go项目，Ubuntu18.04

不经意看到Docker这个大鲸鱼：

![](https://file.moetu.org/images/2019/10/10/timg2688a0fbc705d49b7.jpg)

突然好奇它怎么用的，这些技术像动物世界一样。

我在这篇文章记录了自己在Windows、Ubuntu18.04下的Docker安装和使用的过程，顺带记录了Vue项目的Docker部署、Go语言web项目的Docker部署、Nginx反向代理配置，还有Mysql、Redis等部署操作。

<!-- more -->

## 安装Docker

### Windows

- 专业版、企业版

Docker安装需要windows专业版`pro`或者 企业版并且需要某个版本以上，具体哪个版本看官网说明， 这个一键安装的方式，我就不说了，因为上个月硬盘挂掉，系统到现在还是盗版的win10，版本还是比较旧的。

- 家庭版

windows家庭版`home` 不能直接安装，需要安装[Docker ToolBox](https://docs.docker.com/toolbox/)，照着官方文档下载安装即可，文档单词量不大，很容易懂的，而且只需要下载，然后点下一步就完了。

其中确认系统是否启用虚拟化，是在任务管理器的性能栏里看：

![](https://file.moetu.org/images/2019/10/10/520a1eac53965cc8774b3a13baee45e2436257d449d7aa1d.png)

工具箱好像是使用`Oracle VM VirtualBox`虚拟机软件来跑Docker的，高版本windows的Docker是用`Hypervisor`。

把`Docker ToolBox`装好后，运行`Docker Quickstart Terminal`就行了（需要管理员运行），等它把需要的东西装完，它的快捷方式应该在桌面上，当出现以下画面时，表示已经准备完成，可以使用了：

![](https://file.moetu.org/images/2019/10/10/8e46f34add3de7f2ba193b8f22235ed690784a2644f670b1.png)

使用的是Linux的命令，会看到它的ip。

- windows下linux命令行推荐：

```shell
putty

wscp

win10 wsl
```

一个可以在线使用Docker的网站，也可以不用装Docker

```shell
http://play-with-docker.com/
```

## Nginx-alpine

一个最小Nginx运行镜像

- 配置端口映射并运行

```shell
docker run -p 2019:80 nginx:alpine
```

- 直接运行

```shell
docker run nginx:alpine
```

- 查看运行结果

```shell
http://docker Ip:2019
#安装方式的不同，有的也可以在本地http://localhost:2019
```

- bash可交互方式运行

```shell
docker run -it nginx:alpine sh
#linux命令
ls -als
pwd
exit
```

`nginx主页root所在目录`

```shell
/usr/share/nginx/html
```

## 镜像构建与上传

### 构建Vue项目的Docker镜像

- cd到Vue项目的文件夹

```shell
npm run build
```

会生成一个`dist`文件夹

**把`dist`文件夹放入`docker`文件夹（自定，存放Dockerfile的文件夹）**

- 打开命令行时，默认是在你安装时选择的Docker ToolBox的安装目录，比如我装在d盘

```shell
pwd
#/d/Docker Toolbox
```

- 在这个目录建一个`Docker`文件夹，然后把`dist`文件夹拷贝到里面

- 在`Docker`文件夹下新建一个名为DockerFile的文件，内容如下：

```shell
FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./dist /usr/share/nginx/html
```

- 再新建`nginx.conf`的文件，内容为：

```shell
server {
    listen 80;

    set $wwww_data /usr/share/nginx/html;

    location / {
        root $wwww_data;
        index index.html;
    }
}
```

- 构建Docker镜像，镜像名只能小写，`docker build` 会执行`Dockerfile`文件，`-t`会给镜像起个名字

```shell
#先cd到刚刚建的Docker文件夹
docker build -t shvideo-vue:v0.0.1 ./
```

- 运行镜像

```shell
#映射端口，然后运行
docker run -p 2020:80 shvideo:v0.0.1
```

```shell
#直接运行
docker run shvideo:v0.0.1
```

运行结果

```shell
http://docker Ip:2020
#安装方式的不同，有的也可以在本地http://localhost:2020
```

**实用命令**

查看运行的容器

```shell
docker ps
docker ps -a
```

停止容器

```shell
docker stop 容器ID或容器名
参数 -t：关闭容器的限时，如果超时未能关闭则用kill强制关闭，默认值10s，这个时间用于容器的自己保存状态
docker stop -t=60 容器ID或容器名
docker kill 容器ID或容器名 :直接关闭容器
```

### 上传Vue项目的Docker镜像

- 把镜像上传到云空间，以便公网访问

我这里用的阿里云的容器镜像服务，去阿里云找一下就有了，注册就能用。

```shell
地域：香港
命名空间 shirtinycn
仓库名称 shvideo-vue
代码源：本地仓库
在访问凭证栏设置固定密码
```

- Docker Hub/阿里容器登录

```shell
docker login --username=shirtiny registry.cn-hongkong.aliyuncs.com
然后输你的密码
```

- 重新构建镜像，这次是会存到云空间的

```shell
#还是要cd到刚刚那个docker文件夹 看看这个./
docker build -t registry.cn-hongkong.aliyuncs.com/shirtinycn/shvideo-vue:v1.0.0 ./
```

- 推到云空间

```shell
docker push registry.cn-hongkong.aliyuncs.com/shirtinycn/shvideo-vue:v1.0.0
```

## GO项目的Docker镜像

- cd 到go项目中，新建Dockerfile、Nginx.conf

编辑Dockerfile为：

```shell
From golang:1.12 as build

#把当前所有目录都放入指定文件夹，包括项目shVideoGo
ADD ./ /usr/local/GoProject/shVideoGo

#工作目录，指定所有的run都在此目录执行
WORKDIR /usr/local/GoProject/shVideoGo

#环境变量，这里最好写内网ip
ENV REDIS_ADDR="1.2.3.4:6379"
#ENV REDIS_PW=""
ENV REDIS_DB="0"
ENV MysqlDSN="root:123456@tcp(1.2.3.42)/mydb?charset=utf8&parseTime=True&loc=Local"
ENV GIN_MODE="release"
ENV PORT=3000
#Go的代理
ENV GOPROXY="https://goproxy.io"

#编译成可以在linux运行的版本（Golang交叉编译）     - o 会指定build后的名字
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o shvideogo

#第二段构建
FROM alpine:3.7


#阿里的镜像
RUN echo "http://mirrors.aliyun.com/alpine/v3.7/main/" > /etc/apk/repositories && \
    apk update && \
    apk add ca-certificates && \
    echo "hosts: files dns" > /etc/nsswitch.conf && \
    mkdir -p /www/conf

WORKDIR /www

#从第一段构建中拷贝编译好的可执行文件
COPY  --from=build  /usr/local/GoProject/shVideoGo/shvideogo /usr/bin/shvideogo
ADD ./conf /www/conf

#给它可执行权限，/usr/bin是linux默认放环境变量的地方
RUN chmod +x /usr/bin/shvideogo

#运行
ENTRYPOINT ["shvideogo"]
```

- docker容器的所在位置

```
docker info | greo Docker
```

```shell
#更新一下包依赖
go mod tidy
```

构建镜像

```shell
docker build --no-cache -t registry.cn-hongkong.aliyuncs.com/shirtinycn/shvideo-go:v6.0.0 ./
```

- 把镜像推到云空间

推到云空间，会自动创建名为shvideo-go的仓库

```shell
docker push registry.cn-hongkong.aliyuncs.com/shirtinycn/shvideo-go:v6.0.0
```

- 其他方式

实在不行，自己编译一个linux的go程序，放到服务器上，emm能用，233。

本地编译，可以看：[GO交叉编译](https://blog.csdn.net/x356982611/article/details/80054314)

docker windows用起来很不方便，可以选择用远程工具连接（因为是虚拟机上的）

```shell
ip启动时会有，默认用户名是docker，密码是tcuser
```

## Ubuntu服务器上Docker的安装

使用`ubuntu 18.04` 据说和Docker有莫名的亲密度

- 日常第一步:

```shell
#获取更新
sudo apt-get update
```

- 安装Docker，谷歌搜 `ubuntu 18.04 install Docker` 有个`DigitalOcean`网站的步骤比较好，能保证Docker版本

```shell
sudo sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

```shell
#认证Docker证书
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

```shell
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
```

```shell
sudo apt update
```

```shell
apt-cache policy docker-ce
```

- 安装

```shell
sudo apt install docker-ce
```

- 检查运行状态

```shell
sudo systemctl status docker
```

- 启动docker

```shell
service docker start
```

- 启动Docker管理进程

```shell
docker start compassionate_valhard
```

## portainer.io管理工具

portainer.io是一个特权容器，可以管理其他的Docker容器，不过需要授权。

### 安装

国内下载比较慢，服务器在国内的话，请使用国内镜像源：

- 新建文件或编辑 /etc/docker/daemon.json

```shell
vi /etc/docker/daemon.json
```

- 写入内容：

```shell
{
  "registry-mirrors": [
    "https://dockerhub.azk8s.cn",
    "https://reg-mirror.qiniu.com",
    "https://registry.docker-cn.com"
  ]
}
```

- 重启Docker

```shell
sudo systemctl restart docker
```

- **运行portainer.io**

```shell
#挂载卷，用于保存portainer.io的配置数据
docker volume create portainer_data
#授权并运行
docker run -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer
```

- 访问服务器的9000端口即可，记得防火墙开放，我的是阿里云的服务器：

![](https://file.moetu.org/images/2019/10/13/392276760b56fd5751ce2d1666a562548a48340b847973b0.png)

```shell
#所有ip均可访问此端口9000/9000
0.0.0.0/0
#指定ip：1.2.3.4可访问此端口9000/9000
1.2.3.4/32
```

### portainer.io的使用

#### 运行vue项目

- 创建管理用户后，连接本地Docker，那个local，点进去：

![](https://file.moetu.org/images/2019/10/13/1681e553e03e404a940492f8f5d5f4bbc82d88803f44b323.png)

- 先如图所示创建登录你镜像空间的信息：

![](https://file.moetu.org/images/2019/10/13/48b08cdc46aa4ada508e8fa6f895ad1ad646ba19f42ff81a.png)

```shell
registry.cn-hongkong.aliyuncs.com
shirtiny
```

- 然后进入Stacks，然后新建stack：

![](https://file.moetu.org/images/2019/10/13/e3d51bf2e3ba887da117fc6f8be6ab430a9160560ff53963.png)

```yaml
version: '2'

services:
  nginx_shvideo_vue:
    image: registry.cn-hongkong.aliyuncs.com/shirtinycn/shvideo-vue:v1.0.0
    restart: always
    ports:
      - 8000:80
```

如图配置了一个Nginx，是yaml格式，点deploy即可。

现在就已经可以直接访问vue项目了，在8000端口，记得开放端口。

#### 运行Go后台项目

```yaml
version: '2'

services:
  api:
    image: registry.cn-hongkong.aliyuncs.com/shirtinycn/shvideo-go:v6.0.0
    restart: always
    environment:
      #golang MYSQL_DSN
      MYSQL_DSN: 'root:123456@tcp(1.2.3.4)/mydb?charset=utf8&parseTime=True&loc=Local'
      #容器有自己的环境，容器的localhost不是主机的localhost，这里填内网ip地址，阿里会给个私网ip，理论上应该用内网ip。。可我有时候要换成公网ip才能用
      REDIS_ADDR: '1.2.3.4:6379'
      #REDIS_PW: 没设密码
      REDIS_DB: '0'
      SESSION_SECRET: '224895477'
      GIN_MODE: 'release'
      LOG_LEVEL: 'debug'
    ports:
      - 3000:3000
```

#### 宿主机Nginx反向代理

- 我们需要对这些项目的Nginx进行请求的分发，所以我们主机还需要一个Nginx做反向代理

```shell
#主机安装Nginx
sudo apt install nginx
#修改nginx的配置文件
#cd /etc/nginx/sites-enabled，这个目录有一个默认配置文件
vi /etc/nginx/sites-enabled/shvideo.conf
#检查文件上下文格式是否写错
sudo nginx -t
#重启nginx
sudo service nginx restart
```

- Nginx配置文件shvideo.conf内容为：

```shell
server {
    listen 80;
    server_name video.shirtiny.cn;
    #server_name 1.2.3.4;

    #vue项目位置，video.shirtiny.cn/，会映射到本地8000端口
    location / {
        proxy_set_header x-Real-IP $remote_addr;
        proxy_set_header x-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://127.0.0.1:8000;
    }
    #后台api，video.shirtiny.cn/api路径，映射到本地3000端口
    location /api {
        proxy_set_header x-Real-IP $remote_addr;
        proxy_set_header x-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://127.0.0.1:3000;
    }
}

server {
    listen 80;
    server_name mysql.shirtiny.cn;
    #server_name 1.2.3.4;

    #mysql位置，mysql.shirtiny.cn根路径/，会映射到本地3306端口
    location / {
        proxy_set_header x-Real-IP $remote_addr;
        proxy_set_header x-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://127.0.0.1:3306;
    }
}

server {
    listen 80;
    server_name docker.shirtiny.cn;
    #server_name 1.2.3.4;

    #docker管理工具位置，docker.shirtiny.cn根路径/，会映射到本地端口
    location / {
        proxy_set_header x-Real-IP $remote_addr;
        proxy_set_header x-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://127.0.0.1:9000;
    }
}

server {
    listen 80;
    server_name redis.shirtiny.cn;
    #server_name 1.2.3.4;

    #docker管理工具位置，redis.shirtiny.cn根路径/，会映射到本地端口
    location / {
        proxy_set_header x-Real-IP $remote_addr;
        proxy_set_header x-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://127.0.0.1:6379;
    }
}
```

### mysql

到Volumes选项，开一个Docker的卷，映射到主机文件目录，用于存储数据库数据，就叫mysql_data好了

```yml
version: '2'

services:
  docker_mysql:
    image: mysql:5.6
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    volumes:
      - mysql_data:/var/lib/mysql/data
    ports:
      - 3306:3306
```

### redis

依然是开个Docker的卷，名为redis_data

```yaml
version: '2'

services:
  docker_redis:
    image: redis
    restart: always
    volumes:
      - redis_data:/data
    ports:
      - 6379:6379
```

### elasticSearch

需要2G内存

基础

```yaml
version: '2'

services:
  docker_Es:
    image: elasticsearch:7.4.2
    restart: always
    ports:
      - 9200:9200
    networks:
      - somenetwork
    environment:
      - discovery.type=single-node
```

推荐

```shell
#需要2g内存
docker network create somenetwork
docker run -d --name elasticsearch --net somenetwork -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:7.4.2
```

```shell
#测试
Get http://ip:9200/
#增 使用post可以省略id，系统自动生成
#格式类似http://ip:9200/database/table/id http://ip:9200/index/type/id 带上json数据 es版本7以后去除了type的概念，不在支持一个index内多个type
Put http://ip:9200/shsipder/user/2
#删除
Delete http://ip:9200/shsipder/user/2
#修改 覆盖式
Put http://ip:9200/shsipder/user/2
#全查 显示pretty=yrue 每页大小size=100
Get http://ip:9200/shsipder/user/_search
#条件 age:(<30)
Get http://ip:9200/shsipder/user/_search?q=shirtiny
#查看表结构
Get http://ip:9200/shsipder/_mapping
```

### 最后

服务器停机，像阿里那种释放cpu、内存、保留硬盘，重启后IP可能会更改、有时需要手动启动docker，mysql等服务会随着Docker启动，只是portainer需要再次手动启动，管理进程也不会自动启动，手动启动的命令如下：

```shell
#docker容器管理工具
docker run -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer
#docker管理进程
docker start compassionate_valhard
```

想开机自启的话，写个脚本，配置一下，即可。

> 题外话：
>
> nmap可进行端口扫描等，在ubuntu安装很简单:
>
> sudo apt-get install nmap
