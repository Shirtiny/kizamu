---
title: GO!
date: 2019-10-02 23:09:50
tags:
  - Golang
  - Gin
categories: 闲谈
---

# Java看累了？玩会儿Go吧！

### It‘s Go！

Go的吉祥物：

![](https://file.moetu.org/images/2019/10/02/timg646c778de430878f.jpg)

是不是很沙雕[#233]，有趣的灵魂，爱了爱了。en，`Go`大概是2010年的新兴语言，和其他老前辈们比还是个小孩子。

<!-- more -->

### Why Go?

{% note info %}

Go语言`Golang`，与`c`一样是一种静态强类型语言，和`java`一样有垃圾回收机制`Gc`，支持低消耗的并发，与Docker亲和力极高（因为Docker是Go写的嘛），Go的web程序能在Docker中占用极小的内存。

这些都是听别人说的，在逐渐深入的学习中，慢慢总结吧。

{% endnote %}

### Let's Go!

从`helloworld`开始？ No!! Go的底层原理复杂，但是语法易懂。我们不必从abc开始学习，从开源项目入手，慢慢的去熟悉它，看不懂的地方再去查阅资料。既然学了这么长时间的JavaWeb，我们来看一下Go的Web是什么样的流程呢？

{% note success %}

#### 项目结构

这是一个Go的Web开源项目，使用了`Gin`这个框架，是MVC模式，结构如图所示：

![](https://file.moetu.org/images/2019/10/02/ba17b7aa0894ca45154a6139d8dd9580d70a662fe006b75d.png)

它的入口是`main.go`，这使我们联想到了`springBoot`，我们只需要在命令行输入`go run main.go`便可运行这个项目，它会运行在一个端口上。

- 使用`PostMan`向它的一个接口发送 `Post`方式的请求，会发生什么事呢？

![](https://file.moetu.org/images/2019/10/02/012a421bb43c9ef3a4f73aab92bbbd88393bf0ea0641ab24.png)

{% endnote %}

#### Server

- 首先进入了`server`包下的`router.go`

```go
// 路由
	v1 := r.Group("/api/v1")
	{
		//测试
		v1.GET("test", api.TestVideo)
		//增加一个视频
		v1.POST("addVideo", api.AddVideo)

	}
```

显然，它设置了一个类似于`requestMapping`的路径，然后指定了这个路径调用的”方法“。

#### Api

- 然后，它根据请求路径，调用了`api`包下的`AddVideo`

```go
//所在的包
package api

//导入包
import (
	"singo/service"
	"github.com/gin-gonic/gin"
)

//AddVideo 增加一个视频的方法 c是参数？
func AddVideo(c *gin.Context) {
	//拿到service对象
	var service service.CreateVideoService
	//绑定service
	error := c.ShouldBind(&service)
	if error != nil {
		//service绑定失败
		c.JSON(500, ErrorResponse(error))
	} else {
		//调用创建视频的service的create方法 result :=传
		result := service.Create(c)
		c.JSON(200, result)
	}
}
```

注意，这个注释是我加的，只是一个不懂Go的java使用者的胡猜，并不准确。

然后可以看到，它又调用了一个和service有关的方法，所以我们想，这个`api`对应Controller，而且前面也说了是MVC模式，所以Service应该也能明白。

```go
c.JSON(200, result)
```

Controller在返回数据时，使用了`c`的方法，这个方法应该是返回了`Json`，而这个`c`应该是`github.com/gin-gonic/gin`包下的，`Gin`是Web框架，所以这个`c`可能是框架封装好的。

#### Service

- 接下来，我们看Controller调用的service里是什么

```go
package service

import (
	"singo/model"
	"singo/serializer"

	"github.com/gin-gonic/gin"
)

// CreateVideoService 创建视频的服务结构体（有点像类）
type CreateVideoService struct {
	VideoID    int    `form:"video_id" json:"video_id"`
	VideoTitle string `form:"video_title" json:"video_title" binding:"required"`
	VideoInfo  string `form:"video_info" json:"video_info"`
}

// Create 创建视频函数
func (service *CreateVideoService) Create(c *gin.Context) serializer.Response {
	//绑定参数，模型:service.xx
	video := model.Video{
		VideoID:    service.VideoID,
		VideoTitle: service.VideoTitle,
		VideoInfo:  service.VideoInfo,
	}
	//操作数据库，把错误返回
	error := model.DB.Create(&video).Error
	if error != nil {
		return serializer.Response{
			Code: 500,
			Msg:  "数据库操作失败",
			//返回错误信息
			Error: error.Error(),
		}
	}

	return serializer.Response{
		//返回序列化的video，需要调用video的序列化器
		Data: serializer.BuildVideo(video),
	}
}
```

代码想想应该能明白。

```go
model.DB.Create(&video)
```

这个方法操作了数据库，这个应该是框架的封装。不过我找到了配置数据库的这段代码：

```go
package model

import (
	"singo/util"
	"time"
	"github.com/jinzhu/gorm"
	"github.com/jinzhu/gorm/dialects/mysql"
)

// DB 数据库链接单例
var DB *gorm.DB

// Database 在中间件中初始化mysql链接
func Database(connString string) {
	db, err := gorm.Open("mysql", connString)
	db.LogMode(true)
	// Error
	if err != nil {
		util.Log().Panic("连接数据库不成功", err)
	}
	//设置连接池
	//空闲
	db.DB().SetMaxIdleConns(50)
	//打开
	db.DB().SetMaxOpenConns(100)
	//超时
	db.DB().SetConnMaxLifetime(time.Second * 30)
	DB = db
	migration()
}
```

#### Model

- 再次检查Service

应该都看到了这一块代码:

```go
	video := model.Video{
		VideoID:    service.VideoID,
		VideoTitle: service.VideoTitle,
		VideoInfo:  service.VideoInfo,
	}
```

这里对Video模型和service的Video的参数进行了绑定，Video模型`Model`代码如下：

```go
package model

import "github.com/jinzhu/gorm"

// "golang.org/x/crypto/bcrypt"

// Video 视频模型
type Video struct {
	gorm.Model
	VideoID    int
	VideoTitle string
	VideoInfo  string
}
```

#### Serializer

- 最后一个封装，我们在看一遍Service的代码

```go
//操作数据库，把错误返回
	error := model.DB.Create(&video).Error
	if error != nil {
		return serializer.Response{
			Code: 500,
			Msg:  "数据库操作失败",
			//返回错误信息
			Error: error.Error(),
		}
	}
```

我们看一下`serializer.Response`做了什么：

```go
package serializer

import "github.com/gin-gonic/gin"

// Response 基础序列化器
type Response struct {
	Code  int         `json:"code"`
	Data  interface{} `json:"data,omitempty"`
	Msg   string      `json:"msg"`
	Error string      `json:"error,omitempty"`
}
```

显然，这是对服务器返回结果的通用序列化封装。

- 还有一个专门对Video结果序列化的封装

```go
return serializer.Response{
		//返回序列化的video，需要调用video的序列化器
		Data: serializer.BuildVideo(video),
	}
```

`serializer.BuildVideo()`：

```go
package serializer

import "singo/model"

//Video 视频序列化器结构体
type Video struct {
	VideoID    int    `json:"video_id"`
	VideoTitle string `json:"video_title"`
	VideoInfo  string `json:"video_info"`
}

//BuildVideo 序列化视频
func BuildVideo(video model.Video) Video {
	return Video{
		VideoID:    video.VideoID,
		VideoTitle: video.VideoTitle,
		VideoInfo:  video.VideoInfo,
	}
}
```

#### 返回结果

![](https://file.moetu.org/images/2019/10/03/83875aca96bc63aa21955a7c1bb3d2d8b6e52f1296a66c66.png)

`code`和`msg`好像不大对，不过我们成功的向数据库中插入了一条数据，也算是走通了吧。

- [GORM文档](http://gorm.io/docs/index.html)

![](https://file.moetu.org/images/2019/10/03/loadTV.99606e2fea1cef8775212da.gif)

**努力**更新中...

## 基本增删改查

第二天睡醒

![](https://file.moetu.org/images/2019/10/03/timg49527e1f33078cc2.jpg)

**？？**肥皂君？

#### 好吧，顺便再把其他几个简单接口看了。

#### 增

- 这个接口我们已经看过了

```shell
POST http://localhost:3000/api/video/createVideo
```

- **请求**

```json
{
  "video_id": 8,
  "video_title": "8这是新的标题",
  "video_info": "8这是新的信息"
}
```

- **响应**

```json
{
  "code": 200,
  "data": {
    "video_id": 8,
    "video_title": "8这是新的标题",
    "video_info": "8这是新的信息"
  },
  "msg": "视频保存成功"
}
```

为什么不截图？e，图床宕机了，emmm

#### 查`One`

```shell
GET http://localhost:3000/api/video/showVideo/1
```

**响应**

```json
{
  "code": 200,
  "data": {
    "video_id": 1,
    "video_title": "第一个视频标题",
    "video_info": "第一个go后台"
  },
  "msg": "找到了该视频"
}
```

- **server**

```go
//展示一个视频的详情/:id
videoAPI.GET("showVideo/:id", api.ShowVideo)
```

- **api**

注意`id`由`c.Param("id")`传入service的函数

```go
//ShowVideo 展示视频的详情
func ShowVideo(c *gin.Context) {
	//service
	service := service.ShowVideoService{}
	//绑定(可以不绑定，因为结构体为空，绑定的话必须传个json过来，不过这个是get请求没有body)
	error := c.ShouldBind(&service)
	if error != nil {
		c.JSON(500, ErrorResponse(error))
	} else {
		result := service.Show(c.Param("id"))
		c.JSON(200, result)
	}
}
```

- **service**

注意这里`ShowVideoService`的结构体为空，`model.DB.Find(&video, id)`是根据`id`查询`video`表

```go
package service

import (
	"singo/model"
	"singo/serializer"
)

//ShowVideoService 结构体 注意这个结构体为空
type ShowVideoService struct {
}

//Show show函数有个string类型的id
func (service *ShowVideoService) Show(id string) serializer.Response {
	var video model.Video
	error := model.DB.Find(&video, id).Error
	//若出错
	if error != nil {
		return serializer.Response{
			Code:  404,
			Msg:   "未找到指定id的视频",
			Error: error.Error(),
		}
	}
	//成功则返回数据
	return serializer.Response{
		Code: 200,
		Msg:  "找到了该视频",
		Data: serializer.BuildVideo(video),
	}
}
```

#### 查`List`

```shell
GET http://localhost:3000/api/video/listVideos
```

**响应**

```json
{
  "code": 200,
  "data": [
    {
      "video_id": 1,
      "video_title": "第一个视频标题",
      "video_info": "第一个go后台"
    },
    {
      "video_id": 1,
      "video_title": "第一个视频标题",
      "video_info": "第一个go后台"
    },
    {
      "video_id": 3,
      "video_title": "第3个视频标题",
      "video_info": "第3个go后台"
    },
    {
      "video_id": 4,
      "video_title": "这是新的标题",
      "video_info": "这是新的信息"
    },
    {
      "video_id": 4,
      "video_title": "第4个视频标题",
      "video_info": "第3个go后台"
    },
    {
      "video_id": 8,
      "video_title": "8这是新的标题",
      "video_info": "8这是新的信息"
    }
  ],
  "msg": "查询列表完成"
}
```

- **server**

```go
//展示所有视频的列表
videoAPI.GET("listVideos", api.ListVideos)
```

- **api**

注意Get请求是无需`ShouldBind`的

```go
//ListVideos 展示所有视频的列表
func ListVideos(c *gin.Context) {
	//service
	service := service.ListVideosService{}
	error := c.ShouldBind(&service)
	if error != nil {
		c.JSON(500, "服务器出错")
	} else {
		result := service.List()
		c.JSON(200, result)
	}
}
```

- **service**

`model.DB.Find(&videos)`查询`videos`表中全部数据，特别要注意这里对`Videos`的序列化处理，看`serializer`部分

```go
package service

import (
	"singo/model"
	"singo/serializer"
)

//ListVideosService 结构体 注意这个结构体为空
type ListVideosService struct {
}

//List 显示视频列表
func (service *ListVideosService) List() serializer.Response {
	var videos []model.Video
	error := model.DB.Find(&videos).Error
	if error != nil {
		return serializer.Response{
			Code:  500,
			Msg:   "查找视频时出错，可能是数据库错误",
			Error: error.Error(),
		}
	}
	return serializer.Response{
		Code: 200,
		Msg:  "查询列表完成",
		Data: serializer.BuildVideos(videos),
	}
}
```

- **serializer**

`BuildVideos`进行了一个for循环，将输入的Video数组，输出成序列化的Json

```go
package serializer

import "singo/model"

//Video 视频序列化器结构体
type Video struct {
	VideoID    int    `json:"video_id"`
	VideoTitle string `json:"video_title"`
	VideoInfo  string `json:"video_info"`
}

//BuildVideo 序列化视频
func BuildVideo(video model.Video) Video {
	return Video{
		VideoID:    video.VideoID,
		VideoTitle: video.VideoTitle,
		VideoInfo:  video.VideoInfo,
	}
}

//BuildVideos 序列化视频列表
func BuildVideos(items []model.Video) (videos []Video) {
	for _, item := range items {
		video := BuildVideo(item)
		videos = append(videos, video)
	}
	return videos
}
```

#### 删

```shell
DELETE localhost:3000/api/video/deleteVideo/7
```

**响应**

```json
{
  "code": 200,
  "msg": "删除成功"
}
```

- **server**

```go
//删除一个视频
videoAPI.DELETE("deleteVideo/:id", api.DeleteVideo)
```

- **api**

注意这里不用shoudbind，否则必须携带json数据

```go
//DeleteVideo 删除一个视频
func DeleteVideo(c *gin.Context) {
	//sercice
	service := service.DeleteVideoService{}
	//结构体为空，不需要接json参数，不用shoudbind
	result := service.Delete(c.Param("id"))
	c.JSON(200, result)
}
```

- **service**

先查询，然后直接将查询到的数据作为参数，执行删除

```go
package service

import (
	"singo/model"
	"singo/serializer"
)

// DeleteVideoService 创建视频的服务结构体（有点像类）
type DeleteVideoService struct {
}

// Delete 创建视频函数
func (service *DeleteVideoService) Delete(id string) serializer.Response {
	var video model.Video
	//先查询该视频是否存在
	error := model.DB.First(&video, id).Error
	//若出错
	if error != nil {
		return serializer.Response{
			Code:  404,
			Msg:   "未找到指定id的视频",
			Error: error.Error(),
		}
	}
	//存在则执行删除
	error = model.DB.Delete(&video).Error
	if error != nil {
		return serializer.Response{
			Code:  500,
			Msg:   "删除失败",
			Error: error.Error(),
		}
	}
	return serializer.Response{
		Code: 200,
		Msg:  "删除成功",
	}
}
```

#### 改

```shell
PUT http://localhost:3000/api/video/updateVideo/4
```

**请求**

```json
{
  "video_id": 4,
  "video_title": "这是新的标题",
  "video_info": "这是新的信息"
}
```

**响应**

```json
{
  "code": 200,
  "data": {
    "video_id": 4,
    "video_title": "这是新的标题",
    "video_info": "这是新的信息"
  },
  "msg": "视频保存成功"
}
```

- **server**

```go
//更改一个视频
videoAPI.PUT("updateVideo/:id", api.UpdateVideo)
```

- **api**

注意，这里既使用了`ShouldBind`绑定，又使用`c.Param("id")`向`service.Update()`传递了`id`的值

```go
//UpdateVideo 更新一个视频
func UpdateVideo(c *gin.Context) {
	//service
	service := service.UpdateVideoService{}
	//绑定
	error := c.ShouldBind(&service)
	if error != nil {
		c.JSON(500, ErrorResponse(error))
	} else {
		result := service.Update(c.Param("id"))
		c.JSON(200, result)
	}
}
```

- **service**

首先是结构体，先使用传递过来的id查询了要修改的`video`信息，然后把`service`在`ShouldBind`获得的信息，传给了`video`，最后保存`video`

```go
package service

import (
	"singo/model"
	"singo/serializer"
)

// UpdateVideoService 创建视频的服务结构体（有点像类）
type UpdateVideoService struct {
	VideoID    int    `form:"video_id" json:"video_id"`
	VideoTitle string `form:"video_title" json:"video_title" binding:"required"`
	VideoInfo  string `form:"video_info" json:"video_info"`
}

// Update 修改更新视频函数
func (service *UpdateVideoService) Update(id string) serializer.Response {
	//绑定参数，模型:service.xx
	video := model.Video{}
	//先查询数据库，找到对应user，把错误返回
	error := model.DB.First(&video, id).Error
	if error != nil {
		return serializer.Response{
			Code: 500,
			Msg:  "数据库中未能找到对应视频",
			//返回错误信息
			Error: error.Error(),
		}
	}

	//修改，把service通过c绑定，接收到的json数据，赋给model
	video.VideoID = service.VideoID
	video.VideoTitle = service.VideoTitle
	video.VideoInfo = service.VideoInfo
	//把video保存到数据库
	error = model.DB.Save(&video).Error
	if error != nil {
		return serializer.Response{
			Code: 500,
			Msg:  "视频保存失败",
			//返回错误信息
			Error: error.Error(),
		}
	}

	return serializer.Response{
		//返回序列化的video，需要调用video的序列化器
		Data: serializer.BuildVideo(video),
		Code: 200,
		Msg:  "视频保存成功",
	}
}
```

是不是觉得这些代码太过简单？当然，因为其实是我写的，233。
