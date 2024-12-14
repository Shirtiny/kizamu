---
title: MySQL Error记录
date: 2019-07-05 15:21:59
tags:
  - 数据库
  - mysql
  - error
categories: 开发问题
---

### MySQL 提示：

## 1.

> Lost connection to MySQL server at 'waiting for initial communication packet',system error:0

##### 错误产生经过：

昨天试加速器试用，改了硬件信息，隔天上午数据库运行正常，下午重启后mysql连接时就出错了。

##### 解决方法：

1. 找到mysql安装目录下的`my.ini`文件(我mysql安装目录是在`D:\SP GAME`),记事本打开`my.ini`,

找到`[mysqld]`,在末尾**添加**一行：

`skip-name-resolve`

记得**保存**。

2. 在“计算机管理-服务和应用程序-**服务**”找到`MySQL`，

**重启该服务**。

<!-- more -->

## 2.

> Lost connection to MySQL server at 'reading initial communication packet', system error: 0

**重启MySQL服务**

## 3. 2059错误

> Authentication plugin 'caching_sha2_password' cannot be loaded : \*\*\*

**原因**

> mysql8 之前的版本中加密规则是mysql_native_password,而在mysql8之后,加密规则是caching_sha2_password

**解决**

```shell
mysql -uroot -ppassword #登录

use mysql; #选择数据库
# 远程连接请将'localhost'换成'%'

ALTER USER 'root'@'localhost' IDENTIFIED BY '123456' PASSWORD EXPIRE NEVER; #更改加密方式

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456'; #更新用户密码

FLUSH PRIVILEGES; #刷新权限
```

[Mysql2059错误](https://www.cnblogs.com/lifan1998/p/9177731.html)

## 4. 1273错误

> 1273 - Unknown collation: 'utf8mb4_0900_ai_ci'

**情景**

将`mysql8.0`的结构数据转储为`sql`文件，然后在`mysql5.6`运行时报错。

**原因**

编码排序规则不同，不止数据库，还有每张表。

**解决**
将`sql`文件内对应的编码排序规则，比如`utf8mb4_0900_ai_ci`，批量替换为`mysql5.6`能用的规则，比如`utf8mb4_unicode_ci`，然后再运行。

## 5. 1071 (42000) 错误

> ERROR 1071 (42000): Specified key was too long; max key length is 767 bytes

**情景**

高版本数据库向低版本数据库迁移时，修改`InnoDB`表字段长度时出现了此错误。

**原因**

错误是指超出索引字节的限制，并不是指字段长度限制。文档：

> 如果启用了系统变量innodb_large_prefix（默认启用，注意实验版本为MySQL 5.6.41,默认是关闭的，MySQL 5.7默认开启），则对于使用DYNAMIC或COMPRESSED行格式的InnoDB表，索引键前缀限制为3072字节。如果禁用innodb_large_prefix，则对于任何行格式的表，索引键前缀限制为767字节。
>
> innodb_large_prefix将在以后的版本中删除、弃用。在MySQL 5.5中引入了innodb_large_prefix，用来禁用大型前缀索引，以便与不支持大索引键前缀的早期版本的InnoDB兼容。
>
> 对于使用REDUNDANT或COMPACT行格式的InnoDB表，索引键前缀长度限制为767字节。例如，您可能会在TEXT或VARCHAR列上使用超过255个字符的列前缀索引达到此限制，假设为utf8mb3字符集，并且每个字符最多包含3个字节。
>
> 尝试使用超出限制的索引键前缀长度会返回错误。要避免复制配置中出现此类错误，请避免在主服务器上启用enableinnodb_large_prefix（如果无法在从服务器上启用）。
>
> 适用于索引键前缀的限制也适用于全列索引键。

**解决**

- 启用系统变量`innodb_large_prefix`，然后满足以下条件

  - 1： 系统变量innodb_large_prefix为ON

    2： 系统变量innodb_file_format为Barracuda

    3： ROW_FORMAT为DYNAMIC或COMPRESSED

第3条为可选项，sql如下：

```sql
set global innodb_large_prefix=on;
set global innodb_file_format=Barracuda;
ALTER TABLE TEST ROW_FORMAT=DYNAMIC;
```

参照[ERROR 1074错误解决方式](https://www.cnblogs.com/kerrycode/p/9680881.html)
