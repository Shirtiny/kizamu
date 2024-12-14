---
title: Idea Maven父子工程+多模块创建
date: 2019-07-31 15:07:40
tags:
  - 开发知识
  - IntelliJ IDEA
  - Maven聚合工程
categories: 学习经验
---

# 使用IDEA创建Maven聚合工程

## Zero. 工作空间

我新建了一个名为Idea_SSM04_WebProject的文件夹，用于存放这个项目：

![](https://file.moetu.org/images/2019/07/31/QHA7ARU_XWEAFTG3KY2KHac73109ff37b4653.png)

<!-- more -->

## 1. 创建一个Maven工程

新建一个Maven工程，作为项目的父工程，可不勾选骨架，用于统一版本号。

将pom依赖导入

## 2. 创建子工程

在上一步建好的工程上右键，新建Module，注意在后续选项中把add as Module改为None：

![](https://file.moetu.org/images/2019/07/31/db81cf368dfcbfcd04807a44b4d0e7f4186a2a3ed94e71b5.png)

新工程名：WebShop-Common

修改路径为：E:\Idea_SSM04_WebProject\WebShop-Common

（然后再创建第二个子工程，与上步骤一样。）

第二个子工程名：WebShop-SysManager

修改路径为：E:\Idea_SSM04_WebProject\WebShop-SysManager

## 3. 子工程之间的依赖

使用`dependency`来指定依赖关系

如WebShop-SysManager的pom文件中增加：

```xml
<artifactId>WebShop-SysManager</artifactId>
	<packaging>pom</packaging>

<dependencies>
        <dependency>
            <groupId>com.SH</groupId>
            <artifactId>WebShop-Common</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>
```

## 4. 创建模块

接着在子工程里创建模块，直接在子工程右键新建Module即可。

新建模块路径默认即可：

SysManager-Dao

SysManager-Service

SysManager-Pojo

SysManager-Web

其中Web模块需要勾选webapp骨架，其他模块无需勾选骨架。

## 5. 运行Maven项目

在含有webapp的工程pom里，这里是WebShop-SysManager，增加Tomcat7插件：

```xml
 <build>
        <!-- 配置插件 -->
        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <configuration>
                    <port>8080</port>
                    <path>/</path>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

在右侧点击Maven，可查看当前项目的Maven详情：

![](https://file.moetu.org/images/2019/07/31/52e796816c0cbc1e6be27e4b9075eaf0227581cc0a53dc8c.png)

在Add Configuration中点击加号，选Maven：

![](https://file.moetu.org/images/2019/07/31/43b0f708d0a0f8ad250810848dccf954ce6f4cdca2615103.png)

配置如下，名字随便起：

![](https://file.moetu.org/images/2019/07/31/ef298cf0e8a16a17c454d7d69f522316a0d8875e7ad2b816.png)

运行前，需要先把被依赖的工程install，接着install其他工程，install前请clean。webapp模块不需要安装，每次运行前最好都这样重复清理安装:

![](https://file.moetu.org/images/2019/07/31/83af61bc9de191d8cebeb11e35368d4971d7fa4fdded2b6a.png)
