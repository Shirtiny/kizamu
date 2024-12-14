---
title: int和Integer的区别
date: 2019-07-06 18:45:45
tags:
  - java
  - 开发知识
categories: 学习经验
---

### int和Integer的区别

1. **int**是八大基本数据类型（byte，char，short，int，long，float，double，boolean）之一，而Integer是int 包装类，所以

   - int的默认值是0

- Integer的默认值是null

2. **在**JDK1.5以后，Integer 有自动装箱和拆箱的语法糖。
   - 自动装箱,假如写个Integer a：

     - 其实为：Integer a=Integer.valueOf(int a);

   - 自动拆箱，当涉及到计算时，如a+b：

- 其实为：a.intValue()+b.intValue();

  <!-- more -->

3. **Integer**创建对象时，若数值在[-128,127]区间，第一次声明会将值放入缓存，第二次时会直接将上次缓存里的值给对象，所以地址不变，不是重新创建一个Ingeter 对象。

   > public static void main(String[] args) {
   > 　Integer i = 10;
   > 　Integer j = 10;
   > 　System.out.println(i == j);
   > 　}//结果为true
   >
   > 分析源码我们可以知道在 i >= -128 并且 i <= 127 的时候，第一次声明会将 i 的值放入缓存中，第二次直接取缓存里面的数据，而不是重新创建一个Ingeter 对象。
   > 　那么第一个打印结果因为 i = 10 在缓存表示范围内，所以为 true。

4. **当值**为128时，不放入缓存,会重新创建对象，地址变化:

   > Integer i =128;
   > 　Integer j = 128;
   > 　System.out.println(i == j);
   > 　}//结果为false

5. **两个**Integer对象比较时，使用equals

6. **定义**泛型时，必须使用Integer，而不是int，泛型参数必须是一个类，即Object的子类

   > Map<String,Object> map1
   >
   > Map<Integer,Object> map2
