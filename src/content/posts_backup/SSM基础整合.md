---
title: SSM基础整合
date: 2019-07-08 11:07:47
tags:
  - java
  - 开发知识
  - SSM
categories: 学习经验
---

# SSM基础整合

## Zero. 创建Maven项目， pom依赖：

<!-- more -->

```xml
<?xml version="1.0" encoding="UTF-8"?>

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.SH</groupId>
  <artifactId>SSM_01Project</artifactId>
  <version>1.0-SNAPSHOT</version>
  <packaging>war</packaging>

  <name>SSM_01Project Maven Webapp</name>
  <!-- FIXME change it to the project's website -->
  <url>http://www.example.com</url>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.7</maven.compiler.source>
    <maven.compiler.target>1.7</maven.compiler.target>
    <spring.version>4.3.3.RELEASE</spring.version>
    <slf4j.version>1.6.6</slf4j.version>
    <log4j.version>1.2.12</log4j.version>
    <mysql.version>5.1.6</mysql.version>
    <mybatis.version>3.4.5</mybatis.version>
    <jackson.version>2.6.1</jackson.version>
  </properties>

  <dependencies>

    <!-- spring -->
    <dependency>
      <groupId>org.aspectj</groupId>
      <artifactId>aspectjweaver</artifactId>
      <version>1.6.8</version>
    </dependency>

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-aop</artifactId>
      <version>${spring.version}</version>
    </dependency>

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>${spring.version}</version>
    </dependency>

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-web</artifactId>
      <version>${spring.version}</version>
    </dependency>

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-webmvc</artifactId>
      <version>${spring.version}</version>
    </dependency>

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-test</artifactId>
      <version>${spring.version}</version>
    </dependency>

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-tx</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-jdbc</artifactId>
      <version>${spring.version}</version>
    </dependency>

    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.12</version>
      <scope>compile</scope>
    </dependency>

    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <version>${mysql.version}</version>
    </dependency>

    <dependency>
      <groupId>javax.servlet</groupId>
      <artifactId>servlet-api</artifactId>
      <version>2.5</version>
      <scope>provided</scope>
    </dependency>

    <dependency>
      <groupId>javax.servlet.jsp</groupId>
      <artifactId>jsp-api</artifactId>
      <version>2.0</version>
      <scope>provided</scope>
    </dependency>

    <dependency>
      <groupId>jstl</groupId>
      <artifactId>jstl</artifactId>
      <version>1.2</version>
    </dependency>

    <!-- log start -->
    <dependency>
      <groupId>log4j</groupId>
      <artifactId>log4j</artifactId>
      <version>${log4j.version}</version>
    </dependency>

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-api</artifactId>
      <version>${slf4j.version}</version>
    </dependency>

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-log4j12</artifactId>
      <version>${slf4j.version}</version>
    </dependency>

    <!-- log end -->
    <dependency>
      <groupId>org.mybatis</groupId>
      <artifactId>mybatis</artifactId>
      <version>${mybatis.version}</version>
    </dependency>

    <dependency>
      <groupId>org.mybatis</groupId>
      <artifactId>mybatis-spring</artifactId>
      <version>1.3.0</version>
    </dependency>

    <dependency>
      <groupId>c3p0</groupId>
      <artifactId>c3p0</artifactId>
      <version>0.9.1.2</version>
      <type>jar</type>
      <scope>compile</scope>
    </dependency>

    <dependency>
      <groupId>commons-dbcp</groupId>
      <artifactId>commons-dbcp</artifactId>
      <version>1.4</version>
    </dependency>


<!--json数据格式-->
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-core</artifactId>
      <version>${jackson.version}</version>
    </dependency>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>${jackson.version}</version>
    </dependency>

    <!--sql 解析工具依赖,配合分页使用-->
    <dependency>
      <groupId>com.github.jsqlparser</groupId>
      <artifactId>jsqlparser</artifactId>
      <version>0.9.5</version>
    </dependency>
    <!--myBatis分页插件 -->
    <dependency>
      <groupId>com.github.pagehelper</groupId>
      <artifactId>pagehelper</artifactId>
      <version>5.1.2</version>
    </dependency>


  </dependencies>

  <build>
    <finalName>SSM_01Project</finalName>
    <pluginManagement><!-- lock down plugins versions to avoid using Maven defaults (may be moved to parent pom) -->
      <plugins>
        <plugin>
          <artifactId>maven-clean-plugin</artifactId>
          <version>3.1.0</version>
        </plugin>
        <!-- see http://maven.apache.org/ref/current/maven-core/default-bindings.html#Plugin_bindings_for_war_packaging -->
        <plugin>
          <artifactId>maven-resources-plugin</artifactId>
          <version>3.0.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.8.0</version>
        </plugin>
        <plugin>
          <artifactId>maven-surefire-plugin</artifactId>
          <version>2.22.1</version>
        </plugin>
        <plugin>
          <artifactId>maven-war-plugin</artifactId>
          <version>3.2.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-install-plugin</artifactId>
          <version>2.5.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-deploy-plugin</artifactId>
          <version>2.8.2</version>
        </plugin>

        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.2</version>
          <configuration>
            <source>1.8</source>
            <target>1.8</target>
            <encoding>UTF-8</encoding>
            <showWarnings>true</showWarnings>
          </configuration>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>

```

## 1. ApplicationContext.xml

- 新建db.properties，写数据库配置需要的数据
- 加载db.properties，class为：**PreferencesPlaceholderConfigurer**，属性locations下用array，value，classpath引用db.properties
- datasource，class为：**BasicDatasource**，property下配置数据库链接信息
- sqlSessionFactory，Class为：**SqlSessionFactroyBean**，属性需要引用datasource和mapperlocations值为classpath：\*.xml加载mybatis的mapperxml
- mappers**批量生成mapper接口的对象**，class为：**MapperScannerConfigurer**，注意属性basePackage的值用value，而不是ref
- 开启注解扫描，**component-scan**，并且使用排除Controller**注解**（**annotation**），（**org.springframework.stereotype.Controller**）
- 配置事务管理，**DataSourceTransactionManager**，其属性中引入**datasource**，开启事务注解支持:**<tx:annotation-driven**,空格后配置**transaction-manager**属性将上面bean的**id值**输入
- 代码：

`db.properties`

```properties
driver=com.mysql.jdbc.Driver
url=jdbc:mysql://localhost:3306/database
username=root
password=123456
```

`log4j.properties`

```properties
# Set root category priority to INFO and its only appender to CONSOLE.
#log4j.rootCategory=INFO, CONSOLE            debug   info   warn error fatal
log4j.rootCategory=info, CONSOLE, LOGFILE

# Set the enterprise logger category to FATAL and its only appender to CONSOLE.
log4j.logger.org.apache.axis.enterprise=FATAL, CONSOLE

# CONSOLE is set to be a ConsoleAppender using a PatternLayout.
log4j.appender.CONSOLE=org.apache.log4j.ConsoleAppender
log4j.appender.CONSOLE.layout=org.apache.log4j.PatternLayout
log4j.appender.CONSOLE.layout.ConversionPattern=%d{ISO8601} %-6r [%15.15t] %-5p %30.30c %x - %m\n

# LOGFILE is set to be a File appender using a PatternLayout.
log4j.appender.LOGFILE=org.apache.log4j.FileAppender
log4j.appender.LOGFILE.File=d:\axis.log
log4j.appender.LOGFILE.Append=true
log4j.appender.LOGFILE.layout=org.apache.log4j.PatternLayout
log4j.appender.LOGFILE.layout.ConversionPattern=%d{ISO8601} %-6r [%15.15t] %-5p %30.30c %x - %m\n


```

`ApplicationContext.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context" xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
	http://www.springframework.org/schema/beans/spring-beans.xsd
	http://www.springframework.org/schema/context
	http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx.xsd">

<!--    数据源-->
<bean id="dbproperties" class="org.springframework.beans.factory.config.PreferencesPlaceholderConfigurer">
    <property name="locations">
        <array>
            <value>classpath:db.properties</value>
        </array>
    </property>
</bean>
    <bean id="datasource" class="org.apache.commons.dbcp.BasicDataSource">
    <property name="driverClassName" value="${driver}"/>
    <property name="url" value="${url}"/>
    <property name="username" value="${username}"/>
    <property name="password" value="${password}"/>
</bean>

<bean id="sqlsessionFactroy" class="org.mybatis.spring.SqlSessionFactoryBean">
    <property name="dataSource" ref="datasource"/>
    <property name="mapperLocations" value="classpath:MapperXml/*.xml"/>
<!--    插件列表-->
    <property name="plugins">
        <array>
<!--            myBatis分页-->
            <bean class="com.github.pagehelper.PageInterceptor">
                <property name="properties">
                    <value>helperDialect=mysql</value>
                </property>
            </bean>
        </array>
    </property>
</bean>

<!--    批量生成mapper对象-->
<bean id="mappers" class="org.mybatis.spring.mapper.MapperScannerConfigurer">
    <property name="basePackage" value="com.SH.mapper"/>
</bean>

<!--    注解扫描，不扫描Controller-->
    <context:component-scan base-package="com.SH">
        <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
    </context:component-scan>

<!--事务管理-->
    <bean id="transManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="datasource"/>
    </bean>
<!-- 事务注解支持-->
    <tx:annotation-driven transaction-manager="transManager"/>
</beans>
```

## 2. mpper.xml

- 配置mybaitis的mpper.xml
- 代码：

`MapperXml/VocaloidMapper.xml`（放置在resources/MapperXml包下）

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">


<mapper namespace="com.SH.mapper.VocaloidMapper">

    <select id="selectAll" resultType="com.SH.bean.Vocaloid">
    select * from vocaloid
    </select>

</mapper>
```

## 3. 建立数据库表的对应类

- 生成set、get方法，构造器，重写toString
- 代码：

`com.SH.bean.Vocaloid`

```java
package com.SH.bean;

public class Vocaloid {
private Integer id;
private String name;
private Integer sex;
private String color;
private Integer team_id;

    public Vocaloid() {
    }

    @Override
    public String toString() {
        return "Vocaloid{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", sex=" + sex +
                ", color='" + color + '\'' +
                ", team_id=" + team_id +
                '}';
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSex() {
        return sex;
    }

    public void setSex(Integer sex) {
        this.sex = sex;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getTeam_id() {
        return team_id;
    }

    public void setTeam_id(Integer team_id) {
        this.team_id = team_id;
    }

    public Vocaloid(Integer id, String name, Integer sex, String color, Integer team_id) {
        this.id = id;
        this.name = name;
        this.sex = sex;
        this.color = color;
        this.team_id = team_id;
    }
}

```

## 3. Mapper接口

- 建立mapper.xml对应的接口
- 代码：

`com.SH.mapper.VocaloidMapper`

```java
package com.SH.mapper;

import com.SH.bean.Vocaloid;

import java.util.HashMap;
import java.util.List;

public interface VocaloidMapper {

    List<Vocaloid> selectAll();

}

```

## 4. springMVC.xml

- 开启mvc注解支持，**annotation-driven**
- 开启注解扫描**component-scan**，使用**base-package**只扫描Controller包
- 配置视图解析器**InternalResourceViewResolver**,prefix前缀，suffix后缀
- 代码：

`springMVC.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:mvc="http://www.springframework.org/schema/mvc" xmlns:context="http://www.springframework.org/schema/context"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

<!--    配置组件扫描，注解扫描，只扫描Controller包-->
<context:component-scan base-package="com.SH.controller"/>

<!--    开启mvc注解驱动，处理器映射器，处理器解析器-->
    <mvc:annotation-driven/>

<!--    视图解析器-->
    <bean id="internalviewresovler" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/resources/jsp/"/>
        <property name="suffix" value=".jsp"/>
    </bean>


<!--释放静态资源，对静态资源使用原生态servlet-->
<mvc:default-servlet-handler/>

<!--    配置放置静态资源的路径-->
<!--    <mvc:resources mapping="/resources/**" location="/resources/"/>-->

</beans>
```

## 5. web.xml

- 配置spring，使用listener,class为**ContextLoaderListener**,再使用**Context-Param**指定spring配置文件的位置
- 配置springMVC，使用servlet标签，class为**DispatcherServlet**,使用**init-param**初始化参数，使用**load-on-start**配置随服务器加载，最后再**servlet-mapping**设置需要拦截的请求，如\*.action
- 配置解决中文的过滤器(**filter**)，class为：**CharacterEncodingFilter**,使用**init-param**初始化参数（参数名为**encoding**，值为utf-8） ,在filter-mapping里拦截所有请求（/\*）
- [classPath的使用](https://www.cnblogs.com/EasonJim/p/6709314.html)
- 代码：

`web.xml`

```xml
<!DOCTYPE web-app PUBLIC
 "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
 "http://java.sun.com/dtd/web-app_2_3.dtd" >

<web-app>
  <display-name>Archetype Created Web Application</display-name>

  <!--配置spring-->
  <listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
  </listener>
  <context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:ApplicationContext.xml</param-value>
  </context-param>

<!--  配置springMVC-->
<servlet>
  <servlet-name>Dispatchservlet</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <init-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:springMVC.xml</param-value>
  </init-param>
<load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
  <servlet-name>Dispatchservlet</servlet-name>
  <url-pattern>*.action</url-pattern>
</servlet-mapping>

<!--  配置解决中文乱码的过滤器-->
  <filter>
    <filter-name>charactEncoding</filter-name>
    <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
    <init-param>
      <param-name>encoding</param-name>
      <param-value>utf-8</param-value>
    </init-param>
  </filter>
  <filter-mapping>
    <filter-name>charactEncoding</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>

</web-app>

```
