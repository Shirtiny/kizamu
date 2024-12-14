---
title: Vue基础
date: 2019-08-19 20:58:10
tags:
  - Vue
  - javaScript
categories: 休闲
---

# Vue基础知识

## Vue生命周期&Hook回调函数

![](https://cn.vuejs.org/images/lifecycle.png?_sw-precache=6f2c97f045ba988851b02056c01c8d62)

<!-- more -->

beforeCreate、Created等是钩子回调的函数，通过这些函数，我们可以指定在Vue生命周期的某一阶段做一些事情。

**回调函数示例**

```js
const app =new Vue({
	el:'#id',
	data:obj,
	methods:{...},
    //回调函数
	beforeCreate:function(){...},
    mounted:function(){...}
    ...
})
    //其中，data的obj对象为。data可以是对象。
    const obj={
    	count:0,
    	i:'haha'
	}
```

## 指令

- v-once：执行一次后，内容不再随数据的变化再改变。
- v-html：对内容进行html解析渲染
- v-pre：不对内容进行任何解析
- v-cloak：斗篷，vuejs生效前保留v-cloak，vuejs生效后删除所有v-cloak属性，可以用css控制v-cloak来达成我们的目的，比如当vuejs延迟加载的时候，不让用户看到未被vuejs渲染的源码内容。
- v-text：如v-text="message"，把message数据作为字符串显示，会覆盖掉原本的内容
- v-one:如v-on:click="message"，监听某个事件

### V-bind

动态的绑定特殊意义的属性，如a标签的href，img标签的src，还有class等，动态绑定数据。

简写为：`:`，是语法糖。

#### 静态实例

```html
<div id="app">
  <h1>v-bind指令</h1>
  <a v-bind:href="aURL">blog</a>
  <img v-bind:src="imgURL" /><br />
  v-bind简写:<img :src="imgURL" />
</div>
<script>
  //url对象
  const url = {
    aURL: 'http://shirtiny.cn',
    imgURL:
      'https://file.moetu.org/images/2019/08/20/b46b2347f21fd46f60baf163a57da47c2b17554146847392.png',
  }

  const app = new Vue({
    el: '#app', //挂载
    data: url, //数据对象
  })
</script>
```

#### 如绑定class、style的实例

**对象：**

```html
<style>
  .red {
    color: red;
  }
  .line {
    text-decoration: underline;
  }
</style>

<div id="app">
  <!--<h1 class="class" v-bind:class="{key1:value,key2:value}">v-bind指令</h1>-->

  <p class="class" v-bind:class="{red:isRed,line:isLine}">v-bind指令</p>
  <br />
  <!-- 原class与v-bind:class可以共存，它们会在被渲染时合并（2+1=3）不会覆盖 -->
  <button v-on:click="changeRed">切换颜色</button>
  <button v-on:click="changeLine">下划线</button>

  <!--或者 -->
  <p v-bind:class="getClass()">v-bind指令</p>
  <br />
  <!-- style也一样的-->
  <p :style="{color:'red',fontSize:'50px'}">v-bind指令</p>
  <br />
</div>
<script>
  const app = new Vue({
    el: '#app', //挂载
    data: {
      //class状态
      isRed: true,
      isLine: false,
    },
    methods: {
      changeRed: function () {
        this.isRed = !this.isRed //在true和false之间切换
      },
      changeLine: function () {
        this.isLine = !this.isLine
      },
      getClass: function () {
        return { red: this.isRed, line: this.isLine }
      },
    },
  })
</script>
```

- 对象用｛｝括起来，是key：value的形式，{key1:value,key2:value}
- 原class与v-bind:class可以共存，它们会在被渲染时合并（2+1=3）不会覆盖

**数组：**

```html
<div id="app">
  <p v-bind:class="[isRed,isLine]">v-bind指令</p>
  <br />
  <!--或-->
  <p v-bind:class="getClass()">v-bind指令</p>
  <br />

  <!-- style也一样，数组里放对象，或放键值对都行-->
  <p :style="[hahaColor,hahaLine]">v-bind指令</p>
  <br />
</div>
<script>
  const app = new Vue({
    el: '#app', //挂载
    data: {
      //class状态
      isRed: 'red',
      isLine: 'line',
      hahaColor: { color: 'red', fontSize: '50px' }, //对象
      hahaLine: { 'text-decoration': 'underline' }, //对象
    },
    methods: {
      getClass: function () {
        return [this.isRed, this.isLine]
      },
    },
  })
</script>
```

### 计算属性computed

- 实际上代表了一个函数的值

```html
<!--计算属性-->
<div id="app">{{laopo}}</div>

<script>
  const app = new Vue({
    el: '#app',
    data: {
      haha: '许愿贞德',
      dd: '贞环转',
    },
    computed: {
      laopo: function () {
        return this.haha + this.dd
      },
    },
  })
</script>
```
