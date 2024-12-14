---
title: 'JQuery EasyUI入门'
date: 2019-07-03 19:38:55
tags:
  - javaScript
  - easyUI
  - 开发知识
categories: 学习经验
---

## EasyUI入门使用

### 简 介

easyui是一种基于jQuery、Angular.、Vue和React的用户界面插件集合，可简单快速的搭建页面布局，方便后台人员制作简易的管理界面，节省网页开发的时间和规模，现在开始学习easyUI的jquery版本的入门使用。

### 引入资源文件

在官网下载jQuery版的easyUI后，在项目的webapp中建立一个文件夹，用于存放easyUI的资源文件，如图所示：

<!-- more -->

![9VDU`MH2CLBZ8AD4ZIU)}03](https://file.moetu.org/images/2019/07/02/9VDUMH2CLBZ8AD4ZIU0345725e1402bc8125.png)

分别选择themes、jquery.easyui.min.js和jquery.min.js，导入到项目中，如图所示：

![图片](https://file.moetu.org/images/2019/07/02/18cc145d485e8ff7f7b646be59cb04c6705219e11b708726.png)

新建html或jsp，在< head>里引用项目中的资源文件，如下所示：

```html
<head>
  <meta charset="UTF-8" />
  <title>easyUI.html-class</title>

  <link rel="stylesheet" type="text/css" href="easyUI/themes/default/easyui.css" />
  <link rel="stylesheet" type="text/css" href="easyUI/themes/icon.css" />
  <script type="text/javascript" src="easyUI/jquery.min.js"></script>
  <script type="text/javascript" src="easyUI/jquery.easyui.min.js"></script>
  <!-- 新增 -->
  <script type="text/javascript" src="easyUI/locale/easyui-lang-zh_CN.js"></script>
</head>
```

## 功能和使用

### 1、树（tree）

easyui-tree：树形菜单

效果如图：

![RCD3V8I31VJOZAGGH_4KPbd4ec850239eb212.png](https://file.moetu.org/images/2019/07/02/RCD3V8I31VJOZAGGH_4KPbd4ec850239eb212.png)

**使用**：

`easyui-tree` 、 `.tree()`

**属性**：

`checkbox：true`（可开启复选框）

可直接在标签中用`class=“easyui-tree”`来使用，注意`< span>`标签，`data-options`中配置属性，多个属性之间用**逗号**隔开：

```html
<ul class="easyui-tree" data-options="checkbox:true">
  <li>
    <span>菜单a</span>
    <ul>
      <li><span>菜单1</span></li>
    </ul>
  </li>
  <li><span>菜单b</span></li>
</ul>
```

推荐使用普通html标签+js的方式来实现。这样能处理更**复杂**的样式。

具体写法为在标签设置一个`id`或`class`，接下来在js写`$(function(){ })`,大括号中使用`$("#id")`或是class用`$(".class")`来指定对象。

接着对象后`.tree();`即可设置树应用到对象，关于`.tree()`里的属性的设置，直接在`（）`中使用`｛｝`大括号将属性包括即可，多个属性用逗号隔开，与`data-options`相同。

如 `$("#uitree").tree( { checkbox:true ，...  }  );` ，

整体代码如下：

```html
<%--树形菜单 可设置checkbox属性--%>
<ul id="uitree">
  <li>
    <span>菜单a</span>
    <ul>
      <li><span>菜单a-1</span></li>
    </ul>
  </li>
  <li><span>菜单b</span></li>
</ul>

<script type="text/javascript">
  $(function () {
    $('#uitree').tree({
      checkbox: true,
    })
  })
</script>
```

`.tree()`应用tree功能，tree()的属性如checkbox设为true可开启选择框，部分其他功能用法与tree**一样**，非必要时不再赘述。

### 2、拖动和放置

easyui-draggable：可拖动

easyui-droppable：可放置

效果如图：

![RCD3V8I31VJOZAGGH_4KPbd4ec850239eb212.png](https://file.moetu.org/images/2019/07/03/232323211234252e19956ffbc7886ea.png)

**使用**：

`easyui-draggable` 、 `.draggable()`；`easyui-droppable` 、 `.droppable()`；

拖动和放置两个功能，可同时作用于一个对象。

1. **拖动**

- `handle:''#xxx'`（指定只有拖住’#xxx‘时，才可拖动整个div）
- proxy
- `proxy:'clone'`（拖动时创建复制的副本，拖动时拖动副本，松手时本体位置改变，副本消失）
- proxy:function(source){}（自定义一个副本）
- `revert:true`（拖动时松手，元素将返回原来位置）
- `disabled:true`（停用拖动）
  [更多...](http://www.jeasyui.net/plugins/152.html)

2. **放置**

- `accept:"#xx1,#xx2"` （指定可放置的对象）

- `disabled:true`（停用可放置）

- `onDrop:function (e, source) {    $(this).append(source);}`（将对象放置区域内部）

  [更多...](http://www.jeasyui.net/plugins/153.html)

class方式使用：

```html
<!--可拖动的div  draggable, 在data-options将属性handle进行下例的设置，就可设置只有拖动id为title的div才会生效-->
<div
  class="easyui-draggable"
  data-options="handle:'#title'"
  style="width: 200px;height: 100px;background-color: #00bbee"
>
  <div id="title" style="width: auto;height: 20px">div的标题title</div>
</div>
```

JS方式（css+html+js代码如下）：

```html
<%--拖动和放置div的CSS--%>
<style type="text/css">
  .DDbox {
    width: 700px;
    height: 200px;
    border: 1px solid black;
  }
  #Div_draggable {
    width: 300px;
    height: 100px;
    background-color: #00ee00;
    margin-right: 100px;
    border: 1px solid black;
    float: left;
  }
  .content {
    height: 20px;
    width: 100px;
    background-color: #00bbee;
    margin: 5px;
  }
  #Div_droppable {
    width: 200px;
    height: 100px;
    border: 1px solid black;
    float: left;
  }
</style>

<%--可拖动div
可设置handle属性、proxy代理属性（clone或自定义新对象(传递一个function)）,revert设置为true可在鼠标释放时复原，其他也可设置拖拽范围--%>

<div class="DDbox">
  <div id="Div_draggable">
    <div id="title" style="width: auto;height: 20px">拖拽我 才可拖动整个div</div>
    <div class="content" id="drag1">内容1</div>
    <div class="content" id="drag2">内容2</div>
    <div class="content" id="drag3">内容3</div>
  </div>

  <%--与draggable组合，可放置元素的容器--%>

  <div id="Div_droppable">
    <div id="title2" style="width: auto;height: 20px">可放置的容器</div>
  </div>
</div>

<%--拖动和放置的js, 可拖动和可放置 能同时作用于同一个div--%>

<script type="text/javascript">

  <%-- （注意大小写） 左：  拖动--%>
      $(function () {
      $("#Div_draggable").draggable({
          handle:'#title',proxy:'clone'
      }).droppable({
          onDrop:function (e,source) {
              $(this).append(source);
          }
      });
      $(".content").draggable({
          proxy:'clone',revert:true
      })
  });

  <%--右：  放置 --%>
      $(function () {
      $("#Div_droppable").droppable({
          accept:"#drag1,#drag2",
          onDrop:function (e, source) {
              $(this).append(source);
          }
      }).draggable({
          proxy:'clone',handle:'#title2'
      });
  })
</script>
```

### 3、调节尺寸

easyui-resizable：可调节尺寸大小，注意单词是**resizable** ，不是resize，没有e。
效果如图：
![可调节区域](https://file.moetu.org/images/2019/07/05/KUHWI9BNU6CSUBGHSe96bb0a32aaa819c.png)

鼠标放置区域的边框上即可调节长宽。

【**属性**】（区分大小写，像素不用带px）：

- minWidth：最小宽度
- minHeight：最小高度
- maxWidth：最大宽度
- maxHeight：最大高度

[更多...](http://www.jeasyui.net/plugins/154.html)

使用1：

```html
<!--可缩放的div区域 resizable,有minWidth、minHeight、maxWidth等属性，注意像素直接写数字不要带px，逗号隔开-->
<div
  class="easyui-resizable"
  data-options="minWidth:100,minHeight:100,maxWidth:500"
  style="border: solid;width: 100px;height: 150px"
></div>
```

使用2：

```html
<%--可缩放调整大小的div resizable--%>
<div id="resize" style="height: 50px;width: 50px;border: solid"></div>

<script type="text/javascript">
  $(function () {
    $('#resize').resizable({
      minWidth: 25,
      minHeight: 25,
    })
  })
</script>
```

博主：(╯﹏╰)给自己挖个大坑，这样写太耗时间了，后面会有个easyUI实际运用的文章。
