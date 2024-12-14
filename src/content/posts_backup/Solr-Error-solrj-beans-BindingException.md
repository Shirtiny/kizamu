---
title: Solr-Error
date: 2019-09-03 22:20:38
tags:
  - solrJ
categories: 开发问题
---

# 控制台：

> Exception in thread “main” org.apache.solr.client.solrj.beans.BindingException:
>
> Could not instantiate object of class com.SH.Rest.Pojo.Solr_pojo

**异常产生经过：**

在使用`SolrJ`时，调用`SolrClient`对象的`addBean()`方法以及`QueryResponse`对象的`getBeans()`方法时，抛出异常。

<!-- more -->

```java
solrClient.addBean(pojo);
//以及
QueryResponse queryResponse = solrClient.query(query);
List<Solr_pojo> solr_pojos = queryResponse.getBeans(Solr_pojo.class);
```

**异常全文：**

{% note  warnning %}

Exception in thread “main” org.apache.solr.client.solrj.beans.BindingException: Could not instantiate object of class com.SH.Rest.Pojo.Solr_pojo
at org.apache.solr.client.solrj.beans.DocumentObjectBinder.getBean(DocumentObjectBinder.java:71)
at org.apache.solr.client.solrj.beans.DocumentObjectBinder.getBeans(DocumentObjectBinder.java:50)
at org.apache.solr.client.solrj.response.QueryResponse.getBeans(QueryResponse.java:646)
at com.SH.Rest.Service.serviceImpl.SearchServiceImpl.query(SearchServiceImpl.java:32)
at com.SH.Rest.Service.serviceImpl.SearchServiceImpl.main(SearchServiceImpl.java:41)
Caused by: java.lang.InstantiationException: com.SH.Rest.Pojo.Solr_pojo
at java.lang.Class.newInstance(Class.java:427)
at org.apache.solr.client.solrj.beans.DocumentObjectBinder.getBean(DocumentObjectBinder.java:65)
… 4 more
Caused by: java.lang.NoSuchMethodException: com.SH.Rest.Pojo.Solr_pojo.()
at java.lang.Class.getConstructor0(Class.java:3082)
at java.lang.Class.newInstance(Class.java:412)
… 5 more
Disconnected from the target VM, address: ‘127.0.0.1:1331’, transport: ‘socket’

Process finished with exit code 1

{% endnote %}

**解决方法：**

{% note  success %}

无法实例化对象，可能是因为**属性类型**不匹配，要仔细检查对象类与solr域的类型是否对应，是否做好转换，另外还需检查有无**空构造器**，以及setter&getter参数类型是否有误。

{% endnote %}

**样例**

下面给出我当时改后的pojo类与solr域的示例。

- **Solr_pojo类**

```java
package com.SH.Rest.Pojo;

import org.apache.solr.client.solrj.beans.Field;

import java.util.Date;

public class Solr_pojo {

    @Field("id")
    private String id;

    @Field("solr_title")
    private String title;

    @Field("solr_sell_point")
    private String sellPoint;

    @Field("solr_price")
    private Long price;

    @Field("solr_num")
    private Integer num;

    @Field("solr_barcode")
    private String barcode;

    @Field("solr_image")
    private String image;

    @Field("solr_cid")
    private Long cid;

    @Field("solr_status")
    private int status;

    @Field("solr_created")
    private Date created;

    @Field("solr_updated")
    private Date updated;

    //...
    //setter&getter&各种构造器重载，别忘了空构造
}
```

- **managed-schema**，solr域配置

```xml
<!-- <field name="solr_id" type="plong" stored="true" required="true" indexed="false" /> -->
 <field name="solr_title" type="text_ik" stored="true" indexed="true" required="true"/>
 <field name="solr_sell_point" type="text_ik" stored="true" indexed="true" required="true"/>
 <field name="solr_price" type="plong" stored="true" indexed="true" required="true"/>
 <field name="solr_num" type="pint" stored="true" indexed="true" required="true"/>
 <field name="solr_barcode" type="string" stored="true" indexed="false" required="false"/>
 <field name="solr_image" type="string" stored="true" indexed="false" required="false"/>
 <field name="solr_cid" type="plong" stored="true" indexed="false" required="true"/>
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
