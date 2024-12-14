---
title: Vue CLI
date: 2019-10-06 17:01:25
tags:
  - Vue
categories: 学习经验
---

# Vue CLI踩坑记录①

<!-- more -->

### 安装相关

Vue CLI 安装见：[官网](https://cli.vuejs.org/zh/guide/installation.html)

cd 到合适的文件夹

```shell
npm install -g @vue/cli
```

版本检查

```shell
vue --version
```

有时因为权限的原因，没有成功自动配置环境变量，如果出现Vue指令不识别的情况，到node的npm安装目录，找到vue.cmd文件，把它所在的目录配置到环境变量里就可以了。

我的路径：

```shell
C:\Users\Administrator\AppData\Roaming\npm
```

### 创建相关

cd 到需要的文件夹，创建项目

```shell
vue create 你的项目名
```

然后上下移动选择框，空格勾选，回车确认

推荐的选择为：

```shell
vue-router
vuex
babel
sass
eslint
```

这是mac的推荐选择。

### 开发相关

- 引入element的组件方式

```shell
vue add element
```

- 引入.vue组件的方式

```javascript
<script>
import NavBar from './components/NavBar.vue'

export default {
  name: 'app',
  components: {
    NavBar
  }
}
</script>
```

- 使用.vue组件的方式

```javascript
<template>
  <div id="app">
    <NavBar />
  </div>
</template>
```

- 路由

配置router.js

```js
import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
// import Upload from './views/Upload.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    //懒加载
    {
      path: '/upload',
      name: 'upload',
      component: () => import('./views/Upload.vue'),
    },
  ],
})
```

使用

element组件使用router属性即可，会自动把index属性的值作为路径

显示

```js
<router-view></router-view>
```

- devServer代理设置，用于处理跨域请求

配置vue.config.js（没有就在项目根目录创建一个）

```js
module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
      '^/test': {
        target: 'http://localhost:8888',
        ws: true,
        changeOrigin: true,
      },
    },
  },
}
```

^/api表示以api开头的所有请求

- axios请求的封装接口

随便建个js文件

```js
import axios from 'axios'

// 视频列表
const listVideos = () => axios.get('/api/video/listVideos').then((res) => res.data)
// 视频详情
const detailVideo = (id) => axios.get(`/api/video/showVideo/${id}`).then((res) => res.data)
// 视频投稿
const createVideo = (form) => axios.post('/api/video/createVideo', form).then((res) => res.data)
//测试
const testC = () => axios.post('/test/c').then((res) => res.data)
export { listVideos, detailVideo, createVideo, testC }
```

对应get无参、有参，post有参

- 引入封装的axios请求接口，以及使用

**Get**

```vue
<template>
  <el-container>
    <el-aside>
      <Aside />
    </el-aside>
    <el-main>
      <div class="home">
        <h1>首页</h1>
        <img alt="Vue logo" src="../assets/logo.png" />
        <button v-on:click="listVideos()">视频列表</button>
        <br />
        <button v-on:click="detailVideo()">视频详情</button>
        <br />
        {{ videos }},
        <br />
        {{ video }}
      </div>
    </el-main>
  </el-container>
</template>

<script>
// @ 一个 别名 表示 /src
import HelloWorld from '@/components/HelloWorld.vue'
import NavBar from '@/components/NavBar.vue'
import Aside from '@/components/Aside.vue'
import * as API from '@/api/video/videoAPI.js'

export default {
  name: 'home',
  data() {
    return {
      videos: [],
      video: {},
    }
  },
  components: {
    HelloWorld,
    NavBar,
    Aside,
  },
  methods: {
    listVideos: function () {
      console.log('调用了listVideos方法')
      API.listVideos().then((res) => {
        this.videos = res.data
      })
    },
    detailVideo: function () {
      console.log('调用了detailVideo方法')
      API.detailVideo(2).then((res) => {
        this.video = res.data
      })
    },
  },
}
</script>
```

**Post**

```js
<template>
  <el-container>
    <el-aside>
      <Aside />
    </el-aside>
    <el-main>
      <div class="upload">
        <h1>投稿</h1>
        <el-form
          ref="form"
          :model="form"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="视频标题" prop="video_title">
            <el-input v-model="form.video_title"></el-input>
          </el-form-item>

          <el-form-item label="视频简介" prop="video_info">
            <el-input type="textarea" v-model="form.video_info"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="uploadV(ruleForm)">确认投稿</el-button>
            <el-button @click="resetForm('ruleForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-main>
  </el-container>
</template>

<script>

import Aside from "@/components/Aside.vue";
import * as API from "@/api/video/videoAPI.js";

export default {
  name: "upload",
  data() {
    return {
      form: {
        video_title: "",
        video_info: ""
      }
    }
  },
  components: {
    Aside
  },
  methods: {
    uploadV: function(){
        console.log("创建视频")
        API.createVideo(this.form).then((res=>{
          console.log(res)
        }))
    }
  }
};
</script>
```

- 自定义css的引入

```js
<style>@import 'assets/css/shVideo.css';</style>
```
