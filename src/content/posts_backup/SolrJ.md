---
title: SolrJ
date: 2019-09-03 22:07:03
tags:
  - solr
  - java
categories: 学习经验
---

# SolrJ

SolrJ是Solr的java客户端实现，通过java代码连接solr服务器，并使用。

## 依赖

```xml
<dependency>
    <groupId>org.apache.solr</groupId>
    <artifactId>solr-solrj</artifactId>
    <version>8.2.0</version>
</dependency>
```

<!-- more -->

## 对象绑定

@field注解，注解中的值为，该字段对应的solr域的名称

```java
public class Solr_pojo {

    @Field("id")
    private String id;

    @Field("solr_title")
    private String title;

    @Field("solr_sell_point")
    private String sellPoint;

    @Field("solr_price")
    private Long price;
	...

    //setter&getter
```

## 单机模式

### URL和HttpSolrClient

注意上下两个`URL`的区别

```java
//直接指定solr的URL和core1，只能查询或更新core1内容
String URL="http://my-solr-server:8983/solr/core1";
SolrClient client = new HttpSolrClient(URL);
QueryResponse resp = client.query(new SolrQuery("*:*"));
```

```java
//指定solr的URL，查询或更新时要指定core
String URL="http://my-solr-server:8983/solr";
SolrClient client = new HttpSolrClient(URL);
QueryResponse resp = client.query("core1", new SolrQuery("*:*"));
```

### 新增和更新

方式①：**add(SolrInputDocument)**

```java
SolrInputDocument fields = new SolrInputDocument();
	fields.addField("id","224895477");
	fields.addField("solr_title","shirtiny");
	...

solrClient.add(fields);

solrClient.commit();
solrClient.close();
```

方式②：**addBean**

```java
Solr_pojo pojo=new Solr_pojo();//Solr_pojo是一个自定义的，与solr索引域对应的pojo类
pojo.setId("224895477");
pojo.setTitle("shirtiny");
//...

UpdateResponse response = solrClient.addBean(pojo);//把对象传入，solr会根据id进行覆盖


solrClient.commit();
solrClient.close();
```

其中`UpdateResponse`返回的是状态码和执行耗时。

### 删除

#### ById:

- 单个：`deleteById("id");`

```java
UpdateResponse response = solrClient.deleteById("2248954774");
solrClient.commit();
solrClient.close();
```

- 批量：`deleteById(List);`

直接创建一个id的List集合

```java
List<String> ids=new ArrayList<>();
  ids.add("224895477");
  ids.add("2248954771");
  ids.add("2248954772");
  ids.add("2248954773");

UpdateResponse response = solrClient.deleteById(ids);
solrClient.commit();
solrClient.close();
```

**或**

把按照一定格式，包含多个id的字符串，用split分成数组，然后再用Arrays.asList()方法把数组转成List集合

```java
String ids="224895477,2248954771,2248954772,2248954773,4564564564";
String[] idSplit = ids.split(",");
List<String> idList = Arrays.asList(idSplit);

UpdateResponse response = solrClient.deleteById(ids);
solrClient.commit();
solrClient.close();
```

#### ByQuery:

`deleteByQuery("x:x");`删除所有查询到的数据。

```java
UpdateResponse response = solrClient.deleteByQuery("solr_title:手机");
solrClient.commit();
solrClient.close();
```

## 查询

#### 基本查询

```java
SolrQuery query=new SolrQuery("*:*");
QueryResponse response = solrClient.query(query);
solrClient.close();
//或
SolrQuery query=new SolrQuery();
query.set("q","solr_title:手机 AND solr_sell_point:清仓 OR solr_title:老年人");
 QueryResponse response = solrClient.query(query);
//tips:
//df设置默认搜索域，设置默认域后q值不用加字段名
query.set("df","myKeyWords");
query.set("q","手机");
```

#### 结果筛选

- set方式

```java
query.set("fq","solr_price:[* TO 9999]","solr_title:联通");
```

- setFilterQueries方式

```java
query.setFilterQueries("solr_price:[* TO 9999]","solr_title:联通");
```

- addFilterQuery方式

```java
query.addFilterQuery("solr_price:[* TO 9999]");
query.addFilterQuery("solr_title:联通");
```

#### 结果排序

- addSort，`SolrQuery.ORDER.asc`顺序，`SolrQuery.ORDER.desc`倒序

```java
query.addSort("solr_price", SolrQuery.ORDER.asc);//价格顺序
query.addSort("solr_title", SolrQuery.ORDER.desc);//标题倒序
query.addSort("score", SolrQuery.ORDER.desc);//匹配得分倒序
```

#### 结果分页

- setStart、setRows

```java
int pageNum=5;
int rows=60;
query.setStart((pageNum-1)*rows);//start=（当前页数-1）*rows
query.setRows(rows);//每页条数
```

#### 结果回显

- set

```java
query.set("fl","*,score");//*表示显示全部信息，score表示增加匹配得分的显示
```

- setFields

```java
query.setFields("solr_title","score");
```

### 关键字高亮

```java
//开启高亮功能
query.setHighlight(true);
//添加需要高亮的字段（域）
query.addHighlightField("solr_title");
query.addHighlightField("solr_price");
//高亮前缀
query.setHighlightSimplePre("<em>");
//高亮后缀
query.setHighlightSimplePost("</em>");

//查询
QueryResponse response = solrClient.query(query);
//拿到高亮集合
Map<String, Map<String, List<String>>> highlighting = response.getHighlighting();
```

#### 响应集合

- 可直接将结果转为对象集合

```java
QueryResponse queryResponse = solrClient.query(query);
List<Solr_pojo> solr_pojos = queryResponse.getBeans(Solr_pojo.class);
```

#### 响应头

- header包括查询的值、查询的条件、耗时、状态码、响应类型等信息。

```java
NamedList<Object> header = queryResponse.getHeader();
```

#### Results结果集、结果属性

- 查询结果

```java
//获取查询的结果集
SolrDocumentList results = response.getResults();//查询到的结果集
        results.getNumFound();//共查询到多少条数据
        results.getMaxScore();//关键字的最大匹配得分
        results.getStart();//偏移量，即分页的start，正常分页的话是(当前页码-1)*rows
//遍历得到单个结果对象
List<Solr_pojo> solrPojos=new ArrayList<>();
        for (SolrDocument result:results){
            String id = (String) result.getFieldValue("id");
            // String title = (String) result.get("solr_title");
            String title = (String)result.getFieldValue("solr_title");
            System.out.println(id+"\t"+title);
            Solr_pojo solrPojo=new Solr_pojo(id,title);
            solrPojos.add(solrPojo);

        }
        System.out.println(solrPojos);
```

- 高亮域替换查询结果

```java
List<Solr_pojo> solrPojos=new ArrayList<>();
       //拿到高亮区域
       Map<String, Map<String, List<String>>> highlighting = response.getHighlighting();
       for (SolrDocument result:results){

           String id =(String) result.get("id");//从result拿到id
           Map<String, List<String>> listMap = highlighting.get(id);//因为高亮区域与结果中的id是相同的，所以可以通过上述id取到高亮区域的<高亮域名，value数组>的集合
           List<String> solr_titles = listMap.get("solr_title");//通过高亮域名，拿到高亮值value的数组
           String title = solr_titles.get(0);//list里只有1个值，index的0号位置，便是高亮的值了
           System.out.println(id+"\t"+title);
           Solr_pojo solrPojo=new Solr_pojo(id,title);
           solrPojos.add(solrPojo);

       }
       System.out.println(solrPojos);
```

## 集群模式

使用的SolrClient，由HttpSolrClient，变为CloudSolrClient，然后要记得设置默认索引集合，其他与单机模式一样。

```java
CloudSolrClient client=new CloudSolrClient("192.168.249.131:2181,192.168.249.131:2182,192.168.249.131:2183");

client.setDefaultCollection("collection1");
```
