---
title: Jedis的Spring整合、Redis缓存
date: 2019-08-18 21:14:37
tags:
  - Redis
  - Jedis
  - SSM
  - java
categories: 学习经验
---

# Spring整合Jedis使用Redis

Jedis是Redis的java版本客户端的实现，通过它，我们可以轻松的创建一个jedis对象来操作Redis数据库，或者将Redis做为缓存使用。

<!-- more -->

## Maven依赖

**Official Releases**

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.1.0</version>
    <type>jar</type>
    <scope>compile</scope>
</dependency>
```

**Snapshots**

```xml
  <dependencies>
    <dependency>
      <groupId>redis.clients</groupId>
      <artifactId>jedis</artifactId>
      <version>3.2.0-SNAPSHOT</version>
    </dependency>
  </dependencies>
```

## 基本使用

**单节点**

- 直连方式

```java
//通过连接和端口号，就可以拿到jedis对象
Jedis jedis=new Jedis("192.168.1.105",6379);

//通过jedis对象，使用命令来操作即可
jedis.set("abc","123");
String abc = jedis.get("abc");
//记得释放
 jedis.close();
```

- 连接池方式

```java
//先拿到连接池对象
JedisPool pool=new JedisPool("192.168.1.105",6379);
//再通过连接拿到实例
Jedis jedis = pool.getResource();

jedis.set("gg","2");
String gg = jedis.get("gg");

//释放连接
jedis.close();
pool.close();
```

**多节点集群**

```java
//nodes，需要一个Set集合来存放节点（因为set内是不重复的），实现使用HashSet
Set<HostAndPort> nodes=new HashSet<HostAndPort>();
//单个node
HostAndPort node1 = new HostAndPort("192.168.1.105", 7001);
//放入nodes集合
nodes.add(node1);

//推荐写法
        nodes.add(new HostAndPort("192.168.1.105",7002));
        nodes.add(new HostAndPort("192.168.1.105",7003));
        nodes.add(new HostAndPort("192.168.1.105",7004));
        nodes.add(new HostAndPort("192.168.1.105",7005));
        nodes.add(new HostAndPort("192.168.1.105",7006));

//通过node集合拿到jedisCluster对象，就可以使用命令了
JedisCluster jedisCluster=new JedisCluster(nodes);

jedisCluster.set("222","aaaa");
String a222 = jedisCluster.get("222");

//可选释放
jedisCluster.close();
```

**tips：**

- [JedisAPI测试](https://www.cnblogs.com/c-xiaohai/p/8376364.html)
- [Set和List](https://www.cnblogs.com/jmsjh/p/7740123.html)

## Spring整合

开发测试时常用单节点模式，需要时切换到集群模式。

**单节点**

```xml
	<!-- jedis客户端单机版 -->
	<bean id="redisClient" class="redis.clients.jedis.JedisPool">
		<constructor-arg name="host" value="192.168.25.153"></constructor-arg>
		<constructor-arg name="port" value="6379"></constructor-arg>
        <!--连接池配置，不配的话会有个默认配置，可以用 -->
		<constructor-arg name="poolConfig" ref="jedisPoolConfig"></constructor-arg>
	</bean>
<!-- 连接池配置 -->
	<bean id="jedisPoolConfig" class="redis.clients.jedis.JedisPoolConfig">
		<!-- 最大连接数 -->
		<property name="maxTotal" value="30" />
		<!-- 最大空闲连接数 -->
		<property name="maxIdle" value="10" />
		<!-- 每次释放连接的最大数目 -->
		<property name="numTestsPerEvictionRun" value="1024" />
		<!-- 释放连接的扫描间隔（毫秒） -->
		<property name="timeBetweenEvictionRunsMillis" value="30000" />
		<!-- 连接最小空闲时间 -->
		<property name="minEvictableIdleTimeMillis" value="1800000" />
		<!-- 连接空闲多久后释放, 当空闲时间>该值 且 空闲连接>最大空闲连接数 时直接释放 -->
		<property name="softMinEvictableIdleTimeMillis" value="10000" />
		<!-- 获取连接时的最大等待毫秒数,小于零:阻塞不确定的时间,默认-1 -->
		<property name="maxWaitMillis" value="1500" />
		<!-- 在获取连接的时候检查有效性, 默认false -->
		<property name="testOnBorrow" value="true" />
		<!-- 在空闲时检查有效性, 默认false -->
		<property name="testWhileIdle" value="true" />
		<!-- 连接耗尽时是否阻塞, false报异常,ture阻塞直到超时, 默认true -->
		<property name="blockWhenExhausted" value="false" />
	</bean>
```

**集群**

```xml
<bean id="redisClient" class="redis.clients.jedis.JedisCluster">
		<constructor-arg name="nodes">
			<set>
				<bean class="redis.clients.jedis.HostAndPort">
					<constructor-arg name="host" value="192.168.25.153"></constructor-arg>
					<constructor-arg name="port" value="7001"></constructor-arg>
				</bean>
				<bean class="redis.clients.jedis.HostAndPort">
					<constructor-arg name="host" value="192.168.25.153"></constructor-arg>
					<constructor-arg name="port" value="7002"></constructor-arg>
				</bean>
				<bean class="redis.clients.jedis.HostAndPort">
					<constructor-arg name="host" value="192.168.25.153"></constructor-arg>
					<constructor-arg name="port" value="7003"></constructor-arg>
				</bean>
				<bean class="redis.clients.jedis.HostAndPort">
					<constructor-arg name="host" value="192.168.25.153"></constructor-arg>
					<constructor-arg name="port" value="7004"></constructor-arg>
				</bean>
				<bean class="redis.clients.jedis.HostAndPort">
					<constructor-arg name="host" value="192.168.25.153"></constructor-arg>
					<constructor-arg name="port" value="7005"></constructor-arg>
				</bean>
				<bean class="redis.clients.jedis.HostAndPort">
					<constructor-arg name="host" value="192.168.25.153"></constructor-arg>
					<constructor-arg name="port" value="7006"></constructor-arg>
				</bean>
			</set>
		</constructor-arg>
		<constructor-arg name="poolConfig" ref="jedisPoolConfig"></constructor-arg>
	</bean>

```

为了满足两者直接的切换，需要一个Dao层，提供同一个接口，不同的实现类。

**通用接口**

```java
public interface IJedisDao {

    String set(String key,String value);

    String get(String key);

    long hset(String hkey,String key,String value);

    String hget(String hkey,String key);

    long incr(String key);

    long expire(String key,int second);

    long ttl(String key);

    long del (String key);

    long hdel(String hkey,String key);

    //...
}
```

### 单节点模式实现类

```java
package com.SH.Rest.Dao.DaoImpl;

import ...

public class JedisDaoSingleImpl implements IJedisDao {

    @Autowired
    private JedisPool jedisPool;

    @Override
    public String set(String key, String value) {
        Jedis jedis = jedisPool.getResource();
        String s = jedis.set(key, value);
        jedis.close();
        return s;
    }

    @Override
    public String get(String key) {
        Jedis jedis = jedisPool.getResource();
        String s = jedis.get(key);
        jedis.close();
        return s;
    }

    @Override
    public long hset(String hkey, String key, String value) {
        Jedis jedis = jedisPool.getResource();
        Long hset = jedis.hset(hkey, key, value);
        jedis.close();
        return hset;
    }

    @Override
    public String hget(String hkey, String key) {
        Jedis jedis = jedisPool.getResource();
        String s = jedis.hget(hkey, key);
        jedis.close();
        return s;
    }

    @Override
    public long incr(String key) {
        Jedis jedis = jedisPool.getResource();
        Long result = jedis.incr(key);
        jedis.close();
        return result;
    }

    @Override
    public long expire(String key, int second) {
        Jedis jedis = jedisPool.getResource();
        Long result = jedis.expire(key, second);
        jedis.close();
        return result;
    }

    @Override
    public long ttl(String key) {
        Jedis jedis = jedisPool.getResource();
        Long result = jedis.ttl(key);
        jedis.close();
        return result;
    }

    @Override
    public long del(String key) {
        Jedis jedis = jedisPool.getResource();
        Long result = jedis.del(key);
        jedis.close();
        return result;
    }

    @Override
    public long hdel(String hkey, String key) {
        Jedis jedis = jedisPool.getResource();
        Long result = jedis.hdel(hkey, key);
        jedis.close();
        return result;
    }

    //...
}

```

使用单点模式时的spring配置：

```xml
<!--    Redis客户端，单点模式，连接没配置，为默认-->
    <bean id="jedisPool" class="redis.clients.jedis.JedisPool">
        <constructor-arg name="host" value="192.168.1.105"/>
        <constructor-arg name="port" value="6379"/>
    </bean>
<!--单点模式实现类-->
    <bean id="jedisDao" class="com.SH.Rest.Dao.DaoImpl.JedisDaoSingleImpl">

    </bean>
```

### 集群模式实现类

```java
package com.SH.Rest.Dao.DaoImpl;

import ...
public class JedisDaoClusterImpl implements IJedisDao {

    //无需释放
    @Autowired
    private JedisCluster jedisCluster;

    @Override
    public String get(String key) {
        return jedisCluster.get(key);
    }

    @Override
    public String set(String key, String value) {
        return jedisCluster.set(key, value);
    }

    @Override
    public String hget(String hkey, String key) {
        return jedisCluster.hget(hkey, key);
    }

    @Override
    public long hset(String hkey, String key, String value) {
        return jedisCluster.hset(hkey, key, value);
    }

    @Override
    public long incr(String key) {
        return jedisCluster.incr(key);
    }

    @Override
    public long expire(String key, int second) {
        return jedisCluster.expire(key, second);
    }

    @Override
    public long ttl(String key) {
        return jedisCluster.ttl(key);
    }

    @Override
    public long del(String key) {

        return jedisCluster.del(key);
    }

    @Override
    public long hdel(String hkey, String key) {

        return jedisCluster.hdel(hkey, key);
    }

    //...
}

```

使用集群模式时的spring配置：

```xml
<!--  Redis客户端，集群模式，连接池默认配置  -->
<bean id="jedisCluster" class="redis.clients.jedis.JedisCluster">
    <constructor-arg name="nodes">
        <set>
            <bean class="redis.clients.jedis.HostAndPort">
                <constructor-arg name="host" value="192.168.1.105"/>
                <constructor-arg name="port" value="7001"/>
            </bean>
            <bean class="redis.clients.jedis.HostAndPort">
                <constructor-arg name="host" value="192.168.1.105"/>
                <constructor-arg name="port" value="7002"/>
            </bean>
            <bean class="redis.clients.jedis.HostAndPort">
                <constructor-arg name="host" value="192.168.1.105"/>
                <constructor-arg name="port" value="7003"/>
            </bean>
            <bean class="redis.clients.jedis.HostAndPort">
                <constructor-arg name="host" value="192.168.1.105"/>
                <constructor-arg name="port" value="7004"/>
            </bean>
            <bean class="redis.clients.jedis.HostAndPort">
                <constructor-arg name="host" value="192.168.1.105"/>
                <constructor-arg name="port" value="7005"/>
            </bean>
            <bean class="redis.clients.jedis.HostAndPort">
                <constructor-arg name="host" value="192.168.1.105"/>
                <constructor-arg name="port" value="7006"/>
            </bean>
        </set>
    </constructor-arg>
</bean>
<!--集群模式实现类-->
<bean id="jedisDao" class="com.SH.Rest.Dao.DaoImpl.JedisDaoClusterImpl">

</bean>
<!--单点模式实现类，现在是集群模式，所以注释掉这个bean-->
   <!-- <bean id="jedisDao" class="com.SH.Rest.Dao.DaoImpl.JedisDaoSingleImpl">

    </bean>-->
```

## 使用示例

缓存的添加不能影响正常的业务逻辑，不管缓存的情况如何，都要保证其他业务逻辑的正常运行，不可中断。

```java
@AutoWired
private IJedisDao jedisDao;

@Override
	public List<Content> getContentList(long id) {
		//从缓存中取内容
		try {
			String result = jedisDao.hget(HashKEY, id + "");
			if (!StringUtils.isBlank(result)) {//判断缓存取出结果是否为空字符串
				//把字符串转换成list
				List<Content> resultList = JsonUtils.jsonToList(result, Content.class);
				return resultList;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		//正常业务逻辑，根据内容分类id，数据库查询内容列表
		List<Content> list = contentMapper.selectByid(id);

		//向缓存中添加内容
		try {
			//把list转换成字符串
			String cacheString = JsonUtils.objectToJson(list);
			jedisDao.hset(HashKEY, id + "", cacheString);
		} catch (Exception e) {
			e.printStackTrace();
		}


```

**缓存同步**

{% note success %}当更新数据库内数据时，需要先把对应的Redis缓存删除（del删除对应key），然后再更新数据库。

缓存是由服务层管理的，服务层需要提供一个删除缓存的服务，后台管理系统修改数据时，Http调用该服务即可。{% endnote %}
