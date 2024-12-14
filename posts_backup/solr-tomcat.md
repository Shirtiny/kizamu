---
title: solr-tomcat集成
date: 2019-08-23 11:30:20
tags:
  - solr
categories: 学习经验
---

# 将solr从Jetty转到Tomcat、ik分词、数据库索引

- 复制一份tomcat，然后再solr根目录的同级目录新建一个文件夹用于存放集成后的solr，自定义名字solr_home

![](https://file.moetu.org/images/2019/08/23/4365a7c53a5290bf76295fbee90ef28e6d004ed5ec61acd2.png)

<!-- more -->

- 修改apache-tomcat-8.5.37\conf\server.xml，修改tomcat涉及的端口号，这里可以都加1

```xml
<Server port="8006" shutdown="SHUTDOWN">
<Connector connectionTimeout="20000" port="8081" protocol="HTTP/1.1" redirectPort="8443"/>
 <Connector port="8010" protocol="AJP/1.3" redirectPort="8443"/>
```

若已经配置了tomcat的环境变量，需要编辑bin/startup.bat，将if not "%CATALINA_HOME%" == "" goto gotHome注释掉( 前面加rem是注释)：

```bat
REM if not "%CATALINA_HOME%" == "" goto gotHome
```

参考：

[默认启动其他tomcat的问题](https://blog.csdn.net/qq_39403545/article/details/90759239)

[Rem注释](https://jingyan.baidu.com/article/a3aad71a0b7449b1fb009602.html)

- 在solr_home文件夹下，新建logs文件夹，然后修改Tomcat\bin下的catalina.bat，增加solr.log.dir系统变量，指定solr日志记录存放地址。

在set "JAVA_OPTS=%JAVA_OPTS% %JSSE_OPTS%"这句下，新增：

```xml
set "JAVA_OPTS=%JAVA_OPTS% -Dsolr.log.dir=D:\SolrRepo\solr_home\logs"
```

solr.log.dir的值为刚刚新建的logs文件夹的绝对路径。

- 把solr-8.0.0目录下的server/solr-webapp/webapps放置到tomcat/webapp的目录下，重命名为solr。
- 将solr-8.0.0\server\lib\ext下的所有jar包拷贝到tomcat里的webapps\solr\WEB-INF\lib
- 将solr-8.0.0\server\lib下 除jetty以外的jar拷贝到tomcat里的webapps\solr\WEB-INF\lib
- 将solr-8.0.0\dist下 jar包也拷贝到tomcat里的webapps\solr\WEB-INF\lib
- 放数据库连接驱动的jar包，如mysql-connector-java.jar到webapps\solr\WEB-INF\lib，顺便往solr-8.2.0\dist文件夹下也放一份数据库连接驱动的jar包。
- 在tomcat里的webapps\solr\WEB-INF下创建classes文件夹，将solr/server/resources下的配置文件拷贝到新建的classes文件夹里

- 把solr-8.0.0 里面的solr文件夹下全部的内容放入solr_home文件夹内（相当于复制一份solr文件夹，然后改名为solr_home ）

- 把solr-8.0.0下contrib和dist文件夹也拷贝至solr_home目录下

- 在solr_home目录下新建new_core文件夹；并拷贝solr-8.0.0\example\example-DIH\solr\db目录下所有文件至SolrHome\new_core下。

- 修改solr-home\new_core\conf\solrconfig.xml文件下的对应内容为：(改一下相对路径，加个mysql的连接驱动)

  ```xml
  <lib dir="${solr.install.dir:../}/contrib/extraction/lib" regex=".*\.jar" />
      <lib dir="${solr.install.dir:../}/dist/" regex="solr-cell-\d.*\.jar" />

      <lib dir="${solr.install.dir:../}/contrib/clustering/lib/" regex=".*\.jar" />
      <lib dir="${solr.install.dir:../}/dist/" regex="solr-clustering-\d.*\.jar" />

      <lib dir="${solr.install.dir:../}/contrib/langid/lib/" regex=".*\.jar" />
      <lib dir="${solr.install.dir:../}/dist/" regex="solr-langid-\d.*\.jar" />

      <lib dir="${solr.install.dir:../}/contrib/velocity/lib" regex=".*\.jar" />
      <lib dir="${solr.install.dir:../}/dist/" regex="solr-velocity-\d.*\.jar" />
      <lib dir="${solr.install.dir:../}/dist/" regex="ojdbc\d.*\.jar" />
      <lib dir="${solr.install.dir:../}/dist/" regex="solr-dataimporthandler\d.*\.jar" />
      <lib dir="${solr.install.dir:../}/dist/" regex="mysql-connector-java-*\.jar" />
  ```

  最后solr_home的文件夹内容：

  ![](https://file.moetu.org/images/2019/08/23/ed4dea174cb43001c0b95e96583c3acc0da2a3a3d21cdbe7.png)

- 配置tomcat→webApp→solr→WEB_INF下的web.xml，添加配置（指定solr数据源的位置）：

```xml
<env-entry>
    <env-entry-name>solr/home</env-entry-name>
    <!--这里填你建的solr_home文件夹的绝对路径 -->
    <env-entry-value>D:\SolrRepo\solr_home</env-entry-value>
    <env-entry-type>java.lang.String</env-entry-type>
</env-entry>
```

然后把 <1security-constraint>整个注释掉,目的是防止tomcat 403问题

```xml
  <!--
    <security-constraint>
    <web-resource-collection>
      <web-resource-name>Disable TRACE</web-resource-name>
      <url-pattern>/</url-pattern>
      <http-method>TRACE</http-method>
    </web-resource-collection>
    <auth-constraint/>
  </security-constraint>
  <security-constraint>
    <web-resource-collection>
      <web-resource-name>Enable everything but TRACE</web-resource-name>
      <url-pattern>/</url-pattern>
      <http-method-omission>TRACE</http-method-omission>
    </web-resource-collection>
  </security-constraint>
-->
```

## 添加ik中文分词器

[ik分词器jar包](https://search.maven.org/search?q=com.github.magese)

- 将下载好的jar包放入Tomcat 8.5/webapps/solr/WEB-INF/lib目录中

- 打开solr_home/new_core/conf目录中的managed-schema文件，添加如下代码：

```xml
  <!-- ik分词器 -->
  <fieldType name="text_ik" class="solr.TextField">
    <analyzer type="index">
        <tokenizer class="org.wltea.analyzer.lucene.IKTokenizerFactory" useSmart="false" conf="ik.conf"/>
        <filter class="solr.LowerCaseFilterFactory"/>
    </analyzer>
    <analyzer type="query">
        <tokenizer class="org.wltea.analyzer.lucene.IKTokenizerFactory" useSmart="true" conf="ik.conf"/>
        <filter class="solr.LowerCaseFilterFactory"/>
    </analyzer>
  </fieldType>
```

- 在界面Analysis的Analyse Fieldname / FieldType:中选text_ik即可使用。

## 添加数据库索引

- 在solr_home\你的核心\conf下的managed-schema，配置域信息，用来接收数据库数据的对应字段

```xml

  <!--solr需要数据有个固定的主键id，而那个id是由solr配置好的，名为id的域。所以应该把数据库表的主键id绑定到solr自带的名为id的域上，所以不需要再自定一个其他名称的id <field name="solr_id" type="plong" stored="true" required="true" indexed="false" /> -->
  <field name="solr_title" type="text_ik" stored="true" indexed="true" required="true"/>
  <field name="solr_sell_point" type="text_ik" stored="true" indexed="true" required="true"/>
  <field name="solr_price" type="plong" stored="true" indexed="true" required="true"/>
  <field name="solr_num" type="pint" stored="true" indexed="true" required="true"/>
  <field name="solr_barcode" type="string" stored="true" indexed="false" required="false"/>
  <field name="solr_image" type="string" stored="true" indexed="false" required="false"/>
  <field name="solr_cid" type="plong" stored="true" indexed="false" required="true"/>
<!--注意，数据库中tinyInt的数据类型，在solr默认提供的数据类型中，是找不到对应类型的。 -->
<field name="solr_status" type="pint" stored="true" indexed="true" required="true"/>
  <field name="solr_created" type="pdate" stored="true" indexed="false" required="true"/>
  <field name="solr_updated" type="pdate" stored="true" indexed="false" required="true"/>

  <!-- 复制域只是用来搜索便利，提高搜索的性能，要有多值、分词、可被索引、但不存储、无类型 -->
  <field name="tao_keywords" type="text_ik" indexed="true" stored="false" multiValued="true" />
  <copyField source="solr_title" dest="tao_keywords"  />
  <copyField source="solr_sell_point" dest="tao_keywords"  />
  <copyField source="solr_price" dest="tao_keywords"  />
  <copyField source="solr_num" dest="tao_keywords"  />
  <copyField source="solr_status" dest="tao_keywords"  />
```

- 在solr_home\你的核心\conf下的db-data-config.xml配置数据库数据信息，&符号需要使用`&amp;`来替换，如果数据库表中有tinyInt的数据类型，需要设置tinyInt1isBit=false或true，详情：

  [solr中tinyInt1isBit的设置](https://blog.csdn.net/ldr1109/article/details/94674805)

  [solr中tinyInt转boolean](https://www.bbsmax.com/A/x9J2x8VNd6/)

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<dataConfig>
    <dataSource type="JdbcDataSource" driver="com.mysql.jdbc.Driver"
    url="jdbc:mysql://localhost:3306/taotao?useUnicode=true&amp;characterEncoding=UTF-8&amp;useSSL=false&amp;tinyInt1isBit=false"
    user="root" password="123456"
     />
    <document>
        <!--自定义的实体名，查询语句。根据返回结果，将数据库表的字段名与solr域名绑定 -->
        <entity name="taoDB" query="SELECT * from tb_item" >
            <field column="id" name="id" />
            <field column="title" name="solr_title" />
            <field column="sell_point" name="solr_sell_point" />
            <field column="price" name="solr_price" />
            <field column="num" name="solr_num" />
            <field column="barcode" name="solr_barcode" />
            <field column="image" name="solr_image" />
            <field column="cid" name="solr_cid" />
            <field column="status" name="solr_status" />
            <field column="created" name="solr_created" />
            <field column="updated" name="solr_updated" />

        </entity>
    </document>
</dataConfig>
```

**tips：**

**在xml的sql语句中，不能直接用大于号、小于号要用转义字符**

**解决方式：**

转义字符：

- `&lt;`是<，小于号

- `&gt;`是>，大于号

- `&amp;`是&，和

- `&apos;`是'，单引号

- `&quot;`是"，双引号

或

**使用`<![CDATA[]]>`标记**：

`<![CDATA[ state <= 3 ]]>`

不过要注意，`<![CDATA[ ]]>`标记的sql语句中的`<where> <if>`等标签不会被解析

参考文章：

https://blog.csdn.net/weixin_42613538/article/details/89516198

https://blog.csdn.net/ailian_f/article/details/89407754

https://blog.csdn.net/l1336037686/article/details/80723636
