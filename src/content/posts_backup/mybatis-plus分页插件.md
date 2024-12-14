---
title: mybatis-plus
date: 2019-09-16 18:00:00
tags:
  - mybatis
  - 数据库
categories: 学习经验
---

# MyBatis-Plus快速上手

[MyBatis-Plus](https://github.com/baomidou/mybatis-plus)是针对MyBatis的增强方案，别人造好的车轮，我们甚至SQL语句都不用写了，分页也是自动完成的。

官宣图：

![](https://mp.baomidou.com/img/relationship-with-mybatis.png)

话说这些技术有各种动物，还挺有趣的。

<!-- more -->

## 相关依赖

```xml
<!--数据源 -->
<dependency>
	<groupId>com.alibaba</groupId>
	<artifactId>druid-spring-boot-starter</artifactId>
</dependency>

<!--mysql连接驱动 -->
<dependency>
	<groupId>mysql</groupId>
	<artifactId>mysql-connector-java</artifactId>
	<scope>runtime</scope>
</dependency>

<!--可选-->
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!--mybatis-plus(springBoot)-->
<dependency>
	<groupId>com.baomidou</groupId>
	<artifactId>mybatis-plus-boot-starter</artifactId>
	<version>3.2.0</version>
</dependency>

<!--lombok-->
<dependency>
	<groupId>org.projectlombok</groupId>
	<artifactId>lombok</artifactId>
    <version>1.18.10</version>
	<optional>true</optional>
</dependency>
```

## 基础配置

- 数据库基础

```properties
#数据库基础配置
spring.datasource.url=jdbc:h2:~/H2database
spring.datasource.username=***
spring.datasource.password=***
spring.datasource.driver-class-name=org.h2.Driver
```

- 使用连接池时

```properties
# DataSource Config
spring:
  datasource:
    driver-class-name: org.h2.Driver
    schema: classpath:db/schema-h2.sql
    data: classpath:db/data-h2.sql
    url: jdbc:h2:~/H2database
    username: ***
    password: ***
```

- mybatis-plus的配置

**MapperXml**，如果需要的话

```properties
mybatis-plus.mapper-locations=classpath:/mapper/*Mapper.xml
```

**配置类**

```java
@Configuration
@MapperScan("cn.shirtiny.community.SHcommunity.Mapper")
public class MybatisPlusConfig {
}
```

如果没有什么配置需要的话，直接在启动类加个@MapperScan注解就行了：

```java
package cn.shirtiny.community.SHcommunity;

import ...
@SpringBootApplication
@MapperScan("cn.shirtiny.community.SHcommunity.Mapper")
public class CommunityApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommunityApplication.class, args);
    }

}
```

**Mapper接口**

甚至什么都不用写

```java
package cn.shirtiny.community.SHcommunity.Mapper;

import ...

public interface InvitationMapper extends BaseMapper<Invitation> {
}

```

- ok，没错，能用了，直接调用mapper接口的方法就能操作数据库了。

[Mybatis-Plus的CRUD接口](https://mp.baomidou.com/guide/crud-interface.html#mapper-crud-%E6%8E%A5%E5%8F%A3)

## 如何分页

因为之前常用的是PageHelper，翻了翻Mybatis-Plus的文档，试了下，发现比PageHelper更方便，当然，因人而异。

[MP分页插件](https://mp.baomidou.com/guide/page.html)

- Mybatis-Plus内置分页插件的使用方式：

首先在刚刚Mybatis-Plus的配置类里添加：

```java
@Bean
public PaginationInterceptor paginationInterceptor() {
	return new PaginationInterceptor();
}
```

我的配置类

```java
package cn.shirtiny.community.SHcommunity.Config;

import ...

@EnableTransactionManagement
@Configuration
@MapperScan("cn.shirtiny.community.SHcommunity.Mapper")
public class MybatisPlusConfig {

    @Value("${myPageSize}")
    private long limit;

    /**
     * 分页插件
     */
    @Bean
    public PaginationInterceptor paginationInterceptor() {
        PaginationInterceptor paginationInterceptor = new PaginationInterceptor();
        // paginationInterceptor.setLimit(你的最大单页限制数量，默认 500 条，小于 0 如 -1 不受限制);
         paginationInterceptor.setLimit(limit);

        return paginationInterceptor;
    }

    //...其他配置
}
```

- 然后就可以用了
- 直接调用mapper接口的`selectPage()`方法即可，如：

```java
//null是查询条件为空，page是mybatis-plus提供的Page类
invitationMapper.selectPage(page,null);
//该方法，返回一个Ipage对象
```

- 实际使用：

```java
//分页展示首页的帖子
    @GetMapping("/")
    public String toIndexByPage(@RequestParam(value = "curPage",defaultValue = "1") long curPage ,Model model){//前往首页并分页
        Page<Invitation> page=new Page<>();
        page.setCurrent(curPage);
        IPage<Invitation> pageInfo = invitationService.selectBypage(page);
        model.addAttribute("pageInfo",pageInfo);
        //总页数
        long pages = pageInfo.getPages();
        //若当前页大于总页数
        if (curPage>pages){
            return "redirect:/?curPage="+pages;
        }
        //若已到最后一页
        if (curPage==pages){
            model.addAttribute("pageError","已经到最后一页喽~，后面的页数是装饰品O(∩_∩)O");
        }
        //控制的打印前端标签
        long[] pageNumArray=new long[7];
        long pageNum=curPage-3;
        for (int i=0;i<curPage+4;i++){
            if (i>=pageNumArray.length){
                break;
            }
            pageNumArray[i]=pageNum;
            pageNum++;
        }
        model.addAttribute("pageNumArray",pageNumArray);

        return "index";
    }
```

### 自定义分页

有时候我们需要自定sql语句，还想要分页，这方面的需求也是常有的。

其实很简单，你只需要在方法形参传入`Page`，返回`Ipage`即可，mybatis-plus自动帮你分页，比如：

```java
package cn.shirtiny.community.SHcommunity.Mapper;

import ...

public interface InvitationMapper extends BaseMapper<Invitation> {
	//自定义的分页方法
    @Select("select * from USER u join INVITATION i on u.ID=i.AUTHOR_ID")
    IPage<InvitationDTO> selectDtoByPage(Page<InvitationDTO> page);

}
```

**官方的描述：**

![](https://file.moetu.org/images/2019/09/23/1c42cdaf71101e7889bca7e380ce49be6e4c943b7972deb3.png)

### 注解

说一下基本使用，详细请查阅[官方文档](https://mp.baomidou.com/guide/annotation.html#tablename)

- [@TableName](https://github.com/baomidou/mybatis-plus/blob/3.0/mybatis-plus-annotation/src/main/java/com/baomidou/mybatisplus/annotation/TableName.java)

类对应的表名，如：

```java
@TableName("comment")
```

- [@TableId](https://github.com/baomidou/mybatis-plus/blob/3.0/mybatis-plus-annotation/src/main/java/com/baomidou/mybatisplus/annotation/TableId.java)

标识域为数据库表主键id，可设置id类型（数据库自增或无状态等），如：

```java
@TableId(value = "comment_id",type = IdType.AUTO)
```

- [@TableField](https://github.com/baomidou/mybatis-plus/blob/3.0/mybatis-plus-annotation/src/main/java/com/baomidou/mybatisplus/annotation/TableField.java)

非主键字段，可以指定字段名、是否为数据库表字段，插入时是否允许为空等，如：

```java
@TableField(value = "reviewer_id",insertStrategy = FieldStrategy.NOT_NULL)
```

基本的模型如：

```java
package cn.shirtiny.community.SHcommunity.Model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@TableName("comment")
@Data
public class Comment {
    //评论的主键id
    @TableId(value = "comment_id",type = IdType.AUTO)
    long commentId;
    //评论者id
    @TableField(value = "reviewer_id",insertStrategy = FieldStrategy.NOT_NULL)
    long reviewerId;
    //被评论的对象id
    @TableField(value = "target_id",insertStrategy = FieldStrategy.NOT_NULL)
    long targetId;
    //评论内容
    @TableField(value = "comment_content",insertStrategy = FieldStrategy.NOT_NULL)
    String commentContent;
    //创建时间
    @TableField(value = "created_time",insertStrategy = FieldStrategy.NOT_NULL)
    long createdTime;
}
```
