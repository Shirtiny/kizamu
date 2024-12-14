---
title: js的数据精度问题
date: 2019-10-17 14:42:18
tags:
  - Mybatis
  - long
  - json
categories: 开发经验
---

# 前后端数值传递中的 js数值精度损失问题

<!-- more -->

### 问题图示：

**原数值**

后端传递的值为`1176037389258023221`：

![](https://file.moetu.org/images/2019/10/17/cbecdc0b7728a86e96c930cd0419c339b172f14261716815.png)

**接收值**
js接收到的值为：`1176037389258023200`

![](https://file.moetu.org/images/2019/10/17/57e12c78761766e7fa618de69008fc33fcc83981026d8bd0.png)

### 产生原因：

> JavaScript的Number类型能表示并进行精确算术运算的安全整数范围为：正负2^53^-1，16位数

所以对于后台的long类型数据，在数值过大时，就会出现精度损失。

### 解决方案：

{% note info %}

由于接收时的数据就是损失状态，所以不好在js中直接处理，当然，也有一些方式能够解决这个问题。比如`jison`，通过它可以对要接收的数据的重新定义`json parser`。

不过，这种情况一般都会交给后端解决，让传递的值转为字符串，这样就不会有精度损失的问题。

{% endnote %}

**后端(java)解决方式示例：**

①使用`@JsonSerialize`注解，作用于实例域的Get方法，在数据输出时将其转为字符串，如：

```java
package cn.shirtiny.community.SHcommunity.DTO;

import ...

@Data
public class InvitationDTO {
	//输出时转字符串
    @JsonSerialize(using = ToStringSerializer.class)//作用于属性的get方法
    private long invitationId;//主键id
    //输出时转字符串
    @JsonSerialize(using = ToStringSerializer.class)
    private long authorId; //作者id
    @JsonSerialize(using = ToStringSerializer.class)
    private long gmtCreate;//作者的注册时间
}
```

②直接将DTO对象关于`Long`类型的属性，设为`String`类型，在与数据库交互时，进行类型转换：

```java
package cn.shirtiny.community.SHcommunity.DTO;

import ...

@Data
public class InvitationDTO {
    private String invitationId;//主键id
    private String authorId; //作者id
    private String gmtCreate;//作者的注册时间
}
```

> 注：这里我使用的是Mybatis-Plus，在交互时，会自动进行`BigInt`和`String`的转换。如果需要字符串类型的uuid，可以使用以下方式，在mapper里写
>
> ```java
> // 返回String类型的UUID
> @Select("SELECT UUID_SHORT()")
> String getShortStrUUid();
> ```

③全局类型转换器，这个就需要考虑很多东西了。
