---
title: 创建企业邮箱
date: 2019-12-18 16:31:16
tags:
  - email
  - 腾讯企业邮
  - springBoot
categories: 记录
---

# 创建企业邮箱并集成到项目

有些业务需要使用邮箱来完成，这时使用Gmail或qq等个人邮箱就不合适了。需要一个企业自用的邮箱域名，使用自定域名的邮箱，来处理企业的业务。

我在这份md中介绍了，如何使用[腾讯企业邮](https://exmail.qq.com/)来创建企业邮箱，如何自定域名，以及在项目中的使用。

![](https://file.moetu.org/images/2019/12/18/71de057e9eace4672b641a097f28855dafdb4ecebef38ab5.png)

## 1. 注册

Google搜索关键字`腾讯企业邮箱`，或[点此](https://exmail.qq.com/)前往腾讯企业邮首页。

- 选择免费版，点击立即开通。（视实际情况选择专业版）

![](https://file.moetu.org/images/2019/12/18/8c455502d995d9715c7396d8a29096fef5caffef75fd2790.png)

- 选择开通方式，第一次使用选左边，点击开通。

![](https://file.moetu.org/images/2019/12/18/42b0a41ae9723ce31f07da66b443973f4ed4f9728463a2d9.png)

- 点击下一步，然后填写表单，微信扫描二维码进行授权和绑定，记得勾选同意协议，然后点击注册按钮。

![](https://file.moetu.org/images/2019/12/18/99597d18524b47bd62bacc2e31241b21f19545e757827041.png)

## 2. 自定域名

- 注册完成后，会自动分配一个临时域名，点击顶部黄条提示，去添加自定域名

![](https://file.moetu.org/images/2019/12/18/6812ad84bfad4b6043410257cc50b090dc3b1b7b28d3a333.png)

- 点击添加企业域名

![](https://file.moetu.org/images/2019/12/18/80bd666f176d28840b4923b2ed0376ab87d265b33c1b6c5b.png)

- 输入你的域名，或者买个新域名

![](https://file.moetu.org/images/2019/12/18/0e6019f392e057b8cb0c21e6e7ab7b615004c26886b134ad.png)

- 如果是在腾讯云买的域名，会自动添加解析记录，也可以去自己域名提供商那里，找域名解析服务，手动添加记录

![](https://file.moetu.org/images/2019/12/18/9b9c48c81f6c72af26636e6f79dc693e933e1b5d1196c439.png)

- 添加域名解析记录为

![](https://file.moetu.org/images/2019/12/18/21a6ed81a42c21f4263f8ab749376a245966073bb245bce4.png)

## 3. 添加成员

- 添加一个成员，比如添加一个张先生用的邮箱

![](https://file.moetu.org/images/2019/12/18/f71d29354476974ac8c5d0ee07500044c29b6c39d10cd4aa.png)

![](https://file.moetu.org/images/2019/12/18/0fe3e41bc3f42df6401edeac65d8a90f7eaea241831de976.png)

- 点击邀请，即可发送短信通知张先生，让他上线激活邮箱，也可以使用微信邀请。

![](https://file.moetu.org/images/2019/12/18/4417655681aa73ec5de995fb4c7cc9d4ce2108ed8e4d2324.png)

## 4. 简单的使用

- 使用“邮我”功能，可以得到一个连接，能让用户通过此连接来发送邮件给当前邮箱。不过用户需要使用QQ邮箱。

![](https://file.moetu.org/images/2019/12/18/f135265dc70c334df33490f9fc5bf59dfe3ce9c1d6f8ed01.png)

得到的连接：

```html
连接： http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=w7Crg7CrqrG3qq267aCt 加个a标签：
<a
  target="_blank"
  href="http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=w7Crg7CrqrG3qq267aCt"
  style="text-decoration:none;"
  >给我写信</a
>
```

## 5. 项目开发使用

- 首先开启IMAP/SMTP服务、POP/SMTP服务

![](https://file.moetu.org/images/2019/12/18/6239525ef1f52e66dc8fc75e3ab1959ac15dccbff4cf0b92.png)

一些参数的说明：

![](https://file.moetu.org/images/2019/12/18/50cc8f6fcc37dedf48d36355fa9066f1d8ac38f0fce70bd5.png)

- 集成到`springBoot`项目中

需要注意上图的如下参数：

```shell
#POP3/SMTP协议 我的项目中只需要发邮件，pop3即可
接收邮件服务器：pop.exmail.qq.com ，使用SSL，端口号995
发送邮件服务器：smtp.exmail.qq.com ，使用SSL，端口号465
#海外用户可使用以下服务器
接收邮件服务器：hwpop.exmail.qq.com ，使用SSL，端口号995
发送邮件服务器：hwsmtp.exmail.qq.com ，使用SSL，端口号465

#授权信息
账户名：您的企业邮箱账户名，账户名需要填写完整的邮箱地址
密码：您的企业邮箱密码
电子邮件地址：您的企业邮箱的完整邮件地址
```

> IMAP和POP3协议：
> 两者最大的区别在于，IMAP允许双向通信，即在客户端的操作会反馈到服务器上，例如在客户端收取邮件、标记已读等操作，服务器会跟着同步这些操作。POP3常用于“离线”邮件处理，即允许客户端下载服务器邮件，然后服务器上的邮件将会被删除，但是在客户端的操作并不会同步到服务器上面的，例如在客户端收取或标记已读邮件，服务器不会同步这些操作。

对应的`spring`配置参数如下：

- `application.properties`

```properties
#qq邮箱收发邮件
#发送邮件的服务器
spring.mail.host=smtp.exmail.qq.com
#对应端口号
spring.mail.port=465
#用户名（完整的邮箱地址）
spring.mail.username=xx@xx.xx
#密码
spring.mail.password=你的企业邮箱密码
#配置ssl加密 用于加密传输授权信息
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.enable=true
#超时
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=3000
spring.mail.properties.mail.smtp.writetimeout=5000

#from 发信邮箱的地址 这个不属于配置
SH_Mail_From=sh@shirtiny.cn
```

- `application.yml`

```yml
spring:
	mail:
    		host: smtp.exmail.qq.com
    		port: 465
    		username: xx@xx.xx
    		password: 你的企业邮箱密码
```

- 导入Maven依赖

```xml
<!-- 邮件-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
        </dependency>
```

- 发送两种类型的邮件

```java
@Service
public class MailServiceImpl implements ImailService {

    @Autowired
    private JavaMailSender javaMailSender;
    @Value("${SH_Mail_From}")
    private String shMailFrom;

    //简单邮件 标题 内容
    @Override
    public void sendSimpleMail() {
        SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
        simpleMailMessage.setFrom(shMailFrom);
        simpleMailMessage.setTo("sssss111@xxx.com");
        simpleMailMessage.setSubject("主题");
        simpleMailMessage.setText("内容");
        javaMailSender.send(simpleMailMessage);
    }


    //复杂邮件 支持html,抄送,密送等 可以携带附件 文内可以嵌入静态资源
    @Override
    public void sendComplexMail() throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,true);
        helper.setFrom(shMailFrom);
        helper.setTo("sssss111@xxx.com");
        helper.setSubject("主题，你好，欢迎您");
        //支持html 设置html为true即可
        helper.setText("很高兴您能使用我们的网站，如果有什么要为您效劳的，请直说,<a href='http://baidu.com'>SH</a>",true);
        //嵌入静态资源
        helper.addInline("thisImageO",new FileSystemResource(new File("C:\\Users\\Administrator\\Downloads\\11.png")));
        //传递附件
        helper.addAttachment("您的附件.png",new File("C:\\Users\\Administrator\\Downloads\\11.png"));
        javaMailSender.send(mimeMessage);
    }
}
```

- 与`thymeleaf `模版引擎配合，发送模版化的`html`

`html`，注意只有body内有效

```html
<!doctype html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="UTF-8" />
    <title>只有body会在邮件中显示</title>
  </head>
  <body>
    <div style="font-size: 17px">
      <a th:href="@{http://baidu.com?jwt={jwt}(jwt=${jwt})}">SH社区邮箱确认</a>
    </div>
  </body>
</html>
```

`service`

```java
 @Autowired
    private ITemplateEngine templateEngine;

    //与thymeleaf模版引擎配合，发送模版化的html
    @Override
    public void sendTemplateHtml() throws MessagingException {
        Context context = new Context();
        context.setVariable("jwt","shJwt");
        context.setVariable("domain","community.shirtiny.cn");
        String mailContent = templateEngine.process("mail", context);
        sendComplexMail("主题",mailContent);
    }

//复杂邮件 支持html,抄送,密送等 可以携带附件 文内可以嵌入静态资源
    @Override
    public void sendComplexMail(String subject,String mailContent) throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,true);
        helper.setFrom(shMailFrom);
        helper.setTo("shirtiny@gmail.com");
        helper.setSubject(subject);
        //支持html 设置html为true即可
        helper.setText(mailContent,true);
        javaMailSender.send(mimeMessage);
    }
```
