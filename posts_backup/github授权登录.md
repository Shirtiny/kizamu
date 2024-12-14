---
title: Github授权登录
date: 2019-09-08 20:44:01
tags:
  - Github
categories: 学习经验
---

# Github第三方授权登录

## 创建一个OAuth App

- 登录**Github**，在用户头像的位置，依次进入：

  -> `Settings`/ `Developer settings` /` OAuth Apps`

  点击`New OAuth App`

<!-- more -->

![](https://file.moetu.org/images/2019/09/09/901360f7de54a3d67cd5a93d1ca7f954b49a9337329487cf.png)

- 新建**OAuth App**

  - Application name，自定义的名字
  - Homepage URL，随便写个
  - Application description，描述，自定义写
  - Authorization callback URL，请求github后回调的url，认真写个，不过以后能改

  ![](https://file.moetu.org/images/2019/09/09/3fa417f774aa8082e98427ab4d4d6c3b66b1ac7732aa2be3.png)

- 编辑**OAuth App**信息
  - 这是你的客户端id和密钥

![](https://file.moetu.org/images/2019/09/09/d19314e2a19101f8a3fa0231aeccd9ac87cd9c77c9b8eb0c.png)

- - 这是头像和信息，我这里回调地址写的本地地址，项目上线后再改成公网地址

![](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\1568023712397.png)

> 我的回调地址：http://localhost:8888/github/codeCallback

## 授权流程

### 流程图：

![](https://file.moetu.org/images/2019/09/09/b0f1fe44eb7e8d4d586d0604235656c025752054cc2e51ee.png)

### 实现

- ①调用github授权的api，传递自己的id、scope（是需要的信息，比如user），用controller跳转或直接写在页面的a标签里。

{% note info %}

**GET方式，api**：
`https://github.com/login/oauth/authorize`
**必带参数**：
`client_id`：客户端id
`scope`：需要请求的信息，user repo
**返回值**：
`code`：用于下一步请求access_token
`state`：这一步请求时的可选参数，是自己定义的一串字符串
**返回值实例**：
`http://localhost:8888/github/codeCallback?code=d367eeabc1e0614c3a58&state=shirtiny2011054984anro`

更多参数详情，参照官方文档。

{% endnote %}

**Controller**（或直接写在页面里）

```java
@Value("${Github_Oauth_Authorize_FullUrl}")
private String Authorize_URL;

//请求Github登录授权
    @GetMapping(value = "/github/loginWithGithub")
    public String loginWithGithub() throws IOException {
       //发送请求
        return "redirect:"+Authorize_URL;
    }
```

- ②处理github响应的code、state，传给github的access_token api，拿到响应后的令牌

{% note primary %}

**POST方式，api：**
`https://github.com/login/oauth/access_token`

**必带参数：**
`client_id`：客户端id
`client_secret`：客户端密钥
`code`：上一步github返回的code
`state`：上一步github返回的state，如果有的话
**返回值：**
`access_token`：用于下一步请求用户信息
`token_type`：令牌类型
**返回值实例：**
`access_token=e72e16c7e42f292c6912e7710c838347ae178b4a&token_type=bearer`

{% endnote %}

**服务**

```java
 @Override
    public String getAccessToken(String code, String state) throws IOException {

        OkHttpClient httpClient = new OkHttpClient();
        //json MediaType
        final MediaType MediaType_JSON= MediaType.get("application/json; charset=utf-8");
        //需要实体类对象 然后转成json字符串
        githubOauth.setCode(code);
        githubOauth.setState(state);
//        githubOauth.setRedirect_uri("http://localhost:8888/github/codeCallback");
        String json = JSON.toJSONString(githubOauth);
        //创建请求体
        RequestBody requestBody = RequestBody.create(MediaType_JSON, json);
        //建立请求，post方式调用
        Request request= new Request.Builder().url(url_AccessToken).post(requestBody).build();
        //执行请求
        Response response = httpClient.newCall(request).execute();
        //拿到响应结果
        String tokenAndType = response.body().string();
        System.out.println("得到通关令牌和令牌类型："+tokenAndType);
        return tokenAndType;
    }
```

- ③将响应的令牌传给github的user api，获取用户信息

{% note success %}

**GET方式，api**：
`https://api.github.com/user`
**必带参数：**
`access_token`：上一步github返回的access_token
**返回值：**
用户信息，一个json格式的字符串，建议建一个实体类，方便存储这些信息。

{% endnote %}

**服务**

```java
@Override
    public String getUserInfoJson(String access_token) throws IOException {
        //根据github回调code取用户信息，需要post请求
        OkHttpClient httpClient = new OkHttpClient();
        Request request = new Request.Builder().url(url_User+"?access_token="+access_token).build();
        Response response = httpClient.newCall(request).execute();
        //得到响应的json字符串
        String userInfoJson = response.body().string();
        System.out.println("用令牌调用github的user_api，得到github用户信息："+userInfoJson);
        return userInfoJson;
    }
```

**完整Controller**

```java
package cn.shirtiny.community.SHcommunity.Controller;
import ...

@Controller
public class LoginController {

    @Autowired
    private IGithubService githubService;
    @Value("${Github_Oauth_Authorize_FullUrl}")
    private String Authorize_URL;


    //请求Github登录授权
    @GetMapping(value = "/github/loginWithGithub")
    public String loginWithGithub() throws IOException {
       //发送请求
        return "redirect:"+Authorize_URL;
    }

    //github那边处理完登录、注册、授权，之后会回调设置的url，我设置的回调地址是：http://localhost:8888/github/codeCallback
    @GetMapping(value = "/github/codeCallback")//接收github返回的参数值，样例：http://callbackurl?code=...&state=...
    public String  githubCodeCallback(String code,String state
            , HttpServletRequest httpServletRequest) throws IOException {
        String tokenAndType = githubService.getAccessToken(code, state);//tokenAndType样例access_token=e72e16c7e42f292c6912e7710c838347ae178b4a&token_type=bearer
        //把tokenAndType根据&号分割，取第一个，再根据=号分割，取第二个，得到token
        String accessToken= tokenAndType.split("&")[0].split("=")[1];
        String userInfoJson = githubService.getUserInfoJson(accessToken);
        GithubUserInfo userInfo = JSON.parseObject(userInfoJson, GithubUserInfo.class);
        System.out.println(userInfo);
        httpServletRequest.getSession().setAttribute("userinfo",userInfo);
        return "redirect:/index";
    }
}
```

**属性配置文件**

`*`为保密信息

```properties
Github_Oauth_Authorize_Url=https://github.com/login/oauth/authorize
Github_Oauth_Client_Id=***********
Github_Oauth_Client_Secret=***********
Github_Oauth_Scope=user
Github_Oauth_State=**********
Github_Oauth_AccessToken_Url=https://github.com/login/oauth/access_token
Github_Oauth_Authorize_FullUrl=https://github.com/login/oauth/authorize?client_id=*********&scope=user&state=***********
Github_Oauth_User_Url=https://api.github.com/user
```

**首页页面**

```html
<!-- 右下拉框-->
<ul class="nav navbar-nav navbar-right">
  <!-- if判断 标签内有效-->
  <li><a href="/github/loginWithGithub" th:if="${session.userinfo==null}">登录</a></li>
  <li class="dropdown" th:if="${session.userinfo!=null}">
    <a
      href="#"
      class="dropdown-toggle"
      data-toggle="dropdown"
      role="button"
      aria-haspopup="true"
      aria-expanded="false"
      ><span th:text="${session.userinfo.getLogin()}"></span>个人中心 <span class="caret"></span
    ></a>
    <ul class="dropdown-menu">
      <li><a href="#">Action</a></li>
      <li><a href="#">Another action</a></li>
      <li><a href="#">Something else here</a></li>
      <li role="separator" class="divider"></li>
      <li><a href="#">Separated link</a></li>
    </ul>
  </li>
</ul>
```

[官方文档](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/)
