---
title: JWT+Shiro安全无状态服务
date: 2019-11-13 15:19:50
tags:
  - JWT
  - 登录认证
  - 信息安全
categories: 记录
---

# 【长篇】登录认证、权限控制思路整理

在我论坛网站中，登录是第一个做的功能，可做的很简单，只是在河水两岸扔了块软绵绵的木板，以供临时的通行。登录认证、权限控制，这两个服务是隐私的入口，需要格外的注意。现在，社区爬取到了很多的用户数据，我觉得是时候对SSO、JWT这方面的知识做个总结了。

我将在这份md中，边写登录认证服务的代码，边记录与总结自己的思考和体会，之后会整理思路，希望能对读者有所帮助。本文所有实现，都以java为主，框架使用的是SpringBoot。

## 0. 需求

登录注册显然是必须的，此外在我的社区网站中，站长、版主、管理员、普通成员一共有这4种角色，大概可以这么看：

```shell
站长>管理员>版主>普通成员
```

普通成员拥有`发表帖子`、`查看帖子`、`回复评论`、`私信任意用户`等权限

版主则拥有`版块管理`、`版内帖子管理`、`成员发言权管理`等权限

管理员自然拥有`版主管理`、`普通成员管理`、`版块与帖子管理`等权限

站长自然拥有所有权限，包括对权限的修改等。

成员登录，从而进入网站`大门`，而对成员角色的认证，则是网站的一个`小门`。

**依赖**

具体实现上，我打算选用`Shiro`与`JWT`来完成。

```xml
<!--Shiro-->
<dependency>
     <groupId>org.apache.shiro</groupId>
     <artifactId>shiro-spring</artifactId>
     <version>1.2.3</version>
</dependency>
<!--JWT-->
<dependency>
	<groupId>io.jsonwebtoken</groupId>
	<artifactId>jjwt</artifactId>
	<version>0.9.0</version>
</dependency>
```

选择`Shiro`是因为其相对轻量，而且`shiro`这个词我好像经常听到，莫名感觉很亲切。而后者JWT大概是我这份md的主线吧。

## 1. 密码加密存储

显然，无论如何我们都需要把用户存在数据库中，这个有状态服务是无法避免的。

用户表：Users，字段有邮箱、昵称、密码（加密存储）、身份等。

- 密码以密文的形式存储，用户登录时，将邮箱和密码输入，然后网站大门的系统会根据邮箱查询数据库，将用户提交的密码进行加密运算，将运算后得到值去盐与数据库中的密文进行比对，以确认用户是否合法。

### 关于hash加密

加密需要使用hash散列函数来计算，比如`%`取余就是最简单的hash运算，常见的hash算法，像MD5、sha256、sha1，MD5已经被能被人为的制造hash碰撞了，所以不推荐使用。

为什么要使用hash加密呢，因为hash是不可逆的，比如`x%3=9`你无法确定x的值。所以就算得到了数据库中保存的hash值，也难以恢复成原来的密码，而正确的密码取hash后的值，是不变的。

然而，单纯的hash运算后的加密数据，也并不保险，比如彩虹表就能暴力的破解hash。所以又出现了一种更安全的算法`加盐hash`，它会在hash运算中，带上随机数或字符串，从而增加彩虹表的破解难度

### 关于浏览器缓存

说个题外话，web服务器在返回文件时会返回一个eTag作为此文件的唯一标识会放在响应的header里，当浏览器发现再次请求的文件的eTag没有改变时，便不会再拉取文件，这是浏览器的缓存机制，可以节省流量。而eTag是怎么来的呢？我曾经以为是对文件取的hash运算，但后来发现并不是这样。eTag是由文件修改时间`time`与文件大小`size`进行按位异或运算，即：

```shell
//二进制 按位异或运算
time ^ size =  eTage
//比如：
101000010 ^ 10010110 = 00110100
```

### 实现

借助Shiro提供的加密类即可。

```java
package cn.shirtiny.community.SHcommunity.Utils.Encryption;
import ...

@Component("shaEncryptor")
public class ShaEncryptor {
    //使用的加密算法名
    @Value("${Shiro_AlgorithmName}")
    private String algorithmName;
    //盐值
    @Value("${Shiro_Salt}")
    private String salt;

    /**加密
     * @param source 待加密字符串
     * @return 加密后的密文*/
    public String encrypt(String source) {
        SimpleHash simpleHash = new SimpleHash(algorithmName, source, salt);
        return simpleHash.toHex();
    }
}
```

- 对应的配置文件

```properties
#shiro加密密码使用的加密算法名 这里是SHA256
Shiro_AlgorithmName=SHA-256
#盐值
Shiro_Salt=salt
```

- 重写`Shiro`获取用户认证信息的方法

```java
package cn.shirtiny.community.SHcommunity.Shiro;
import ...
//Shiro连接数据的桥梁 从数据库获取数据
public class ShRealm extends AuthorizingRealm {
    @Autowired
    private IuserService userService;

    //获取认证信息
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        UsernamePasswordToken token = (UsernamePasswordToken) authenticationToken;
        String username = token.getUsername();
        User user = userService.selectOneUserByUserName(username);
        //当前的realm名 this.getClass().getName() 可写可不写
        return new SimpleAuthenticationInfo(user,user.getPassWord(),this.getClass().getName());
    }
}
```

- 重写`Shiro`密码校验方法

```java
package cn.shirtiny.community.SHcommunity.Shiro;
import ...

//对shiro密码验证规则重写
public class ShPwdMatcher extends SimpleCredentialsMatcher {
    @Autowired
    private ShaEncryptor shaEncryptor;

    @Override
    public boolean doCredentialsMatch(AuthenticationToken token, AuthenticationInfo info) {
        UsernamePasswordToken upToken = (UsernamePasswordToken) token;
        //用户输入的密码
        String inputPassWord = new String(upToken.getPassword());
        //对用户输入的密码加密
        String encryptedInput = shaEncryptor.encrypt(inputPassWord);
        //数据库中查出的密码密文
        String dbPassword = (String)info.getCredentials();
        //返回两者是否相同
        return this.equals(encryptedInput,dbPassword);
    }
}
```

## 2. Https

在上部分中：

> 密码以密文的形式存储，用户登录时，将邮箱和密码输入，然后网站大门的系统会根据邮箱查询数据库，将用户提交的密码进行加密运算，将运算后得到值去盐与数据库中的密文进行比对，以确认用户是否合法。

这样看起来似乎没什么问题，设想一下，如果有一名黑客，在用户发起登录的Post请求时窃听用户邮箱和密码，这该怎么办呢？应该使用https。对于https，我觉得，需要先从非对称加密说起。

### 关于非对称加密

最有名的非对称加密算法是**RSA**，非对称加密会生成一个密钥对，包含公钥和私钥。分为两种情况，私钥加密，使用公钥解密；公钥加密，使用私钥解密。

这样看，应该不是很清楚，我会举几个例子说明这两种情形：

**情景一**

- A要发送Message给B

- A需要先询问B的公钥，B将自己的公钥告诉对方
- A使用B的公钥加密Message，然后把得到的密文发给B
- B使用自己的私钥解密Message，获得明文

这样，第三者即使看完了整个通信过程，也无法知道Message的内容。但是，第三者知晓了B的公钥，他也可以使用B的公钥加密消息，向B发送消息，此时B是无法知道写信人是谁的。所以，公钥加密，使用私钥解密，这种情形无法防止伪造的问题。

**情景二**

- 依然是A要发送Message给B
- A先把自己公钥发给B
- 然后A使用自己的私钥加密了Message，发送给了B
- B根据A的公钥解密Message，便明确的知道Message确实是来自于A

私钥加密，就像一个人的字迹、签名，能够标识消息的来源。但在这个情形里，Message的内容显然被第三者看的一清二楚。

所以我们发现，只使用非对称加密算法，无法满足我们的需要，所以需要引入对称加密算法。

### 关于对称加密

对称加密有一个共享密钥PSK`Pre Shared Key`，原数据使用PSK加密后得到密文，密文使用PSK解密后，便会回到明文。使用对称加密，需要事先发信双方都知道PSK的值。推荐使用**AES对称加密算法**，DES算法已经被攻破。

**情景三**

- 依然是A要发送Message给B
- A需要先询问B的公钥，B将自己的公钥告诉对方
- A把对称加密的密钥PSK放入Message，使用B的公钥加密后，发送给B
- B使用自己的私钥解密Message，得到PSK
- 然后，双方便可以使用对称加密算法的PSK进行通信

这样就可以防止Message内容的泄漏、修改、伪造了，看上去似乎是个很好的解决方式。

其实，这三种情形，都有一个更大的问题，A并不清楚对方是不是真正的B，B也同样如此。如何理解呢，这里是有个前提，通信是在网络上进行的，而网络上的身份和现实是不绑定的，就像百度搜索xx官网一样，没有一个充分的理由便不能确认它的真实性。此时需要一个中间的机构，比如百度认证的xx官网，我信任百度，便会相信这个xx官网是真正的。那这个组成信任链的中间机构是谁呢？

### CA机构

比如`Let's Encrypt`、`DigiCert`、`赛门铁克`等CA机构，就是中间人。CA机构会颁发数字证书给信任的网站，数字证书是公钥和私钥的密钥对，证书由CA机构的私钥签发。浏览器信任CA机构，便会信任CA机构信任的网站，然后当用户访问受信任的网站时，浏览器便会提醒该站是安全可信的。

于是，便产生了情景四：

**情景四**

- 依然是A要发送Message给B
- A需要先询问B的CA签名公钥，B将CA签名过的公钥告诉对方
- A进行比对，确认是CA签发的，A信任CA，也就信任了B
- A把对称加密的密钥PSK放入Message，使用B的公钥加密后，发送给B
- B使用自己的私钥解密Message，得到PSK
- 然后，双方便可以使用对称加密算法的PSK进行通信

这就是Https核心的加密解密，**RSA非对称加密结合数字签名算法以及CA体系**，所以，Https不会被窃听、伪造、修改，能够确保用户所连接的服务器是受信的。

### RSA非对称加密实现

使用java的security包即可。

```java
package cn.shirtiny.community.SHcommunity.Utils.Encryption;

import javax.crypto.Cipher;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class RSAKey {

    private PrivateKey privateKey;
    private PublicKey publicKey;

    //生成密钥
    public RSAKey() throws GeneralSecurityException {
        //密钥对生成器 生成rsa密钥对生成器
        KeyPairGenerator rsaGenerator = KeyPairGenerator.getInstance("RSA");
        //初始化生成器
        rsaGenerator.initialize(1024);
        //生成密钥对
        KeyPair keyPair = rsaGenerator.generateKeyPair();
        //公钥
        this.publicKey = keyPair.getPublic();
        //私钥
        this.privateKey = keyPair.getPrivate();
        System.out.println("生成公钥：" + Base64.getEncoder().encodeToString(this.publicKey.getEncoded()));
        System.out.println("生成私钥：" + Base64.getEncoder().encodeToString(this.privateKey.getEncoded()));
    }

    //从已有字符数组中恢复密钥
    public RSAKey(byte[] publicKeyBytes, byte[] privateKeyBytes) throws GeneralSecurityException {
        //RSA密钥工厂
        KeyFactory rsaFC = KeyFactory.getInstance("RSA");
        //恢复publicKey 需要X509EncodedKeySpec格式
        X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
        this.publicKey = rsaFC.generatePublic(publicKeySpec);
        //恢复privateKet 需要PKCS8EncodedKeySpec格式
        PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
        this.privateKey = rsaFC.generatePrivate(privateKeySpec);
    }

    //从已有的Base64字符串中回复密钥
    public RSAKey(String publicKeyBase64Str, String privateKeyBase64Str) throws GeneralSecurityException {
        this(Base64.getDecoder().decode(publicKeyBase64Str), Base64.getDecoder().decode(privateKeyBase64Str));
    }


    //获得公钥对象
    public PublicKey getPublicKey() {
        return publicKey;
    }

    //获得私钥对象
    public PrivateKey getPrivateKey() {
        return privateKey;
    }

    //得到公钥字符数组
    public byte[] getPublicKeyBytes() {
        return this.publicKey.getEncoded();
    }

    //得到私钥字符数组
    public byte[] getPrivateKeyBytes() {
        return this.privateKey.getEncoded();
    }

    //得到公钥Base64编码的字符串
    public String getPublicKeyBase64Str() {
        return Base64.getEncoder().encodeToString(getPublicKeyBytes());
    }

    //得到私钥Base64编码的字符串
    public String getPrivateKeyBase64Str() {
        return Base64.getEncoder().encodeToString(getPrivateKeyBytes());
    }

    //加密
    public byte[] encrypt(byte[] str, Key key) throws GeneralSecurityException {
        Cipher rsaCipher = Cipher.getInstance("RSA");
        //初始化 加密模式
        rsaCipher.init(Cipher.ENCRYPT_MODE, key);
        return rsaCipher.doFinal(str);
    }

    //解密
    public byte[] decrypt(byte[] str, Key key) throws GeneralSecurityException {
        Cipher rsaCipher = Cipher.getInstance("RSA");
        //初始化 解密模式
        rsaCipher.init(Cipher.DECRYPT_MODE, key);
        return rsaCipher.doFinal(str);
    }

    //示例
    public void rsaKeyTest() throws GeneralSecurityException {
        RSAKey rsaKey = new RSAKey();
        String message = "公钥加密的消息";
        //公钥加密私钥解
        //公钥加密
        byte[] encryptedMessage = rsaKey.encrypt(message.getBytes(), rsaKey.getPublicKey());
        System.out.println(new String(encryptedMessage, StandardCharsets.UTF_8));
        //私钥解密
        byte[] decryptedMessage = rsaKey.decrypt(encryptedMessage, rsaKey.getPrivateKey());
        System.out.println(new String(decryptedMessage, StandardCharsets.UTF_8));
        //私钥加密公钥解
        message = "私钥加密的消息";
        //私钥加密
        encryptedMessage = rsaKey.encrypt(message.getBytes(), rsaKey.getPrivateKey());
        System.out.println(new String(encryptedMessage, StandardCharsets.UTF_8));
        //公钥解密
        decryptedMessage = rsaKey.decrypt(encryptedMessage, rsaKey.getPublicKey());
        System.out.println(new String(decryptedMessage, StandardCharsets.UTF_8));
    }
}

```

### AES对称加密实现

与非对称加密类似

```java
package cn.shirtiny.community.SHcommunity.Utils.Encryption;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.Base64;

public class AESKey {

    //自定字符串
    private String keyStr = "自定义";
    //由keyStr生成的AES密钥
    private SecretKey aesKey;
    //密钥的Base64编码字符串
    private String aesKeyBase64Str;

    //基于自定字符串 生成新的密钥
    public AESKey() {
        //key生成器
        KeyGenerator aesKeyGenerator = null;
        try {
            aesKeyGenerator = KeyGenerator.getInstance("AES");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        assert aesKeyGenerator != null;
        //初始化key生成器 并要求密钥长度为 256 ( keySize: must be equal to 128, 192 or 256 )
        aesKeyGenerator.init(256, new SecureRandom(this.keyStr.getBytes()));
        //构造aesKey
        this.aesKey = aesKeyGenerator.generateKey();
        //aesKey 的base64编码表示
        this.aesKeyBase64Str = Base64.getEncoder().encodeToString(this.aesKey.getEncoded());
        //打印
        System.out.println(this.aesKeyBase64Str);
    }

    //从已有密钥base64字符串中恢复密钥
    public AESKey(String aesKeyBase64Str) {
        this.aesKeyBase64Str = aesKeyBase64Str;
        byte[] decode = Base64.getDecoder().decode(this.aesKeyBase64Str);
        this.aesKey = new SecretKeySpec(decode, "AES");
    }

    //返回aesKey
    public SecretKey getAesKey() {
        return aesKey;
    }

    //返回aesKey的Base64字符串
    public String getAesKeyBase64Str() {
        return aesKeyBase64Str;
    }

    //加密
    public byte[] encrypt(String message) throws GeneralSecurityException {
        Cipher aesCipher = Cipher.getInstance("AES");
        //初始化 加密模式
        aesCipher.init(Cipher.ENCRYPT_MODE, this.aesKey);
        return aesCipher.doFinal(message.getBytes());
    }

    //解密
    public String decrypt(byte[] encrypted) throws GeneralSecurityException {
        Cipher aesCipher = Cipher.getInstance("AES");
        //初始化 解密模式
        aesCipher.init(Cipher.DECRYPT_MODE, this.aesKey);
        byte[] bytes = aesCipher.doFinal(encrypted);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    //示例方法
    public void aesKeyTest(String[] args) {
        //基于自定字符串 使用新的aes密钥 来测试加密解密
        AESKey aesKey = new AESKey();
        String message = "未加密的消息";
        try {
            //加密
            byte[] encrypt = aesKey.encrypt(message);
            System.out.println("加密后：" + new String(encrypt, StandardCharsets.UTF_8));
            //解密
            String decrypt = aesKey.decrypt(encrypt);
            System.out.println("解密后：" + decrypt);
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
        }
        //从已有字符串中 回复aesKey
        String aesBase64Str = Base64.getEncoder().encodeToString(aesKey.getAesKey().getEncoded());
        AESKey aesKey2 = new AESKey(aesBase64Str);
        System.out.println(Base64.getEncoder().encodeToString(aesKey2.getAesKey().getEncoded()));
    }
}
```

## 3. Token

所以，使用Https传输，结合加盐Hash加密，便可以完成大门的系统。那么，还有个问题，小门怎么办，登录的大门进入了，权限控制的小门该如何对已登入用户进行认证。

- 如果，在用户通过小门时，再去通过用户邮箱查一遍他的角色信息呢？

这是不合适的，此时大门系统和小门系统都是能查到所有用户信息的，这会把重要数据损失的责任分散，如果发现用户信息泄漏了，便不知道该对哪个组件追责。而且，这种设计，会加大数据库的压力。

### 使用Token（令牌）

- 由大门系统发放Token，token有有效期，用户携带的令牌由小门系统认证，这样小门系统便被限制了视野范围。

使用令牌，无需查询用户信息，只需要能确认Token的合法性。但还有个问题，Token存哪呢？小门怎么知道Token是合法的呢？

先不谈把Token存在数据库或Redis里合不合适，先看这个，**能把Token存Session里吗？**

### 为什么Session不安全

对于每个用户，服务器都有一块独立内存，怎么标识这些内存所属用户的呢？Http请求之间并没有关联，服务器如果想要标识某个用户，就只能去依赖Cookie，给每个新用户发一个cookie，里面存放一个sessionId，每次用户请求时，就会携带这个cookie，服务器便会根据对应id访问对应内存。

- 所以说Session依赖于Cookie，而Cookie会被修改和伪造。完全可以把Cookie中的sessionId修改为另外一个用户的id，便可以伪造成别人，进而获得不该有的权限。

- 还有个问题，随着用户的增多，服务器内存便可能会不足，而且恶意的人可以不断使用空Cookie请求服务器，这会使服务器开辟出大量的无用内存。
- 最后一个问题，session是有状态的，由于在内存存储了数据，关机重启或宕机，数据便无法找回，新服务器无法承接旧服务器的工作。

### 为什么不把Token存在数据库或Redis

我们再回头来看Token存储在数据库或Redis中会怎样：

- 负担加重

这个是毋庸置疑的，如果在数据库多了张Token表，我们不止要去频繁的查询，而且还要去维护Token的有效期，显然存在数据库中是不可取的。看到这，您一定会想，存redis里不就完了，访问量高的话，就做性能优化、集群，甚至用消息队列等。并非如此，问题其实并不是出在性能上，而是不合理，尽量避免有状态服务，方便扩展，减少开销。

- 安全隐患

为什么会说有安全隐患呢，因为小门系统通过查询数据库或redis能够拿到任何人的Token，这是不安全的，我们不该让小门系统接触到这些敏感数据，尽量把用户的敏感数据只交给一个系统去负责。

那可以怎么做呢？如何既能避免有状态服务，又能安全的认证token合法性？

### 数字签名

什么是数字签名呢，其实这个概念在上面说非对称加密的时候提到过。而在这儿的情景，用户在大门系统登录时，由大门系统确认用户的合法性，然后将用户需要传输的信息，比如昵称、权限等信息使用大门系统的私钥与加密算法进行加密，这部分加密的数据就是数字签名。

在签名完成后，把**数字签名与昵称、权限等明文信息**（通常由Json、Base64编码）一起作为Token，一并交给用户。小门系统对用户进行权限认证时，会使用大门系统的公钥、以及加密时相应对的解密算法对数字签名解密，如果解密后的内容刚好与明文部分吻合，便通过用户合法认证，然后在看明文数据，查看该用户的权限，从而决定是否放行。

有了数字签名系统后，我们只需要维护好大门的私钥，公开大门的公钥，这样，用户如果需要校验令牌是否过期，只需要在本地校验。

这就是完成了简化版的**JWT**`Json Web Token`。

## 4. JWT

这是一个我服务器生成的JWT：

```shell
eyJ0eXBlIjoiand0Iiwic2lnbkJ5Ijoic2hpcnRpbnkiLCJhbGciOiJSUzI1NiJ9
.eyJqdGkiOiJqd3TllK_kuIBpZCIsInN1YiI6IuS4u-mimCIsImlhdCI6MTU3NDMxNjI5MSwiZXhwIjoxNTc0MzE4MDkxLCLov5nmmK9rZXkiOiLov5nmmK_lgLwifQ
.LVioBqSRdKWq4Doc7JiNAmv3QjxlT94N0wptwoe7SZUPCLbcsGzT19ddUjygvz-zE8f0Nd9GU3wXCdbu2kYpRzlb2x6xwwO6KKYRFPKj6olr_HIKKEumUf4grHHVlWTDuu6FVjJXszMQ_LIleRSjoXqadDCWGiLEV3kjnJ5ybSs
```

> JWT按`.`分为3个部分：head、payload、signature

上面JWT的解析结果为：

```shell
{
    "header": {
        "type": "jwt",
        "signBy": "shirtiny",
        "alg": "RS256"
    },
    "body": {
        "jti": "jwt唯一id",
        "sub": "主题",
        "iat": 1574316291,
        "exp": 1574318091,
        "这是key": "这是值"
    },
    "signature": "LVioBqSRdKWq4Doc7JiNAmv3QjxlT94N0wptwoe7SZUPCLbcsGzT19ddUjygvz-zE8f0Nd9GU3wXCdbu2kYpRzlb2x6xwwO6KKYRFPKj6olr_HIKKEumUf4grHHVlWTDuu6FVjJXszMQ_LIleRSjoXqadDCWGiLEV3kjnJ5ybSs"
}
```

其中`signature`便是上文所说的`数字签名`，也是JWT解析时主要验证的部分。

用户请求时，可以在Http请求头携带`Authorization`字段，值为JWT字符串，这样服务器就无需存储用户信息，从而达成无状态服务，方便扩展。比如，`JavaScript`使用`axios`发送携带`Authorization`字段的请求：

```js
axios
  .post(
    '/shPri/createInvitation',
    {
      title: title,
      content: content,
    },
    {
      headers: { Authorization: jwt },
    },
  )
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(error);
  });
```

那么，如果要存的话，JWT存哪呢？我们显然可以不用存在服务器上了，所以我们有两个选择：

- LocalStorage

LocalStorage和服务器没有任何关系，JS可以随意的操作LocalStorage，JWT存在这里，会被轻松拿到，安全性不高。

- Cookie

使用带有HttpOnly的cookie时，通过JavaScript无法访问，防范XSS（跨站脚本，会盗取cookie，应该尽量的过滤用户发布的信息，不让其发布敏感html），发送请求时会自动带上cookie。

JWT一旦被颁发，就无法撤回、一直合法、无法对其再做其他操作，所以一定要为JWT设置适当的过期时间。如果必须要实现对JWT的有效性管理，就避不开有状态服务。

### JWT实现

使用`jjwt`包即可，这里结合上文的RSA非对称加密，使用RSA算法签名JWT。

```java
package cn.shirtiny.community.SHcommunity.Utils.JWT;
import ...

@Slf4j
//JWT工具类，暂时只实现了jwt的生成和解析
public class JwtRsaHelper {
    private PublicKey publicKey;
    private PrivateKey privateKey;

    //30分钟后过期 毫秒
    private static final long expirationTime=1800_000;

    public JwtRsaHelper(String publicKeyBase64Str,String privateKeyBase64Str){
        RSAKey rsaKey = null;
        try {
            rsaKey = new RSAKey(publicKeyBase64Str,privateKeyBase64Str);
            this.privateKey = rsaKey.getPrivateKey();
            this.publicKey = rsaKey.getPublicKey();
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
            log.error("jwtRsaHelper中的RsaKey密钥对恢复失败", e);
        }
    }

    //生成jwt 使用私钥签名
    public String createJwt(Map<String, Object> claims) {
        //注意把claims第一个设置
        JwtBuilder builder = Jwts.builder()
                .setHeaderParam("type","jwt")
                .setHeaderParam("signBy","shirtiny")
                .setId("jwt唯一id")
                .setSubject("主题")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .addClaims(claims)
                .signWith(SignatureAlgorithm.RS256, this.privateKey);
        return builder.compact();
    }

    //用户令牌
    public String createJwt(User user) {
        Map<String, Object> claims = new HashMap<>();
        //这样user内的信息会作为一个map存入jwt，jwt解析取的时候，需要把user转为map
        claims.put("user",user);
        claims.put("userId",user.getUserId());
        //注意把claims第一个设置 或使用addClaims
        JwtBuilder builder = Jwts.builder()
                .setHeaderParam("type","jwt")
                .setHeaderParam("signBy","shirtiny")
                .setId("Jwt唯一id")
                .setSubject(user.getUserName())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .addClaims(claims)
                .signWith(SignatureAlgorithm.RS256, this.privateKey);
        return builder.compact();
    }

    //解析jwt 返回值包含头、负荷、签名
    public Jws<Claims> parseJwt(String jwt){
        return Jwts.parser().
                setSigningKey(this.publicKey)
                .parseClaimsJws(jwt);
    }

    //获得jwt的body 使用公钥验证签名 如果过期，会抛出ExpiredJwtException
    public Claims parseJwtBody(String jwt) {
        return parseJwt(jwt)
                .getBody();
    }

    //获得jwt的header 使用公钥验证签名
    public JwsHeader parseJwtHeader(String jwt) {
        return parseJwt(jwt)
                .getHeader();
    }

    //获得jwt的签名部分 使用公钥验证签名
    public String parseJwtSignature(String jwt) {
        return parseJwt(jwt)
                .getSignature();
    }
}
```

- 配置类

```java
@Configuration
public class JwtRsaConfig {
    //jwt公钥
    @Value("${Jwt_PublicKey_Base64Str}")
    private String publicKeyBase64Str;
    //jwt私钥
    @Value("${Jwt_PrivateKey_Base64Str}")
    private String privateKeyBase64Str;

    @Bean
    public JwtRsaHelper generateJwtRsaHelper(){
        return new JwtRsaHelper(publicKeyBase64Str,privateKeyBase64Str);
    }
}
```

- 相关配置文件

```shell
#Jwt公钥 base64编码的字符串 太长，省略一部分
Jwt_PublicKey_Base64Str=MIGfMA0GCSqGSIb3DQEBAQUAA...
#Jwt私钥 base64编码的字符串 太长，省略一部分
Jwt_PrivateKey_Base64Str=MIICdgIBADANBgkqhkiG...
```

- 如何使用，比如

```java
package cn.shirtiny.community.SHcommunity.Service.ServiceImpl;
import ...

@Service
public class JwtServiceImpl implements IjwtService {

    @Autowired
    private JwtRsaHelper jwtRsaHelper;

    @Override
    public Map<String, Object> parseJwtByRequest(@NotNull HttpServletRequest request) {
        Claims claims=null;
        String jwt = request.getHeader("Authorization");
        if (jwt==null){
            return null;
        }
        try {
            claims = jwtRsaHelper.parseJwtBody(jwt);
        }catch (Exception e){
            e.printStackTrace();
        }
        return claims;
    }
}
```

## 5. Shiro与JWT的整合

Shiro是基于Session做的认证和权限控制，现在要想修改为依赖JWT来做无状态服务，就不需要使用Session了。

- 在Shiro创建Subject时，不启用session

```java
package cn.shirtiny.community.SHcommunity.Shiro;
import ...

//关闭session
public class NoSessionWebSubjectFactory extends DefaultWebSubjectFactory {
    @Override
    public Subject createSubject(SubjectContext context) {
        //不使用session
        context.setSessionCreationEnabled(false);
        return super.createSubject(context);
    }
}
```

- 关闭Shiro的Session存储策略

```java
//不启用session的subject工厂
    @Bean("noSessionWebSubjectFactory")
    public NoSessionWebSubjectFactory generateNoSessionWebSubjectFactory(){
        return new NoSessionWebSubjectFactory();
    }

//管理器 实例名为securityManager 注入上面的认证授权器shRealm实例
    @Bean("securityManager")
    public SecurityManager generateSecurityManager(@Qualifier("shRealm") ShRealm shRealm
    ,@Qualifier("noSessionWebSubjectFactory") NoSessionWebSubjectFactory noSessionWebSubjectFactory) {
        //管理器，接口的实现使用默认web管理器
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(shRealm);
        /*
         * 关闭shiro自带的session，详情见文档
         * http://shiro.apache.org/session-management.html#SessionManagement-StatelessApplications%28Sessionless%29
         */
        DefaultSubjectDAO subjectDAO = new DefaultSubjectDAO();
        DefaultSessionStorageEvaluator defaultSessionStorageEvaluator = new DefaultSessionStorageEvaluator();
        defaultSessionStorageEvaluator.setSessionStorageEnabled(false);
        subjectDAO.setSessionStorageEvaluator(defaultSessionStorageEvaluator);
        securityManager.setSubjectDAO(subjectDAO);
        //使用自定的无session工厂
        securityManager.setSubjectFactory(noSessionWebSubjectFactory);
        return securityManager;
    }
```

- 自定Shiro拦截器，根据自己的需求来，下面是一个简单实现

```java
package cn.shirtiny.community.SHcommunity.Shiro;

import ...

//自定义的shiro拦截过滤器
//执行流程 preHandle -> isAccessAllowed -> isLoginAttempt -> executeLogin
@Component
public class ShFilter extends BasicHttpAuthenticationFilter {
    @Autowired
    private IjwtService jwtService;

    //登录认证 授权
    @Override
    protected boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) {
        //如果有登录意向
        if (isLoginAttempt(request, response)) {
            try {
                //执行登录 登录成功后放行
               return executeLogin(request, response);
            } catch (LoginFailedException e) {
                //登录出现异常
                HttpServletResponse httpServletResponse = WebUtils.toHttp(response);
                //给一个登录失败错误码
                httpServletResponse.setStatus(ShErrorCode.Login_Failed_Error.getCode());
                return false;
            }
        }else {
            //不放行
            return false;
        }
    }

    //当访问被拒绝时
    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception {

        return false;
    }

    //是否要尝试登录
    @Override
    protected boolean isLoginAttempt(ServletRequest request ,ServletResponse response) {
        //请求头的Authorization有值时，表示想尝试登录
        HttpServletRequest httpRequest = WebUtils.toHttp(request);
        String jwt = httpRequest.getHeader("Authorization");
        return jwt != null && !"".equals(jwt.trim());
//        return super.isLoginAttempt(request,response);
    }

    //执行登录
    @Override
    protected boolean executeLogin(ServletRequest request, ServletResponse response) throws LoginFailedException {
        HttpServletRequest httpRequest = WebUtils.toHttp(request);
        //解析携带token
        Map<String, Object> calims = jwtService.parseJwtByRequest(httpRequest);
        //暂时处理 能解析出来，就登录成功
        if (calims!=null){
            return true;
        }else {
            throw new LoginFailedException("登录失败，令牌无效");
        }

    }
}
```

- 配置拦截器

```java
//过滤器工厂 实例名为shiroFilter 注入上面的管理器securityManager实例
    @Bean("shiroFilter")
    public ShiroFilterFactoryBean generateFilterFactory(@Qualifier("securityManager") SecurityManager securityManager) {
        ShiroFilterFactoryBean factoryBean = new ShiroFilterFactoryBean();
        //设置管理器
        factoryBean.setSecurityManager(securityManager);
        //设置登录地址
        factoryBean.setLoginUrl("/loginPage");
        //设置登录成功后的跳转地址
        factoryBean.setSuccessUrl("/");
        //设置未授权状态跳转的地址
        factoryBean.setUnauthorizedUrl("/403");
        // 添加自己的过滤器并且取名为ShFilter
        Map<String, Filter> filterMap = new HashMap<>();
        filterMap.put("shFilter", new ShFilter());
        factoryBean.setFilters(filterMap);

        LinkedHashMap<String, String> filterChainMap = new LinkedHashMap<>();
        /*DefaultFilter:
        anon：无需认证（登录）可以访问
        authc：必须认证才可以访问
        user：如果使用RememberMe的功能可以直接访问
        perms：该资源必须得到资源权限才可以访问
        role：该资源必须得到角色权限才可以访问
        shFilter：我自定的拦截器
        */
        filterChainMap.put("/login", "anon");
        filterChainMap.put("/shPri/**", "shFilter");
        //设置拦截规则
        factoryBean.setFilterChainDefinitionMap(filterChainMap);
        return factoryBean;
    }
```

- `shiro`整体配置文件

```java
package cn.shirtiny.community.SHcommunity.Config;

import at.pollux.thymeleaf.shiro.dialect.ShiroDialect;
import cn.shirtiny.community.SHcommunity.Shiro.NoSessionWebSubjectFactory;
import cn.shirtiny.community.SHcommunity.Shiro.ShFilter;
import cn.shirtiny.community.SHcommunity.Shiro.ShPwdMatcher;
import cn.shirtiny.community.SHcommunity.Shiro.ShRealm;
import org.apache.shiro.mgt.DefaultSessionStorageEvaluator;
import org.apache.shiro.mgt.DefaultSubjectDAO;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.spring.LifecycleBeanPostProcessor;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.servlet.Filter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class ShiroConfig {

    //自定义的shiro密码比较器 实例名为shPwdMatcher
    @Bean("shPwdMatcher")
    public ShPwdMatcher generateShPwdMatcher() {
        return new ShPwdMatcher();
    }

    //认证和授权器 实例名为shRealm  注入上面的密码比较器shPwdMatcher实例
    @Bean("shRealm")
    public ShRealm generateShRealm(@Qualifier("shPwdMatcher") ShPwdMatcher shPwdMatcher) {
        ShRealm shRealm = new ShRealm();
        //设置密码比较器
        shRealm.setCredentialsMatcher(shPwdMatcher);
        return shRealm;
    }

    //不启用session的自定subject工厂
    @Bean("noSessionWebSubjectFactory")
    public NoSessionWebSubjectFactory generateNoSessionWebSubjectFactory(){
        return new NoSessionWebSubjectFactory();
    }

    //管理器 实例名为securityManager 注入上面的认证授权器shRealm实例
    @Bean("securityManager")
    public SecurityManager generateSecurityManager(@Qualifier("shRealm") ShRealm shRealm
    ,@Qualifier("noSessionWebSubjectFactory") NoSessionWebSubjectFactory noSessionWebSubjectFactory) {
        //管理器，接口的实现使用默认web管理器
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(shRealm);
        /*
         * 关闭shiro自带的session，详情见文档
         * http://shiro.apache.org/session-management.html#SessionManagement-StatelessApplications%28Sessionless%29
         */
        DefaultSubjectDAO subjectDAO = new DefaultSubjectDAO();
        DefaultSessionStorageEvaluator defaultSessionStorageEvaluator = new DefaultSessionStorageEvaluator();
        defaultSessionStorageEvaluator.setSessionStorageEnabled(false);
        subjectDAO.setSessionStorageEvaluator(defaultSessionStorageEvaluator);
        securityManager.setSubjectDAO(subjectDAO);
        //使用自定的无session工厂
        securityManager.setSubjectFactory(noSessionWebSubjectFactory);
        return securityManager;
    }

    //过滤器工厂 实例名为shiroFilter 注入上面的管理器securityManager实例
    @Bean("shiroFilter")
    public ShiroFilterFactoryBean generateFilterFactory(@Qualifier("securityManager") SecurityManager securityManager) {
        ShiroFilterFactoryBean factoryBean = new ShiroFilterFactoryBean();
        //设置管理器
        factoryBean.setSecurityManager(securityManager);
        //设置登录地址
        factoryBean.setLoginUrl("/loginPage");
        //设置登录成功后的跳转地址
        factoryBean.setSuccessUrl("/");
        //设置未授权状态跳转的地址
        factoryBean.setUnauthorizedUrl("/403");
        // 添加自己的过滤器并且取名为ShFilter
        Map<String, Filter> filterMap = new HashMap<>();
        filterMap.put("shFilter", new ShFilter());
        factoryBean.setFilters(filterMap);

        LinkedHashMap<String, String> filterChainMap = new LinkedHashMap<>();
        /*DefaultFilter:
        anon：无需认证（登录）可以访问
        authc：必须认证才可以访问
        user：如果使用RememberMe的功能可以直接访问
        perms：该资源必须得到资源权限才可以访问
        role：该资源必须得到角色权限才可以访问
        */
        filterChainMap.put("/login", "anon");
        filterChainMap.put("/shPri/**", "shFilter");
        //设置拦截规则
        factoryBean.setFilterChainDefinitionMap(filterChainMap);
        return factoryBean;
    }


    //处理shiro与spring的关联

    //使用自定的管理器 配置授权参数源顾问
    @Bean
    public AuthorizationAttributeSourceAdvisor generateAdvisor(@Qualifier("securityManager") SecurityManager securityManager) {
        AuthorizationAttributeSourceAdvisor advisor = new AuthorizationAttributeSourceAdvisor();
        advisor.setSecurityManager(securityManager);
        return advisor;
    }

    //使用代理
    @Bean
    public DefaultAdvisorAutoProxyCreator useProxy() {
        // 强制使用cglib，防止重复代理和可能引起代理出错的问题
        // https://zhuanlan.zhihu.com/p/29161098
        DefaultAdvisorAutoProxyCreator proxyCreator = new DefaultAdvisorAutoProxyCreator();
        proxyCreator.setProxyTargetClass(true);
        return proxyCreator;
    }


/*    @Bean
      public LifecycleBeanPostProcessor lifecycleBeanPostProcessor() {
          return new LifecycleBeanPostProcessor();
     }
*/
/*
    //需要在shiro配置文件中增加一个方法，用于thymeleaf和shiro标签配合使用
    @Bean
    public ShiroDialect getShiroDialect() {
        return new ShiroDialect();
    }
*/
    /*shiro：hasPermission 作用：用于判断用户是否拥有这个权限，有则显示这个div，没有则不显示。
    <div shiro:hasPermission="user:add">进入用户添加功能：<a href="add">用户添加</a><br/>
    </div>
    */
}
```
