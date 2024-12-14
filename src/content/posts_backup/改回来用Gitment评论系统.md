---
title: 改回来用Gitment评论系统
date: 2019-07-29 11:52:41
tags:
  - 博客维护
  - 评论系统
categories: 系统维护
---

{% note default %}先前使用Gitment评论系统，由于作者证书失效，跨域服务不可用，改用了一段时间的Valine。

Valine不需要登录，昵称和邮箱都是自定义的，身份只能靠浏览器、ip来识别。评论起来方便是方便，不过可读性不高，头像也比较单一。{% endnote %}

{% note success %}相比起来，Gitment是使用Github账户登录的，身份唯一，在github互动也方便，可读性强。{% endnote %}

{% note success %}今天偶然看到一篇[文章](https://sjq597.github.io/2018/05/18/Hexo-%E4%BD%BF%E7%94%A8Gitment%E8%AF%84%E8%AE%BA%E5%8A%9F%E8%83%BD/)，写得很详细，加上同样都是next主题（我比较懒，没怎么搞主题）可以傻瓜式操作，直接cv大法把js链接copy来了，感谢。{% endnote %}

**修改内容**：

<!-- more -->

1. 关闭valine,开启gitment,修改**mint**为false

路径 `D:\HexoBlog\ShirtinyBlog\themes\next\_config.yml`

```yml
# Gitment
# Introduction: https://github.com/imsun/gitment
gitment:
  enable: true
  mint: false # RECOMMEND, A mint on Gitment, to support count, language and proxy_gateway
  count: true # Show comments count in post meta area
  lazy: false # Comments lazy loading with a button
  cleanly: true # Hide 'Powered by ...' on footer, and more
  language: # Force language, or auto switch by theme
  github_user: Shirtiny # MUST HAVE, Your Github Username
  github_repo: Shirtiny.github.io # MUST HAVE, The name of the repo you use to store Gitment comments
  client_id: { id（保密） } # MUST HAVE, Github client id for the Gitment
  client_secret: { 密钥（保密） } # EITHER this or proxy_gateway, Github access secret token for the Gitment
  proxy_gateway: # Address of api proxy, See: https://github.com/aimingoo/intersect
  redirect_protocol: # Protocol of redirect_uri with force_redirect_protocol when mint enabled
```

2. 修改引入的CSS、Js的url

路径 `D:\HexoBlog\ShirtinyBlog\themes\next\layout\_third-party\comments\gitment.swing`

```jsp
<!-- LOCAL: You can save these files to your site and update links -->
{% if theme.gitment.mint %}
  {% set CommentsClass = 'Gitmint' %}
  <link rel="stylesheet" href="https://aimingoo.github.io/gitmint/style/default.css">
  <script src="https://aimingoo.github.io/gitmint/dist/gitmint.browser.js"></script>
{% else %}
  {% set CommentsClass = 'Gitment' %}
  <!--修改前 <link rel="stylesheet" href="https://imsun.github.io/gitment/style/default.css"> -->
  <!-- <script src="https://imsun.github.io/gitment/dist/gitment.browser.js"></script> -->

<!--改后 -->
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/theme-next/theme-next-gitment@1/default.css">
   <script src="https://cdn.jsdelivr.net/gh/theme-next/theme-next-gitment@1/gitment.browser.js"></script>

{% endif %}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/theme-next/theme-next-gitment@1/default.css"/>
<!-- END LOCAL -->
```

也可使用：

```jsp
    <link rel="stylesheet" href="https://jjeejj.github.io/css/gitment.css">
    <script src="https://jjeejj.github.io/js/gitment.js"></script>
```

或

```jsp
<link rel="stylesheet" href="https://jjeejj.github.io/css/gitment.css">
<script src="https://www.wenjunjiang.win/js/gitment.js"></script>
```

我的Giment样式、js（最终修改）

```jsp
<link rel="stylesheet" href="https://shirtiny.cn/css/myGitment.css">
<script src="https://shirtiny.cn/js/myGitment.js"></script>
```
