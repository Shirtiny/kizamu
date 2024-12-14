---
title: H2数据库数据迁移
date: 2019-11-08 20:21:30
tags:
  - H2
  - flyway
  - mysql
categories: 日志
---

# 记一次H2与MySQL之间的数据迁移

最近在用`Golang`写爬虫，使用的ORM是[Gorm](http://gorm.io/)，暂不正式支持嵌入式的`H2`数据库，所以就用`mysql`来存爬取到的数据。

由于原先数据是放在`H2`数据库里的，便产生了在`H2`和`Mysql`之间迁移数据的需求。

<!-- more -->

## 表结构

之前是使用[Flyway](https://flywaydb.org/)对`H2`数据库进行的版本管理，所以之间写的`Sql`保存了下来，`H2`与`Mysql`的`Sql`语法还是比较像的：

**H2 创建 user表**

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

**Mysql创建user表**

```sql
create table user
(
    id           bigint auto_increment,
    nickname     varchar(100) not null,
    password     varchar(100),
    email        varchar(200) not null,
    avatarimage  varchar(500),
    github_id    varchar(500),
    gmt_create   bigint       not null comment '创建时间戳',
    gmt_modified bigint       not null comment '变更时间戳',
    constraint user_pk
        primary key (id)
) comment '论坛的用户表';

create unique index user_id_uindex
    on user (id);

create unique index user_email_uindex
    on user (email);

create unique index user_github_id_uindex
    on user (github_id);
```

**H2增加一个字段**

```sql
alter table user
	add description varchar(20);
```

**mysql增加一个字段**

```sql
alter table USER
	add description varchar(20);
```

**H2删除字段**

```sql
alter table COMMENT drop column CITED_COMMENT_CONTENT;
```

**mysql删除字段**

```sql
alter table COMMENT drop column CITED_COMMENT_CONTENT;
```

**H2修改字段**

```sql
alter table COMMENT alter column CITED_COMMENT_CONTENT VARCHAR(512);
alter table SECTION alter column INVITATION_STAR_NUM rename to "Section_TOTAL_CANDY";

comment on column SECTION."Section_TOTAL_CANDY" is '版块总糖数';
```

**mysql修改字段**

```sql
alter table comment modify cited_comment_content varchar(512);
alter table section change invitation_star_num section_total_candy bigint default 0  comment '版块总糖数';
```

{% note info %}

IDEA可以使用`ctrl`+`shift`+`u`把字母批量的改为大写或小写。

这样修改`sql`的目的是想让`mysql`接续`H2`的版本控制，大数据量的数据应使用其他方式。

{% endnote %}

## 数据

表结构迁移完成后，数据的迁移就变得很简单。以前在`Oracle`和`Mysql`的数据迁移中，我使用的是`Navicat`，现在发现`IDEA`自带的数据库管理工具也挺好用的，`IDEA`的数据跨库迁移：

![](https://file.moetu.org/images/2019/11/08/c8c67c5365074662603fc4344f18c21c2eac6ea7711943c8.png)

![](https://file.moetu.org/images/2019/11/08/0690169464881f5d461a009b2a750a410efaeef91822c988.png)

找到对应表，确认即可，注意错误信息。
