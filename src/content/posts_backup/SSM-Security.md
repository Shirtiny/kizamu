---
title: SSM_SysManager_Security
date: 2019-07-15 14:22:24
tags:
  - 用户关系管理项目
  - Spring-security
  - 权限安全
  - SSM
  - Maven聚合工程
  - java
categories: 学习经验
---

# <Center>SSM\_后台数据管理+安全认证</Center>

## 数据列表

### 1. 商品表Product

|      变量名      |  类型   |              备注              |
| :--------------: | :-----: | :----------------------------: |
|        id        | String  |              主键              |
|    productNum    | String  |            商品编号            |
|   productName    | String  |             商品名             |
|     cityName     | String  |            出发城市            |
|  departureTime   |  Date   |            出发时间            |
| departureTimeStr | String  | 出发时间的字符串，不在数据库中 |
|   productPrice   | double  |            商品价格            |
|   productDesc    | String  |            商品描述            |
|  productStatus   | Integer |  值0为关闭状态，值1为打开状态  |
| productStatusStr | String  | 商品状态的字符串，不在数据库中 |

#### 1.1. Date与String之间的类型转换

**赋值**

<!-- more -->

Controller接收参数时，需要把用户输入的String类型的departureTime转为date类型，这里我设置了全局的类型转换器，由springMVC处理转换：

```java
public class StringToDate implements Converter<String, Date> {
    @Override
    public Date convert(String string) {
        SimpleDateFormat sdf=new SimpleDateFormat("yyyy-MM-dd HH:mm");
        Date date = null;
        try {
            date = sdf.parse(string);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return date;
    }
}
```

springMVC配置：

```xml
 <!-- 配置类型转换器de固定步骤-->
    <!--   01、 先将写好的转换器类放入IOC容器-->
    <bean id="SToDateConvertor" class="com.SH.Converters.StringToDate"></bean>
    <bean id="DToStringConvertor" class="com.SH.Converters.DateToString"></bean>
    <!--  02、 再将自定义的转换器设置到springMVC中的转换器里 -->
    <!--    <bean id="springConvertors" class="org.springframework.context.support.ConversionServiceFactoryBean">这是转换器的类-->
    <!--    由于数据格式化的类是.format.support.FormattingConversionServiceFactoryBean包括了转换器的类，所以可以用格式化的类同时实现两个功能-->
    <bean id="springConvertors" class="org.springframework.format.support.FormattingConversionServiceFactoryBean">
        <property name="converters" >
            <set>
                <ref bean="SToDateConvertor"/>
                <ref bean="xxx"/>
                ...
            </set>
        </property>
    </bean>
    <!-- 03、 在<mvc:annotation-driven>里的conversion-service注册 02的bean  -->
    <!-- 开启SpringMVC注解支持 -->
    <mvc:annotation-driven  conversion-service="springConvertors"/>
```

**取值**

输出时，可以使用事先定义的departureTimeStr，这样可以保持departureTime不变，需要对departureTimeStr赋值，在get方法中写：

```java
 public String getDepartureTimeStr() {
           if (departureTime!=null){
               String pattern="yyyy-MM-dd HH:mm";
               departureTimeStr = DateAndString.DateToString(departureTime, pattern);
           }
            return departureTimeStr;
    }
```

DateAndString是自定义的工具类，将date转为string，详情：

```java
public class DateAndString {

    public static String DateToString(Date date,String pattern){
        SimpleDateFormat sdf=new SimpleDateFormat(pattern);
        return sdf.format(date);
    }
}
```

**注解方式**

详情：[@DateTimeFormat与@JsonFormat](https://blog.csdn.net/zhou520yue520/article/details/81348926)

### 2. 订单表Orders

|     变量名      |      类型       |               备注                |
| :-------------: | :-------------: | :-------------------------------: |
|       id        |     String      |          无意义，主键id           |
|    orderNum     |     String      |      订单编号 不为空 且唯一       |
|    orderTime    |      Date       |             下单时间              |
|  orderTimeStr   |     String      |  用于输出下单时间，不在数据库中   |
|   peopleCount   |       int       |             出行人数              |
|    orderDesc    |     String      |        订单备注和描述信息         |
|     payType     |       int       | 支付方式（0支付宝，1微信，2其他） |
|   payTypeStr    |     String      |  用于输出支付方式，不在数据库中   |
|   orderStatus   |       int       |   订单的状态（0未支付 1已支付）   |
| orderStatusStr; |     String      |  用于输出下单状态，不在数据库中   |
|    productId    |       int       |          产品的id，外键           |
|    memberid     |       int       |       会员（联系人）id外键        |
|   travellers    | List<Traveller> |               旅客                |
|     member      |     Member      |               会员                |

#### 2.1. 订单查询

一个订单对应一个产品、一个会员（联系人）、多个旅客，使用注解方式查询数据时，使用@Results指定关系，一对一多对一使用@One指定方法，一对多多对多使用@Many指定方法

```java
//查询一个订单的具体信息
@Select("select * from orders where id=#{orderId}")
    @Results({
            @Result(column = "id",property = "id",id = true),
            @Result(column = "orderNum",property = "orderNum"),
            @Result(property = "orderTime",column = "orderTime",javaType = Date.class,jdbcType =JdbcType.TIMESTAMP),
            @Result(property = "orderStatus",column = "orderStatus"),
            @Result(property = "peopleCount",column = "peopleCount"),
            @Result(property = "product",column = "productId",javaType = Product.class,one = @One(select = "com.SH.Dao.IproductDao.selectByid")),
            @Result(property = "travellers",column = "id",javaType = List.class,many = @Many(select = "com.SH.Dao.ItravellerDao.selectByid")),
            @Result(property = "member",column = "memberId",javaType = Member.class,one = @One(select = "com.SH.Dao.ImemberDao.selectById")),
            @Result(property = "payType",column = "payType"),
            @Result(property = "orderDesc",column = "orderDesc")
    })
    Orders selectById(String orderId) throws  Exception;
```

### 3. 会员表Member

|  变量名  |  类型  |      备注      |
| :------: | :----: | :------------: |
|    id    | String | 无意义、主键id |
|   name   | String |      姓名      |
| nickName | String |      昵称      |
| phoneNum | String |    电话号码    |
|  email   | String |      邮箱      |

#### 3.1. 单个会员查询：

```java
 @Select("select * from member where id=#{id}")
    Member selectById(String id);
```

### 4. 旅客表Traveller

|       变量名       |  类型  |              备注              |
| :----------------: | :----: | :----------------------------: |
|         id         | String |         无意义、主键id         |
|        name        | String |              姓名              |
|        sex         | String |              性别              |
|      phoneNum      | String |            电话号码            |
|  credentialsType   |  int   | 证件类型 0身份证 1护照 2军官证 |
| credentialsTypeStr | String | 用于输出证件类型，不在数据库中 |
|   credentialsNum   | String |            证件号码            |
|   travellerType    |  int   |  旅客类型(人群) 0 成人 1 儿童  |
|  travellerTypeStr  | String | 用于输出旅客类型，不在数据库中 |

### 5. 旅客与订单之间的多对多关系，order_traveller中间表

|   字段名    |  字段类型   |         字段描述         |
| :---------: | :---------: | :----------------------: |
|   orderId   | varchar(32) | 订单id，与对应表绑定外键 |
| travellerId | varchar(32) | 旅客id，与对应表绑定外键 |

#### 5.1. 根据指定订单号，多个旅客的查询：

```java
 @Select("select * from traveller where id in(
         select travellerId from order_traveller where orderId=#{orderId}
        )")
    List<Traveller> selectByid(String orderId);
```

### 6. 用户表Users

|  变量名  |    类型    |        备注         |
| :------: | :--------: | :-----------------: |
|    id    |   String   |   无意义，主键id    |
|  email   |   String   |     非空，唯一      |
| username |   String   |       用户名        |
| password |   String   |     密码（加密)     |
| phoneNum |   String   |        电话         |
|  status  |    int     | 状态0 未开启 1 开启 |
|  roles   | List<Role> |       角色集        |

#### 6.1. 用户的查询：

```java
 //查询所有用户
    @Select("select * from users")
    @Results({
            @Result(id = true,property = "id",column = "id"),
            @Result(property = "email",column = "email"),
            @Result(property = "username",column = "username"),
            @Result(property = "password",column = "password"),
            @Result(property = "phoneNum",column = "phoneNum"),
            @Result(property = "status",column = "status"),
            @Result(property = "roles",column = "id",javaType = List.class,many = @Many(select = "com.SH.Dao.IroleDao.selectByUserid"))
    })
    List<UserInfo> selectAllUser() throws Exception;
```

### 7. 角色表Role

|   变量名    |       类型       |      备注      |
| :---------: | :--------------: | :------------: |
|     id      |      String      | 无意义，主键id |
|  roleName   |      String      |     角色名     |
|  roleDesc   |      String      |    角色描述    |
|  UserInfos  |  List<UserInfo>  |     用户集     |
| permissions | List<permission> |     权限集     |

### 8. 用户与角色的多对多关系，user_role中间表

| 变量名 |  类型  |           备注           |
| :----: | :----: | :----------------------: |
| userId | String | 用户id,与用户id外键关联  |
| roleId | String | 角色id，与角色id外键关联 |

#### 8.1. 根据用户查询角色集合：

```java
//根据用户id查询角色集
    @Select("select * from role where id in(select roleId from user_role where userId=#{userid})")
    List<Role> selectByUserid(String userid);
```

### 9. 权限表Permission

|     变量名     |    类型    |      备注      |
| :------------: | :--------: | :------------: |
|       id       |   String   | 无意义，主键id |
| permissionName |   String   |     权限名     |
|      url       |   String   |    资源路径    |
|     roles      | List<Role> |     角色集     |

### 10. 角色与权限多对多关系，role_permission中间表

|    变量名    |  类型  |           备注           |
| :----------: | :----: | :----------------------: |
| permissionId | String | 权限id，与权限id关联外键 |
|    roleId    | String | 角色id，与角色id关联外键 |

## Spring Security安全框架

Spring Security是一种基于 Spring AOP 和 Servlet 过滤器的安全框架,它提供全面的安全性解决方案，同时在 Web 请求级和方法调用级处理认证和授权。

### 1.Pom依赖

```xml
<properties>
		<spring.security.version>5.0.1.RELEASE</spring.security.version>
</properties>
<dependencies>
		<dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-web</artifactId>
            <version>${spring.security.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-config</artifactId>
            <version>${spring.security.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-core</artifactId>
            <version>${spring.security.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-taglibs</artifactId>
            <version>${spring.security.version}</version>
        </dependency>
</dependencies>
```

### 2. spring-Security.xml配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:security="http://www.springframework.org/schema/security"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans.xsd
    http://www.springframework.org/schema/security
    http://www.springframework.org/schema/security/spring-security.xsd">


<!--    不拦截的资源-->
    <security:http pattern="/css/**" security="none"/>
    <security:http pattern="/img/**" security="none"/>
    <security:http pattern="/plugins/**" security="none"/>
    <security:http pattern="/page/login.jsp" security="none"/>
    <security:http pattern="/page/fail.jsp" security="none"/>


    <!--
    	配置具体的规则
    	auto-config="true"	不用自己编写登录的页面，框架提供默认登录页面
    	use-expressions="false"	是否使用SPEL表达式
    -->
    <security:http auto-config="true" use-expressions="false">

       <!--  配置具体的拦截的规则, 限制用户添加页面的访问角色 ，小范围在前，大范围在后     -->
        <security:intercept-url pattern="/page/user-add.jsp" access="ROLE_GM"/>

        <!--  pattern="请求路径的规则" access="访问系统的人，必须有USER或GM的角色，ROLE_ 是框架需要的前缀" -->
        <security:intercept-url pattern="/**" access="ROLE_USER,ROLE_GM"/>

        <!-- 设置跳转的页面       -->
        <security:form-login
                login-page="/page/login.jsp" login-processing-url="/login.action"
                default-target-url="/page/main.jsp"
                authentication-failure-url="/page/fail.jsp" authentication-success-forward-url="/page/main.jsp"
                username-parameter="username" password-parameter="password"
                />

        <!-- 关闭跨域请求，csrf主要是为了防止攻击 -->
        <security:csrf disabled="true"/>

        <!-- 用户注销，退出 -->
        <security:logout invalidate-session="true" logout-url="/logout.action" logout-success-url="/page/login.jsp" />

    </security:http>



    <!-- 切换成数据库中的用户名和密码 -->
    <security:authentication-manager>

        <!--配置userService类，它实现了继承了UserDetailsService的IuserService接口，重写了loadUserByUsername(String username)方法，返回一个UserDetails类对象，使用security提供的User对象封装数据库查询到的userinfo信息 -->
    <security:authentication-provider user-service-ref="userService">

       <!-- 配置加密的方式，引用上面配置的加密类，指定密码被加密的方式，框架才能识别，以便找到合适的密码验证方式，不然会报There is no PasswordEncoder mapped for the id "null", 注意！若在xml中配置了加密类，{id}(密码前加{noop}、{bcrypt}等)将不可用，框架会直接使用指定加密类匹配字符串，不会再判断字符串加密类型    -->
<!--        <security:password-encoder ref="passwordEncoder"/>-->


    </security:authentication-provider>
</security:authentication-manager>

    <!-- 配置加密类，存储密码明文的加盐哈希 hash(m+salt)，不可逆加密，验证时匹配哈希值,注意，此项放在 <security:authentication-manager>前会在密码验证时影响{id}是否使用-->
    <bean id="passwordEncoder" class="org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder"/>


    <!-- 提供了入门的方式，在内存中存入用户名和密码 -->
<!--    <security:authentication-manager>-->
<!--    	<security:authentication-provider>-->
<!--    		<security:user-service>-->
<!--    			<security:user name="sh" password="{noop}123" authorities="ROLE_USER"/>-->
<!--    		</security:user-service>-->
<!--    	</security:authentication-provider>-->
<!--    </security:authentication-manager>-->



</beans>
```

### 3. Web.xml配置文件

```xml
<!--监听器 -->
<listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
  </listener>

<!--指定spring配置文件与security配置文件的位置 -->
  <context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:ApplicationContext.xml,classpath:spring-	Security.xml</param-value>
  </context-param>

<!-- 过滤器,filter-name值必须为springSecurityFilterChain-->
  <filter>
    <filter-name>springSecurityFilterChain</filter-name>
    <filter-class>
        org.springframework.web.filter.DelegatingFilterProxy
    </filter-class>
  </filter>

  <filter-mapping>
    <filter-name>springSecurityFilterChain</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
```

### 4. 密码加密流程

由于用户注册时，数据库中的用户密码需要加密保存，以保护用户信息安全。Spring Security提供的加密方式里，有一种为`BCryptPasswordEncoder`类，使用BCrypt强哈希方法来加密密码。这是种加盐哈希方式，每次加密产生的密文都不同，密码验证时通过匹配hash值来进行认证，可以抵御[彩虹表](https://www.jianshu.com/p/732d9d960411)，提高破解难度。

使用时，只需在接收用户信息后，**调用BCryptPasswordEncoder对象的encode方法**，对用户密码进行加密，然后将加密后的用户信息放入数据库即可,由于加密后数据比较长，注意数据库字符长度。如：

```java
@Service("userService")
@Transactional
public class userServiceImpl implements IuserService {

    @Autowired
    private IuserDao userDao;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {...}

//添加用户，加密测试
    @Override
    public void addUser(UserInfo userInfo) throws Exception {
        //获取用户密码
        String password=userInfo.getPassword();
        //加密密码
        String encode = passwordEncoder.encode(password);
        //修改用户密码
        userInfo.setPassword(encode);
        //打印，以查看加密结果
        System.out.println(encode);
        //插入数据库
        userDao.insertOne(userInfo);


    }
```

### 5. 登录认证流程

#### 5.1. 创建UserInfo类，用来封装数据库返回的用户信息

```java
public class UserInfo {

    private String id;
    private String email;
    private String username;
    private String password;
    private String phoneNum;
    private int status;
    private String statusStr;
    private List<Role> roles;

   	....
    //省略setter、getter、构造器
}
```

#### 5.2. Dao层查询出用户信息

```java
//按照用户名查找单个用户，验证登录
    @Select("select * from users where username=#{username}")
    @Results({
            @Result(id = true,property = "id",column = "id"),
            @Result(property = "email",column = "email"),
            @Result(property = "username",column = "username"),
            @Result(property = "password",column = "password"),
            @Result(property = "phoneNum",column = "phoneNum"),
            @Result(property = "status",column = "status"),
            @Result(property = "roles",column = "id",javaType = List.class,many = @Many(select = "com.SH.Dao.IroleDao.selectByUserid"))
    })
    UserInfo selectUserByName(String username);
```

#### 5.3. 创建IuserService接口，继承UserDetailsService接口

```java
public interface IuserService extends UserDetailsService {

}
```

#### 5.4. 创建userServiceImpl类，实现IuserService接口

```java
//放入IOC容器，取名为userService，供xml中配置
@Service("userService")
//事务管理
@Transactional
public class userServiceImpl implements IuserService {

    @Autowired
    private IuserDao userDao;

	//重写loadUserByUsername方法
     @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        //查询出对应用户信息
        UserInfo userInfo = userDao.selectUserByName(username);
            //获取用户的角色集合
            List<Role> roles = userInfo.getRoles();
            //遍历权限并放入SimpleGrantedAuthority集合
            SimpleGrantedAuthority authority;
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            for (Role role : roles) {
                String roleName = role.getRoleName();
                authority = new SimpleGrantedAuthority("ROLE_" + roleName);
                authorities.add(authority);
            }
            //获取用户密码
            String uPwd = userInfo.getPassword();
            //使用Security提供的User类，至少需要用户名、密码、权限
            User user;
            if (uPwd.length() <= 50) {//判断密码长度，以区分是否是加密的密码，因为加密后的密码比较长
                //此时密码未进行加密，所以要加"{noop}"前缀，让框架识别
                user = new User(userInfo.getUsername(), "{noop}" + uPwd, authorities);
            } else {
                //此时密码已经加密(正常情况下密码用户的密码应该不会大于50吧)，加"{bcrypt}"前缀，因为加密方式为bcrypt，让框架识别
                user = new User(userInfo.getUsername(), "{bcrypt}" + uPwd, authorities);
                 //若在xml中配置了加密方式，{id}就会失效，只使用配置的加密方式匹配密码，加密类的bean也不能靠前
            }
            //直接返回User类对象，因为User类实现了UserDetails
            return user;

    }
```

**tips：**

##### 5.4.1. 关于"{noop}"前缀

在spring5.0之后，springsecurity存储密码的格式发生了改变，新的密码存储格式为：加密方式和加密后的密码，{id}encodedPassword

```java
//均为字符串
{noop}password//无加密，明文密码，前缀使用{noop}让框架识别，noop是no operate的意思

    //各种加密方式的前缀，和对应的密文样式
{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG //BCryptPasswordEncoder类加密

{pbkdf2}5d923b44a6d129f3ddf3e3c8d29412723dcbde72445e8ef6bf3b508fbf17fa4ed4d6b99ca763d8dc

{scrypt}$e0801$8bWJaSu2IKSn9Z9kM+TPXfOc/9bdYSrN1oD9qfVThWEwdRTnO7re7Ei+fUZRJ68k9lTyuTeUp4of4g24hHnazw==$OAOec05+bXxvuu/1qZ6NUR+xQYvYv7BeL1QxwRpY5Pc=

{sha256}97cde38028ad898ebc02e690819fa220e88c62e0699403e94fff291cfffaf8410849f27605abcbc0
```

##### 5.4.2. 关于框架提供的User类

Security的User类，提供了两个构造方法：

```java
//Security提供的User类
public class User implements UserDetails, CredentialsContainer {
    private static final long serialVersionUID = 500L;
    private String password;
    private final String username;
    private final Set<GrantedAuthority> authorities;
    private final boolean accountNonExpired;
    private final boolean accountNonLocked;
    private final boolean credentialsNonExpired;
    private final boolean enabled;

    public User(String username, String password, Collection<? extends GrantedAuthority> authorities) {
        this(username, password, true, true, true, true, authorities);
    }

    public User(String username, String password, boolean enabled, boolean accountNonExpired, boolean credentialsNonExpired, boolean accountNonLocked, Collection<? extends GrantedAuthority> authorities) {
        if (username != null && !"".equals(username) && password != null) {
            this.username = username;
            this.password = password;
            this.enabled = enabled;
            this.accountNonExpired = accountNonExpired;
            this.credentialsNonExpired = credentialsNonExpired;
            this.accountNonLocked = accountNonLocked;
            this.authorities = Collections.unmodifiableSet(sortAuthorities(authorities));
        } else {
            throw new IllegalArgumentException("Cannot pass null or empty values to constructor");
        }
    }
```

三参构造（用户名，密码，权限集合 ），如：

```java
user = new User(userInfo.getUsername(), "{bcrypt}" + uPwd, authorities);
```

七參构造（用户名，密码，是否启用，账号是否过期，认证信息是否过期，是否被锁定，权限集合），如：

```java
User user = new User(userInfo.getUsername(), "{bcrypt}" + userInfo.getPassword(),
userInfo.getStatus() == 0 ? false : true, true, true, true, authoritys);
```

#### 5.5. 在Security的xml文件配置userService即可

```xml
 <security:authentication-manager>

     <!--配置userService类，它实现了继承了UserDetailsService的IuserService接口，重写了loadUserByUsername(String username)方法，返回一个UserDetails类对象，使用security提供的User对象封装数据库查询到的userinfo信息 -->
    <security:authentication-provider user-service-ref="userService">

    </security:authentication-provider>
</security:authentication-manager>
```

### 6. 注解方式的权限控制

注解都默认关闭,使用前均需开启，在Spring-Security.xml中配置:

```xml
<!--    启用注解,用于进行权限控制-->
<!--    开启JSR250注解、secured注解,支持spel表达式的注解-->
<security:global-method-security jsr250-annotations="enabled" secured-annotations="enabled" pre-post-annotations="enabled"/>
```

#### 6.1. JSR250注解

依赖、jar包:

```xml
<dependency>
            <groupId>javax.annotation</groupId>
            <artifactId>jsr250-api</artifactId>
            <version>1.0</version>
</dependency>
```

**@RolesAllowed**注解，指定类、或方法需要的角色，无需加ROLE\_前缀，使用：

```java
@Controller
@RequestMapping(value = "/userController")

//指定类内方法都默认需要GM的身份
@RolesAllowed("GM")
public class userController {

    @Autowired
    private IuserService userService;


    //添加用户
@RequestMapping(value = "/addUser")
    public String addUser(UserInfo userInfo) throws Exception {
        userService.addUser(userInfo);
        return "redirect:/userController/findAll.action";
    }


    //查询所有用户
    @RequestMapping(value = "/findAll")

    //指定此方法GM和USER都可以访问
    @RolesAllowed({"GM","USER"})
    public ModelAndView findAllUser() throws Exception {
        List<UserInfo> users = userService.selectAllUser();
        ModelAndView mv=new ModelAndView();
        mv.addObject("userList",users);
        mv.setViewName("user-list");
        return mv;
    }
}
```

**@PermitAll**注解，表示允许所有的角色进行访问，也就是说不进行权限控制

**@DenyAll**注解，是和PermitAll相反的，表示无论什么角色都不能访问

#### 6.2. @Secured注解

此注解为Spring Security自带注解,用法与@RolesAllowed大致相同，不过角色要加ROLE\_前缀,如:

```java
@Controller
@RequestMapping(value = "/userController")

//指定类内方法都默认需要GM的身份
@Secured("ROLE_GM")
public class userController {

    @Autowired
    private IuserService userService;

    //添加用户
@RequestMapping(value = "/addUser")
    public String addUser(UserInfo userInfo) throws Exception {
        userService.addUser(userInfo);
        return "redirect:/userController/findAll.action";
    }

    //查询所有用户
    @RequestMapping(value = "/findAll")

    //指定此方法GM和USER都可以访问
    @Secured({"ROLE_USER","ROLE_GM"})
    public ModelAndView findAllUser() throws Exception {
        List<UserInfo> users = userService.selectAllUser();
        ModelAndView mv=new ModelAndView();
        mv.addObject("userList",users);
        mv.setViewName("user-list");
        return mv;
    }
}
```

#### 6.3. 支持SPEL表达式的注解

常用的权限表达式：

|                   表达式                   |                         说明                          |
| :----------------------------------------: | :---------------------------------------------------: |
|                 permitAll                  |                     永远返回true                      |
|                  denyAll                   |                     永远返回false                     |
|                 anonymous                  |             当前用户是anonymous时返回true             |
|                 rememberMe                 |          当前用户是rememberMe用户时返回true           |
|               authenticated                |            当前用户不是anonymous时返回true            |
|             fullAuthenticated              | 当前用户既不是anonymous也不是rememberMe用户时返回true |
|              hasRole（role）               |           用户拥有指定的角色权限时返回true            |
|        hasAnyRole（[role1，role2]）        |       用户拥有任意一个指定的角色权限时返回true        |
|         hasAuthority（authority）          |             用户拥有指定的权限时返回true              |
| hasAnyAuthority（[authority1,authority2]） |         用户拥有任意一个指定的权限时返回true          |
|       hasIpAddress（'192.168.1.0'）        |              请求发送的Ip匹配时返回true               |

**@PreAuthorize**注解， 在方法调用之前,基于表达式的计算结果来限制对方法的访问
如：

```java
@Controller
@RequestMapping(value = "/userController")

/*指定类内方法都默认需要GM的身份
* @PreAuthorize("hasRole('ROLE_GM')")
 * 或
 * @PreAuthorize("hasAuthority('ROLE_GM')")
 */
public class userController {


    @Autowired
    private IuserService userService;


    //添加用户
@RequestMapping(value = "/addUser")

    public String addUser(UserInfo userInfo) throws Exception {
        userService.addUser(userInfo);

        return "redirect:/userController/findAll.action";
    }


    //查询所有用户
    @RequestMapping(value = "/findAll")
/*
 * 指定此方法GM和USER都可以访问
* @PreAuthorize("hasAnyRole('ROLE_GM','ROLE_USER')")
* 或
 * @PreAuthorize("hasAnyAuthority('ROLE_GM','ROLE_USER')")
**/
    public ModelAndView findAllUser() throws Exception {
        List<UserInfo> users = userService.selectAllUser();
        ModelAndView mv=new ModelAndView();
        mv.addObject("userList",users);
        mv.setViewName("user-list");
        return mv;
    }

    //修改密码（测试）
    @RequestMapping(value = "/changeP")

    //取方法形参中的username，如果传入参数的值与登录用户的值相同，或者拥有GM权限，便可访问
    @PreAuthorize("#username == authentication.principal.username or hasAuthority('ROLE_GM')")
    public String changeP(@P("username") String username) throws  Exception{
        return "ok";
    }
}
```

**@PostAuthorize** 注解，允许方法调用,但是如果表达式计算结果为false,将抛出一个安全性异常
示例：

```java
@PostAuthorize
User getUser("returnObject.userId == authentication.principal.userId or
hasPermission(returnObject, 'ADMIN')");
```

**@PostFilter** 注解，允许方法调用,但必须按照表达式来过滤方法的结果
**@PreFilter** 注解，允许方法调用,但必须在进入方法之前过滤输入值

### 7. 权限控制标签

依赖、jar（已有）：

```xml
<properties>
		<spring.security.version>5.0.1.RELEASE</spring.security.version>
</properties>

<dependencies>
	<dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-taglibs</artifactId>
            <version>${spring.security.version}</version>
	</dependency>
</dependencies>
```

jsp页面引入`taglib`:

```jsp
<%@taglib prefix="security" uri="http://www.springframework.org/security/tags" %>
```

常用标签:

1. **authentication**

允许访问当前的`Authentication`对象，获得属性的值，用来取值和获取对象。

```jsp
<security:authentication property="" htmlEscape="" scope="" var=""/>
```

- `property`： 只允许指定Authentication所拥有的属性，可以进行属性的级联获取 如“principle.username”，
  不允许直接通过方法进行调用
- `htmlEscape`：表示是否需要将html进行转义。默认为true。
- `scope`：与var属性一起使用，用于指定存放获取的结果的属性名的作用范围，默认我pageContext。Jsp中拥
  有的作用范围都进行进行指定
- `var`： 用于指定一个属性名，这样当获取到了authentication的相关信息后会将其以var指定的属性名进行存
  放，默认是存放在pageConext中
- 实例：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>

<%@ taglib prefix="security" uri="http://www.springframework.org/security/tags" %>
<html>
<head>
    <title>用户属性</title>
</head>
<body>
	<%--将用户对象在session中命名为user--%>
<security:authentication property="principal" var="user" scope="session"/>
    <p>${user}</p>
    <p>${user.username}</p>

    <%--或直接输出值--%>
<security:authentication property="principal.username"/>
</body>
</html>
```

当然，你可以在你的**MVC控制器中访问**`Authentication`对象 （通过调用`SecurityContextHolder.getContext().getAuthentication()`） 然后直接在模型中添加数据，来渲染视图:

```java
// Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

//User principal = (User)authentication.getPrincipal();
//principal.getUsername();
```

2. **authorize**

authorize是用来判断普通权限的，通过判断用户是否具有对应的权限而控制其所包含内容的显示。

```jsp
<security:authorize access="" method="" url="" var=""></security:authorize>
```

- `access`： 需要使用表达式来判断权限，当表达式的返回结果为true时表示拥有对应的权限
- `method`：是配合url属性一起使用的，表示用户应当具有指定url指定method访问的权限，method的默认值为GET，可选值为http请求的7种方法
- `url`：表示如果用户拥有访问指定url的权限即表示可以显示authorize标签包含的内容
- `var`：用于指定将权限鉴定的结果存放在pageContext的哪个属性中

3. **accesscontrollist**

accesscontrollist标签是用于鉴定ACL权限的。其一共定义了三个属性：hasPermission、domainObject和var，
其中前两个是必须指定的。

```jsp
<security:accesscontrollist hasPermission="" domainObject="" var=""></security:accesscontrollist>
```

- `hasPermission`：用于指定以逗号分隔的权限列表
- `domainObject`：用于指定对应的域对象
- `var`：则是用以将鉴定的结果以指定的属性名存入pageContext中，以供同一页面的其它地方使用

## 操作日志

记录每个用户的操作详情，方便管理和监控。这里使用Spring AOP的前置通知、后置通知，来控制日志的生成。

### 1. 日志表sysLog

#### 1.1. 数据库表

|   字段名称    | 字段类型  |         字段描述         |
| :-----------: | :-------: | :----------------------: |
|      id       |  VARCHAR  | 无意义，完成时间的字符串 |
|   visitTime   | timestamp |         访问时间         |
|   username    |  VARCHAR  |       操作者用户名       |
|      ip       |  VARCHAR  |          访问ip          |
|      url      |  VARCHAR  |       访问资源url        |
| executionTime |    int    |         执行时长         |
|    method     |  VARCHAR  |         访问方法         |

##### 1.1.1. 插入日志

```java
@Insert("insert into syslog(id,visitTime,username,ip,url,executionTime,method) values(#{id},#{visitTime},#{username},#{ip},#{url},#{executionTime},#{method})")
    boolean insertOne(SysLog sysLog);
```

##### 1.1.2. 查询日志

```java
@Select("select * from syslog")
    @Results({

            @Result(id = true,property = "id",column = "id"),
            @Result(property = "visitTime",column = "visitTime",javaType = Date.class,jdbcType = JdbcType.TIMESTAMP),
            @Result(property = "username",column = "username"),
            @Result(property = "ip",column = "ip"),
            @Result(property = "url",column = "url"),
            @Result(property = "executionTime",column = "executionTime",javaType = long.class,jdbcType = JdbcType.INTEGER),
            @Result(property = "method",column = "method")

    })
    List<SysLog> selectAll() throws Exception;
```

#### 1.2. 实体类

```java
public class SysLog {
private String id;
private Date visitTime;
private String visitTimeStr;
private String username;
private String ip;
private String url;
private Long executionTime;
private String method;

    //setter&getter
｝
```

#### 1.3. AOP生成数据

开启spring-MVC对AOP的注解支持

```xml
<!--
    支持AOP的注解支持，AOP底层使用代理技术
    JDK动态代理，要求必须有接口
    cglib代理，生成子类对象，proxy-target-class="true" 默认使用cglib的方式
-->
<aop:aspectj-autoproxy proxy-target-class="true"/>
```

创建sysLogAOP类，使用aop的前置通知、后置通知，生成需要的数据，详细如下：

```java
package com.SH.AOP;

import ...

@Component
@Aspect
public class sysLogAOP {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private IsysLogService sysLogService;

    private Class aClass;
    private Method method;
    private Date visitTime;
    private String visitTimeStr="";
    private String ip="";
    private String url="";
    private String username="";


    /*
    * 前置通知
    * 生成访问方法时的时间
    *获取操作者的信息
    *获取ip
    *获取访问方法的类、类名、方法、方法名
    *利用方法、类获取requestMapping的valueof[0]，拼接成url
    * 单个方法作为切入点
    * @Before("execution(public String com.SH.Controller.productController.findAll(java.util.Map<java.lang.String,java.lang.Object>))")
    * */
//    全部类型的 com.SH.Controller包下 全部类的全部方法
  @Before("execution(* com.SH.Controller.*.*(..))")//前置通知
    public void BeforeAd(JoinPoint joinPoint) throws NoSuchMethodException,SecurityException {//异常由Class对象中的getMethod方法产生
      //当前访问时间
      visitTime = new Date();
      //转为年-月-日 时:分:秒字符串
      visitTimeStr = DateAndString.DateToString(visitTime, "yyyy-MM-dd HH:mm:ss");


      //获取操作者信息
      SecurityContext context = SecurityContextHolder.getContext();
      User user = (User) context.getAuthentication().getPrincipal();
      username = user.getUsername();//用户名
      Collection<GrantedAuthority> authorities = user.getAuthorities();//角色

    //获取操作者IP地址
    ip = request.getRemoteAddr();

    //获取访问的类和方法，拼接成url
      //获取切入对象的类
      aClass = joinPoint.getTarget().getClass();



      //★获取方法
      //1. 获取切入对象（方法）的名字
       String  methodName=joinPoint.getSignature().getName();

      //2. 获得方法的参数
      Object[] args = joinPoint.getArgs();


      //3. 判断要获取的方法是否有参数
      if (args==null||args.length==0)//没有参数
      {
          //通过方法名获取方法//无参方法获取
          method = aClass.getMethod(methodName);

      }else {//有参数

          //创建一个argsClass数组
          Class[] argsClass=new Class[args.length];
          //循环，获取args数组里每个参数的类，并且装入argsClass数组
          for (int i=0;i<args.length;i++){

              argsClass[i]= args[i].getClass();
          }
          //通过方法名+参数类型获取方法//有参方法获取
          method= aClass.getMethod(methodName,argsClass);//有的方法，参数是基本数据类型如int，方法内int参数换成Integer包装类
      }

      //拼接url
      String classURL="";//类路径
      String methodURL="";//类后方法路径
//      class和method都拿到后，就可以拿到requestMapping注解里的值
      if (aClass!=null&&method!=null&&aClass!=sysLogAOP.class){//防止空指针，并且class不为自身（？看有人这么写）
//获取类和方法的RequestMapping对象
      RequestMapping classAnnotation =(RequestMapping) aClass.getAnnotation(RequestMapping.class);
      RequestMapping methodAnnotation =(RequestMapping) method.getAnnotation(RequestMapping.class);
     if (classAnnotation!=null){
         classURL=classAnnotation.value()[0];
     }
     if (methodAnnotation!=null){
         methodURL=methodAnnotation.value()[0];
     }
//.value()值为数组
      url=classURL+methodURL;
      }


        //打印输出，方便测试
      System.out.println("访问时间"+ visitTimeStr);
      System.out.println("用户："+username+"；身份："+authorities+"IP地址："+ip);
      System.out.println("访问的类"+aClass+"；方法"+methodName+"\n；URL："+url);
      System.out.println("传递参数值："+ Arrays.toString(args));

  }


  /*
  * 后置通知
  * 生成方法的完成时间
  * 计算耗时
  * 封装日志数据
  * 调用service处理
  * */
  @After("execution(* com.SH.Controller.*.*(..))")
    public void AfterAd() throws Exception{
      //记录方法完成的时间
      Date completeTime=new Date();
      //转换成指定格式字符串
      String completeTimeStr =DateAndString.DateToString(completeTime,"yyyy-MM-dd HH:mm:ss");
      //计算耗时
      Long usedTime=completeTime.getTime()-visitTime.getTime();


      //封装数据
      SysLog sysLog=new SysLog();
      sysLog.setId(completeTimeStr);
      sysLog.setVisitTime(visitTime);
      sysLog.setVisitTimeStr(visitTimeStr);
      sysLog.setUsername(username);
      sysLog.setIp(ip);
      sysLog.setUrl(url);
      sysLog.setExecutionTime(usedTime);
      sysLog.setMethod(method.getName());

        //存入数据库
      boolean flag = sysLogService.insertOne(sysLog);

      //打印输出，方便测试
      System.out.println("完成时间："+completeTimeStr+"；耗时："+usedTime+"毫秒");
      System.out.println("封装日志："+sysLog);
      System.out.println("将日志，存入数据库结果："+flag);
    }
}
```

**tips：**

##### 1.3.1. 关于获取IP

spring提供了一个RequestContextListener，可以在spring中直接使用（先注入）HttpServletRequest对象。在web.xml中配置监听器：

```xml
<!--  为spring提供 request对象,监听器-->
<listener>
 <listener-class>
     org.springframework.web.context.request.RequestContextListener
 </listener-class>
</listener>
```

##### 1.3.2. 关于获取用户信息

可以通过SecurityContextHolder.getContext()获取sercurity上下文对象，从而可以getAuthentication().getPrincipal()获得用户对象，这个上文在权限控制标签中说过。

```java
SecurityContext context = SecurityContextHolder.getContext();//获取Security上下文对象
User user = (User) context.getAuthentication().getPrincipal();//获取用户对象
```

创建sysLogAOP类，使用aop的前置通知、后置通知，详细如下：

##### 1.3.3. 关于获取URL

这里的url是拼接Controller类&方法的@RequestMapping值得到的。

1. 首先需要获取类、方法。

**类**使用**JoinPoint**获取：

```java
//获取对象的类
aClass = joinPoint.getTarget().getClass();
//或
dClass = joinPoint.getSignature().getDeclaringType();
```

至于**方法**，因为将调用的Class对象的**getMethod**方法为：

```java
@CallerSensitive
    public Method getMethod(String name, Class<?>... parameterTypes)
        throws NoSuchMethodException, SecurityException {
        checkMemberAccess(Member.PUBLIC, Reflection.getCallerClass(), true);
        Method method = getMethod0(name, parameterTypes, true);
        if (method == null) {
            throw new NoSuchMethodException(getName() + "." + name + argumentTypesToString(parameterTypes));
        }
        return method;
    }
```

所以要按**有无参数**分开获取：

- 先使用**JoinPoint**得到**方法名**和方法的**参数**：

  ```java
  //1. 获取切入对象（方法）的名字
  String  methodName=joinPoint.getSignature().getName();
  //2. 获得方法的参数（一个Object数组）
  Object[] args = joinPoint.getArgs();
  ```

- 通过判断参数是否为空，来确认方法是否有參。

- 若无参数：

  ```java
  //3. 判断要获取的方法是否有参数
        if (args==null||args.length==0)//没有参数
        {
            //通过方法名获取方法//无参方法获取
            method = aClass.getMethod(methodName);
  ```

- 若有参数：

  ```java
  }else {//有参数

            //创建一个argsClass数组
            Class[] argsClass=new Class[args.length];
            //循环，获取args数组里每个参数的类，并且装入argsClass数组
            for (int i=0;i<args.length;i++){
                argsClass[i]= args[i].getClass();//这里会将int等基础数据类型获取成Integer包装类型
  //              System.out.println("参数："+args[i]);
            }
            //通过方法名+参数类型获取方法//有参方法获取
            method= aClass.getMethod(methodName,argsClass);//有的方法，参数是基本数据类型如int，需要将方法内int参数换成Integer包装类,也就Controller层形参都使用Inter类型
        }
  ```

**此处参数类型问题的详情：**

这里参数获取类型（`arg.getClass()`），会把**基本数据类型**（如int等）**获取成包装类型**（如Integer等），而实际上是基本数据类型，这会使`class.getMethod(String name, Class<?>... parameterTypes)`执行时找不到匹配的方法对象，报`NoSuchMethodException`异常，以及后续的空指针异常。因为获取时便是Integer，使用`isPrimitive()`（确认是否为基本数据类型）的结果始终为false，目前我并未找到完美的解决方法。

**临时的解决方式：**

- ①让Controller内方法的参数类型**只使用Integer**等包装类，不能使用int等基本数据类型。直接把Controller内的int、char等类型改成Integer、Char就行了，不再用代码举例了。

- ②创建一个**HashMap**用来存放包装类型与基本类型的<K、V>对，将获取的包装类型转换为基本类型。这样做就会使Controller类内方法的参数类型**只能用int**等基本数据类型，不能使用Integer等包装类型。当然，其他类型是不影响的。详细代码如下：

  ```java
  @Component
  @Aspect
  public class sysLogAOP {

  //创建一个HashMap，存放包装类与基本类型的KV对，用来将包装类型转为基本数据类型
  private static HashMap<String, Class> map = new HashMap<String, Class>() {
          {
              put("java.lang.Integer", int.class);
              put("java.lang.Double", double.class);
              put("java.lang.Float", float.class);
              put("java.lang.Long", long.class);
              put("java.lang.Short", short.class);
              put("java.lang.Boolean", boolean.class);
              put("java.lang.Char", char.class);
          }
      };

      //获取切入对象的类
        aClass = joinPoint.getTarget().getClass();
        //★获取方法

         String  methodName=joinPoint.getSignature().getName();//1. 获取切入对象（方法）的名字

        Object[] args = joinPoint.getArgs();//2. 获得方法的参数

      //3. 判断要获取的方法是否有参数
        Class[] argsClass=null;//参数类型数组
        if (args==null||args.length==0)//没有参数
        {
            //通过方法名获取方法//无参方法获取
            method = aClass.getMethod(methodName);//获取指定的方法，第二个参数可以不传

        }else {//有参数


            argsClass=new Class[args.length];//创建一个argsClass数组,长度与参数数组相同

            for (int i=0;i<args.length;i++){//循环

                argsClass[i]= args[i].getClass();//获取args数组里每个参数的类，并且装入argsClass数组

                //打印，以供观察
  		 System.out.println("遍历出的参数的类名为："+args[i].getClass().getName());

                if (map.get(args[i].getClass().getName())!=null){//能根据参数的类名在自定义的hashMap中找到对应的基本类型

                    argsClass[i]=map.get(args[i].getClass().getName());//则放入class数组,覆盖掉之前的class数组值，此时通过map将参数类型转为了基本数据类型

                    //打印，以供观察
                    System.out.println("参数类型转换为："+argsClass[i]);


                }else {//如果根据参数的类名在自定义的map集合中取不到值，则说明参数是其他类型

                    //打印，以供观察
                    System.out.println("参数是其他类型，或者是基本类型，保持class不变");
                }
            }

            //打印出最终参数类型
            System.out.println("最终参数类型："+ Arrays.toString(argsClass));
            //通过方法名+参数类型获取方法//有参方法获取
            method= aClass.getMethod(methodName,argsClass);//此时Controller类内方法参数类型就不能为包装类型了，只能用int、char等基本数据类型
        }

  ```

**补充：**还有个同样的问题，它有时还会把其他类型的参数获取成特定类型，如java.util.Map会获取成org.springframework.validation.support.BindingAwareModelMap。我将Controller类内方法的Map类型替换为BindingAwareModelMap类型，暂时避免异常。

![BindingAwareModelMap](https://file.moetu.org/images/2019/07/29/BindingAwareModelMap2313d0f3ec2fb20e280d.png)

BindingAwareModelMap类的信息如图所示，目前使用中尚未出现其他问题。

2. 获取类和方法后，就可获取需要的注解（需要转换），这里是@RequestMapping注解

```java
RequestMapping classAnnotation =(RequestMapping) aClass.getAnnotation(RequestMapping.class);//类的RequestMapping注解
      RequestMapping methodAnnotation =(RequestMapping) method.getAnnotation(RequestMapping.class);//方法的RequestMapping注解
```

当然前提是类和方法不为null

```java
 if (aClass!=null&&method!=null)
```

然后就可以通过获得的RequestMapping对象，获得需要的属性。

**注意：**

虽然是Controller类，但类和方法不能保证都一定有@RequestMapping注解，并且value属性是数组

```java
if (classAnnotation!=null){
         classURL=classAnnotation.value()[0];
     }
     if (methodAnnotation!=null){
         methodURL=methodAnnotation.value()[0];
     }
```

将两个RequestMapping的value值拼接起来，就拿到一个Controller-方法的URL了

```java
String URL=classURL+methodURL;
```

##### 1.3.4. 关于获取参数值和参数名

先获取参数

```java
//获得方法的参数（一个Object数组）
Object[] args = joinPoint.getArgs();
```

1.参数值

- for循环打印出参数值

  ```java
   //循环，打印args数组里的值
            for (int i=0;i<args.length;i++){
                System.out.println("参数："+args[i]);
            }
  ```

- 利用Array的toString方法打印参数值

  ```java
  System.out.println("传递参数值："+ Arrays.toString(args));
  ```

- 参考：[**数组输出的三种方式**](https://blog.csdn.net/chenkaibsw/article/details/78989459)

  2.参数名

```java
ParameterNameDiscoverer dpnd = new DefaultParameterNameDiscoverer();
String[] argsNames = dpnd.getParameterNames(method);//method是之间获取方法时，得到的Method对象
System.out.println("参数名："+ Arrays.toString(argsNames));
```

**然后做个数据分页即可，操作日志就完成了**

### 2. 登录足迹loginLog

我的做法是：在上文Security登录流程中的userServiceImpl类里，获取用户登录时间、ip。将数据拿到后封装，插入到数据库即可。

```java
package com.SH.Service.ServiceImpl;

import ...
@Service("userService")//起个名字，供xml中配置
@Transactional
public class userServiceImpl implements IuserService {

    @Autowired
    private HttpServletRequest request;
	...

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
      		...

            //获取用户ip、登录时间
            String ip = request.getRemoteAddr();
//          Date logintime=new Date();
            String logintime=DateAndString.DateToString(new Date(),"yyyy-MM-dd HH:mm:ss");
        	//打印以观察
            System.out.println("用户："+username+"登陆ip"+ip+"；时间："+logintime);
       		 //将数据插入数据库即可
        	...

    }

    @Override
    public void addUser(UserInfo userInfo) throws Exception {... }
```

### 3. 日志数据分页

依然是使用MyBatis的分页插件PageHelper，分页上次说过，这里简要复习，有一些知识的更新。

#### 3.1. 依赖、Jar包

```xml
<dependency>
            <groupId>com.github.pagehelper</groupId>
            <artifactId>pagehelper</artifactId>
            <version>5.1.2</version>
</dependency>
```

#### 3.2. 分页后台

这里使用了@RequestParam注解，属性name是前端参数名、required为是否必要、defaultValue为默认值。

**分页插件的使用：**

- 分页需要pageNum、pageSize两个参数，int或Integer类型。

- PageHelper.startPage(int pageNum,int pageSize)方法后直接跟需要分页的方法即可，在service层写好后调用service也是可以的。
- 将查询方法返回的List集合交给PageInfo封装
- 在request域放入PageInfo对象即可

```java
@RequestMapping("/selectBypage")
    public ModelAndView selectBypage(@RequestParam(name = "pageNum",required = true,defaultValue = "1") int pageNum,
                                    @RequestParam(name = "pageSize",required = true,defaultValue = "10") int pageSize) throws Exception {

        //分页
        PageHelper.startPage(pageNum,pageSize);
        List<SysLog> sysLogList = sysLogService.selectAll();
        //pageInfo封装
        PageInfo pageInfo=new PageInfo<>(sysLogList);

        ModelAndView mv=new ModelAndView();
        mv.setViewName("syslog-list");
        mv.addObject("pageInfo",pageInfo);

        return mv;
    }
```

**PageInfo包装类的属性：**

```java
//当前页
private int pageNum;
//每页的数量
private int pageSize;
//当前页的数量
private int size;
//排序
private String orderBy;

//可以在页面中"显示startRow到endRow 共size条数据"
//当前页面第一个元素在数据库中的行号
private int startRow;
//当前页面最后一个元素在数据库中的行号
private int endRow;

//总记录数
private long total;
//总页数
private int pages;
//结果集
private List<T> list;

//第一页
private int firstPage;
//前一页
private int prePage;
//下一页
private int nextPage;
//最后一页
private int lastPage;

//是否为第一页
private boolean isFirstPage = false;
//是否为最后一页
private boolean isLastPage = false;
//是否有前一页
private boolean hasPreviousPage = false;
//是否有下一页
private boolean hasNextPage = false;
//导航页码数
private int navigatePages;
//所有导航页号
private int[] navigatepageNums;
```

#### 3.3. 分页前端

##### 3.3.1. 环境准备

**EL表达式**

前端Jsp页面使用EL表达式较为方便，要使用EL表达式注意将`isELIgnored`设为false，是否需要设置，要根据web.xml文件的声明部分的xsd版本而定，因为有的版本默认这个属性是true，会将EL表达式当字符串处理。

.jsp页面设置isELIgnored="false"：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8" isELIgnored="false" %>
```

web.xml，一个默认开启EL的版本：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
         version="3.1">
```

**JSTL标签**

在jsp页面头部引入JSP标准标签库

```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
```

##### 3.3.2. 功能实现

1. 数据展示

   ```java
   <!--数据列表-->
   ...前略
   <!--使用jstl的forEach标签，进行数据遍历，items是要遍历的集合-->
   <c:forEach items="${pageInfo.list}" var="syslog">
   	<tr>
   		<td><input name="ids" type="checkbox"></td>
   		<td>${syslog.id}</td>
   		<td>${syslog.visitTimeStr }</td>
   		<td>${syslog.username }</td>
   		<td>${syslog.ip }</td>
   		<td>${syslog.url}</td>
   		<td>${syslog.executionTime}毫秒</td>
   		<td>${syslog.method}</td>
   	</tr>
   </c:forEach>
   ...后略
   <!--数据列表/-->
   ```

2. 分页按钮

   ```jsp
    <a
      href="${pageContext.request.contextPath}/sysLogController/selectBypage.action?pageNum=1&pageSize=${pageInfo.size}" >首页</a>
   <a
      href="${pageContext.request.contextPath}/sysLogController/selectBypage.action?pageNum=${pageInfo.pageNum-1}&pageSize=${pageInfo.size}">上一页</a>

   <!-- 第一页、第二页、第三页...-->
   <ul>

   <c:forEach begin="1" end="${pageInfo.pages}" var="num">

       <li><a href="${pageContext.request.contextPath}/sysLogController/selectBypage.action?pageNum=${num}&pageSize=${pageInfo.size}">${num}</a></li>

   </c:forEach>
   </ul>

   	<a href="${pageContext.request.contextPath}/sysLogController/selectBypage.action?pageNum=${pageInfo.pageNum+1}&pageSize=${pageInfo.size}">下一页</a>
   	<a href="${pageContext.request.contextPath}/sysLogController/selectBypage.action?pageNum=${pageInfo.pages}&pageSize=${pageInfo.size}">尾页</a>
   ```

3. 改变每页容量

   ```jsp
   <div class="form-group form-inline">
   总共${pageInfo.pages} 页，共${pageInfo.total} 条数据。
       每页 <select id="selectSize" class="form-control" onchange="checkChange()">
   				<option>10</option>
   				<option>15</option>
   				<option>20</option>
   				<option>50</option>
   				<option>80</option>
   		</select> 条
   </div>
   <script>
   //改变每页条数js
   function checkChange(){
   var size=$("#selectSize").val();

   location.href=            "${pageContext.request.contextPath}/sysLogController/selectBypage.action?pageNum=${pageInfo.pageNum}&pageSize="+size;
   }
   </script>
   ```

项目中使用了AdminLTE来美化页面。

**[AdminLTE](https://github.com/ColorlibHQ/AdminLTE)**：一款建立在bootstrap和jquery之上的开源的模板主题工具，它提供了一系列响应的、可重复使用的组件，并内置了多个模板页面；同时自适应多种屏幕分辨率，兼容PC和移动端。
