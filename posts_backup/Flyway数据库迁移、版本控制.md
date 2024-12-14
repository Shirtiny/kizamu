---
title: flyway数据库迁移、版本控制
date: 2019-09-12 15:22:15
tags:
  - Flyway
  - 数据库
categories: 学习经验
---

# 使用Flyway进行数据库迁移、版本控制

[flyway官网](https://flywaydb.org/)

快速上手很简单，flyway配置极少，以约定为主。

简单的使用介绍，更多详细信息会持续更新。

<!-- more -->

### 项目中flyway集成h2数据库

**Maven插件**

```xml
            <!-- flyway-->
            <plugin>
                <groupId>org.flywaydb</groupId>
                <artifactId>flyway-maven-plugin</artifactId>
                <version>6.0.2</version>
                <configuration>
                    <url>jdbc:h2:~/H2database</url>
                    <user>root</user>
                    <password>123456</password>
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>com.h2database</groupId>
                        <artifactId>h2</artifactId>
                        <version>1.4.197</version>
                    </dependency>
                </dependencies>
            </plugin>
```

**Gradle插件**

```gradle
buildscript {
    dependencies {
        classpath 'com.h2database:h2:1.4.197'
    }
}

plugins {
    id "org.flywaydb.flyway" version "6.0.2"
}

flyway {
    url = 'jdbc:h2:file:./target/foobar'
    user = 'sa'
}
```

###

### 快速使用

- 以**Maven**项目为例：

`resources`目录下建立`db/migration`文件夹，然后在里面放入固定前缀的sql文件即可，V1\_\_表示版本1：

![](https://file.moetu.org/images/2019/09/12/59c996366ba7c3909265bb06977a3016c7d3a812b4259683.png)

- 文件内容：

```sql
create table USER
(
    ID           BIGINT auto_increment,
    NICKNAME     VARCHAR(100) not null,
    PASSWORD     VARCHAR(100),
    EMAIL        VARCHAR(200) not null
        constraint USER_EMAIL_UINDEX
            unique,
    AVATARIMAGE  VARCHAR(500),
    GITHUB_ID    VARCHAR(500)
        constraint USER_GITHUB_ID_UINDEX
            unique,
    GMT_CREATE   BIGINT       not null,
    GMT_MODIFIED BIGINT       not null,
    constraint USER_PK
        primary key (ID)
);

comment on table USER is '论坛的用户表';

comment on column USER.GMT_CREATE is '创建时间戳';

comment on column USER.GMT_MODIFIED is '变更时间戳';

create unique index USER_ID_UINDEX
    on USER (ID);
```

创建了一个User表

- 然后在命令行运行：

```shell
mvn flyway:migrate
```

会自动运行刚刚目录下的sql：

![](https://file.moetu.org/images/2019/09/12/bcd0ad2edd56b667e71f5bce19a77c3f1b1999a789923656.png)

- 然后观察数据库，会发现数据库多了一张表：

![](https://file.moetu.org/images/2019/09/12/4a799d50836bbdc3f854263e21139db6711d2e0c4da9621d.png)

这个表里是已执行sql的历史记录，对应版本。

**tips：**

- 已执行的sql下次运行将不会再被执行

- 如果原sql被改变，会在运行时报错停止，保护数据库原先版本

当改动了原sql或有其他异常时，可尝试以下命令：

```shell
mvn flyway:repair
```

删除失败的迁移项，并且重新对齐迁移校验，修复SCHEMA_VERSION

- V1\_\_两个下划线，这个前缀代表版本1，后面的名字是自定义描述，比如：

{% note info %}

如文件名：`V1__Create_User_Table`.sql，

`Create_User_Table`是描述信息，

V是Version，数字是版本号。

{% endnote %}

- 撤销

```shell
mvn flyway:undo
```

社区版是不支持的这个功能的，大概是要付费了
