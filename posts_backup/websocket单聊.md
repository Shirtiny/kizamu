---
title: webSocket单聊+携带Jwt认证
date: 2019-11-29 10:45:04
tags:
  - webSocket
  - springBoot
  - java
categories: 记录
---

# 社区用户之间的私信功能

这几天查了很多博客、文档，磕磕绊绊的总算完成了用户私信的功能，这份md记录了社区对私信功能的实现,，使用WebSocket与Jwt认证，将包括前端部分`Vue`、后端`springBoot`的代码。

![](https://file.moetu.org/images/2019/12/02/354fecee03be39a51ce66ef3f766da17d881be1a88558834.png)

<!-- more -->

## 具体实现

### 后端webSocket配置类

- 首先设置消息代理

```java
@Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        //允许客户端订阅主题/room
        registry.enableSimpleBroker("/room","/user","/uid");
        //注册 app的前缀/app
        registry.setApplicationDestinationPrefixes("/app");
        //推送用户前缀 不过默认就是/user
        registry.setUserDestinationPrefix("/user");
    }
```

- 重写`webSocket`握手拦截器，主要功能是解析`cookie`中的`jwt`，然后将用户信息存入`webSocketSession`

```java
/**@Bean
     * WebSocket 握手拦截器 从cookie中解析jwt
     */
    private HandshakeInterceptor myHandshakeInterceptor(){
        return new HandshakeInterceptor() {

            @Override
            public boolean beforeHandshake(ServerHttpRequest serverHttpRequest, ServerHttpResponse serverHttpResponse, WebSocketHandler webSocketHandler, Map<String, Object> map) throws Exception {
               ServletServerHttpRequest servletServerHttpRequest = (ServletServerHttpRequest) serverHttpRequest;
                Cookie[] cookies = servletServerHttpRequest.getServletRequest().getCookies();
                if(cookies==null || cookies.length==0) {
                    return false;
                }
                UserDTO userDTO=null;
                //从cookie中解析jwt
                for (Cookie cookie : cookies){
                    if ("shJwt".equals(cookie.getName())){
                        userDTO = jwtService.parseJwtToUser(cookie.getValue());
                        if (userDTO!=null){
                            //这里的map里的值会交给websocketSession Message对象里header里会有session的值
                            map.put("user",userDTO);
                        }
                    }
                }
//                return userDTO!=null;
                //不管怎么样都握手完成 交给handler处理无效用户
               return true;
            }

            @Override
            public void afterHandshake(ServerHttpRequest serverHttpRequest, ServerHttpResponse serverHttpResponse, WebSocketHandler webSocketHandler, Exception e) {
                System.out.println("握手成功");
            }
        };
    }
```

- 配置服务端连接点，添加握手拦截器

```java
//注册STOMP协议节点并映射url
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //添加服务端接口 终端点 js连接: let socket=new SockJS('/websocket');
        registry.addEndpoint("/websocket")
                .setAllowedOrigins("*")
                //握手拦截器
                .addInterceptors(myHandshakeInterceptor())
                .withSockJS();
    }
```

- 配置WebSocket传输器，主要目的是注册`DecoratorFactory`装饰工厂，重写处理器`WebSocketHandler`中的方法。

```java
@Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.addDecoratorFactory(webSocketHandler -> new WebSocketHandlerDecorator(webSocketHandler){
            @Override
            public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                super.afterConnectionEstablished(session);
            }

            @Override
            public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
                Object user = session.getAttributes().get("user");
                System.out.println(user+"\n正在发送一条消息："+message.getPayload());
                /*用户离线问题
                可以把经过的带有system标记信息存入数据库或缓存
                handler检查客户端传来的ack，根据ack来删除数据库或缓存中的消息
                当用户上线时，把对应的消息发给用户，同样携带系统标记，传来ack则删除对应信息
                */
                if (user==null){
                    //不是有效的用户登录，就关闭session
                    System.out.println("用户无效 ，关闭session");
                    session.close();
                }else {
//                    session.sendMessage(new TextMessage("用户有效"));
                    super.handleMessage(session, message);
                }
            }

            @Override
            public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
                session.sendMessage(new  TextMessage("出错了"));
                session.sendMessage(new  TextMessage(exception.getMessage()));
                super.handleTransportError(session,exception);
            }

            @Override
            public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
                super.afterConnectionClosed(session,closeStatus);
            }
        });
    }
```

- 配置类总体概况

```java
package cn.shirtiny.community.SHcommunity.Config;

import ....

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private IjwtService jwtService;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) { ... }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) { ... }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry){ ... }

    private HandshakeInterceptor myHandshakeInterceptor(){ ... }
}

```

### 数据库表模型

`消息历史记录`

```java
package cn.shirtiny.community.SHcommunity.Model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

//聊天记录、频道
@Data
@TableName("chat_history")
public class ChatHistory {
    //主键
    @TableId(value = "chat_history_id")
    private String chatHistoryId;
    //聊天记录的名称，唯一
    @TableField(value = "chat_history_name",insertStrategy = FieldStrategy.NOT_EMPTY)
    private String chatHistoryName;
    //聊天创建时间
    @TableField(value = "gmt_created",insertStrategy = FieldStrategy.NOT_NULL)
    private Long gmtCreated;
    //更新时间
    @TableField(value = "gmt_modified",insertStrategy = FieldStrategy.NOT_NULL)
    private Long gmtModified;
    //消息条数
    @TableField(value = "message_num",insertStrategy = FieldStrategy.DEFAULT)
    private Long messageNum;
    //发送者id
    @TableField(value = "sender_id")
    private Long senderId;
    //接收者id
    @TableField(value = "recipient_id")
    private Long recipientId;
    //频道
    @TableField(value = "channel")
    private String channel;
}
```

`单个消息`

```java
package cn.shirtiny.community.SHcommunity.Model;

import cn.shirtiny.community.SHcommunity.DTO.UserDTO;
import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

//聊天消息
@Data
@TableName("chat_message")
public class ChatMessage {
    //主键
    @TableId(value = "chat_message_id",type = IdType.AUTO)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long chatMessageId;
    //记录此消息的 聊天记录的id
    @TableField(value = "chat_history_id",insertStrategy = FieldStrategy.NOT_NULL)
    private String chatHistoryId;
    //消息内容
    @TableField(value = "chat_message_content",insertStrategy = FieldStrategy.NOT_EMPTY)
    private String chatMessageContent;
    //创建时间
    @TableField(value = "gmt_created",insertStrategy = FieldStrategy.NOT_NULL)
    private Long gmtCreated;
    //发送者id，可以为空
    @TableField(value = "sender_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long senderId;
    //接收者id，可以为空
    @TableField(value = "recipient_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long recipientId;

    //发送者
    @TableField(exist = false)
    private UserDTO sender;
    //接收者
    @TableField(exist = false)
    private UserDTO recipient;
    //标识为系统通知
    @TableField(exist = false)
    private boolean system;
}
```

### 后端控制器和服务层

- `/sendToUser`处理用户之间的消息传输，并记录和存储

```java
//一对一聊天 message需要携带消息内容、接收者的id
    @MessageMapping("/sendToUser")
    public void sendToUser(Message message) {
        //接收发送来的消息 然后转为消息对象
        ChatMessage chatMessage = chatMessageService.parseMessageToChatMessage(message);
        //将消息存入数据库
        boolean isMessageAdded = chatMessageService.addChatMessage(chatMessage);
        //创建历史记录 已存在则不会创建
        chatHistoryService.addOneChatHistoryBy2Id(chatMessage.getSender().getUserId(), chatMessage.getRecipientId());
        //消息数自增 发送消息 只有消息入库成功才会发送
        if (isMessageAdded){
            chatHistoryService.incrMessageNum(chatMessage.getChatHistoryId());
            //发送消息 会在频道路径前加上/user/'historyId' 比如此频道会被拼接为/user/historyId/121chat
            messagingTemplate.convertAndSendToUser(chatMessage.getChatHistoryId(), "/121chat", chatMessage);
        }
    }
```

其中，`chatMessageService`的`parseMessageToChatMessage()`内容为：

```java
@Override
    public ChatMessage parseMessageToChatMessage(Message message) {
        String payload = new String((byte[]) message.getPayload());
        ChatMessage chatMessage = JSONObject.parseObject(payload, ChatMessage.class);
        //取出消息头中session里的当前用户
        MessageHeaders headers = message.getHeaders();
        Map sessionAttributes = (Map) headers.get("simpSessionAttributes");
        //断言
        assert sessionAttributes != null;
        //从websocketSession取出发送者
        UserDTO sender = (UserDTO)sessionAttributes.get("user");
        chatMessage.setSender(sender);
        chatMessage.setSenderId(sender.getUserId());
        //根据双方id得出历史记录id
        String historyId = chatHistoryService.createHistoryId(sender.getUserId(), chatMessage.getRecipientId());
        chatMessage.setChatHistoryId(historyId);
        return chatMessage;
    }
```

`createHistoryId()`方法，生成该消息的消息记录Id，内容为：

```java
@Override
    public String createHistoryId(Long senderId, Long recipientId) {
        if (senderId == null || recipientId == null) {
            return '';
        }
        long min = Math.min(senderId, recipientId);
        long max = Math.max(senderId, recipientId);
        return min + "_" + max;;
    }
```

> 这样由两个用户的id，可以唯一确定一条消息记录。

- `/allHistoryMessage`查询某个用户的所有消息记录

```java
//查询某个用户的全部消息记录及其内容
    @GetMapping("/shApi/allHistoryMessage")
    @ResponseBody
    public ShResultDTO<String, Object> retAllHistoryMessage(Long userId){
        List<ChatHistoryDTO> chatHistoryDTOS = chatHistoryService.selectAllHistoryMessageByUid(userId);
        if (userId==null){
            return new ShResultDTO<>(400,"参数不合法");
        }
        Map<String,Object> data =new HashMap<>();
        data.put("chatHistories",chatHistoryDTOS);
        return new ShResultDTO<>(200,"已返回该用户所有的历史记录及其内容",data,null);
    }
```

返回结果如：

![](https://file.moetu.org/images/2019/11/29/7b4eff897383ac91ff52b93aee9961b9c62f72d428ecdf6a.png)

其中`selectAllHistoryMessageByUid()`方法处理两个用户之前的相对关系：

```java
//查询某个用户的全部消息记录及其内容 并设置targetUser的值
    @Override
    public List<ChatHistoryDTO> selectAllHistoryMessageByUid(Long userId) {
        List<ChatHistoryDTO> chatHistories = chatHistoryMapper.selectAllChatHistoryByUid(userId);
        List<ChatHistoryDTO> tempList = new ArrayList<>();
        for (ChatHistoryDTO chatHistory : chatHistories){
            long senderId = chatHistory.getSenderId();
            long recipientId = chatHistory.getRecipientId();
            UserDTO targetUser=null;
            if (userId == senderId){
                targetUser = userMapper.selectUserDtoByid(recipientId);
            }else {
                targetUser = userMapper.selectUserDtoByid(senderId);
            }
            chatHistory.setTargetUser(targetUser);
            tempList.add(chatHistory);
        }
        return tempList;
    }
```

涉及到的`mapper`的`selectAllChatHistoryByUid()`方法为：

```java
    //查询出单个用户的所有聊天记录 及其全部消息
    @Select("select * from chat_history where sender_id = #{userId} or recipient_id = #{userId}")
    @Results({
            @Result(column = "chat_history_id",property = "chatHistoryId",id = true),
            @Result(column = "chat_history_id", property = "chatMessages",javaType = List.class ,many = @Many(select = "cn.shirtiny.community.SHcommunity.Mapper.ChatMessageMapper.selectAllDTOByhistoryId"))
    })
    List<ChatHistoryDTO> selectAllChatHistoryByUid(@Param("userId") Long userId);
```

### 前端Vue、Element

- 数据对象

```java
data: {
            //外层激活的tab的name
            outTabsDefActive: 'userMessage',
            //激活的tab的name
            innerTabsDefActive: '',
            //内层tabs 历史消息数组 每个tab的name是targetUser.userId
            innerTabs: [],
            //待发送的消息
            unSendChatMessage: '',
            //本地简单用户 发送消息不依赖它
            user: {},
            //客户端对象
            subscribedObj: null,
            //标识收到了新的消息
            receiveNewMessage: 0,
            //标识已与服务器socket建立连接
            isConnected: false
        },
```

- 两个计算属性

```js
computed: {
            //接收者Id 即为当前激活的tab的name
            recipientId: function () {
                return this.innerTabsDefActive;
            },
            //当前客户端的id 需要指定，否则会新建客户端，重复订阅
            subId: function () {
                return  this.user.userId;
            },
        },
```

- 主要方法

从`url`中获取要建立通信的用户id：

> 比如url : http://localhost:8881/messageCenter?uid=117603681930663529

```js
//从url获取用户id 然后返回url里的用户id
            getUidFormUrl() {
                let url = window.location.href;
                //正则表达式匹配
                let array = url.match(`uid=([0-9]+)`);
                if (array != null) {
                    //取得要查询的id
                    return array[1];
                } else {
                    return null;
                }
            },
```

**连接socket**

```js
//以jwt为认证标准,连接服务器
            connectSocket() {
                let socket = new SockJS('/websocket');
                stompClient = Stomp.over(socket);
                //关闭控制台输出
                // stompClient.debug=null;
                //连接socket
                stompClient.connect({'head': '这是head'},
                    (frame) => {
                        console.log("连接socket: /websocket");
                        console.log(frame);
                        this.isConnected = true;
                        //订阅新加入的频道
                        this.subscribe();
                    }, (err) => {
                        console.log("socket连接失败", err);
                        console.log("可能是用户过期，请重新登录");
                        this.isConnected = false;
                        this.$message('无效用户,请检查登录是否过期');
                    });
            },
```

**订阅频道**

```js
//以当前js登录的用户，与当前激活的tabName为准，订阅频道
            subscribe() {
                //订阅单用户系统通知频道
                let subscribedObj = stompClient.subscribe('/uid/' + this.user.userId, this.onGetMessage, {
                    id: this.subId,
                    ack: this.user.userId
                });
            },
```

**订阅回调函数，处理message**

```js
/订阅消息的回调函数
            onGetMessage(message) {
                let chatMessage = JSON.parse(message.body);
                console.log("", chatMessage.system);
                //如果是系统通知
                if (chatMessage.system){
                    console.log("系统通知", chatMessage);
                    //存储订阅频道发过来的数据
                    let sender = chatMessage.sender;
                    //标识当前对象与历史是否有重复
                    let isExist = false;
                    //从已有的消息列表中寻找与当前uid重复的tab
                    for (let i = 0; i < this.innerTabs.length; i++) {
                        //如果在数组找到重复的id
                        if (this.innerTabs[i].targetUser.userId === sender.userId) {
                            //改变标识
                            isExist = true;
                        }
                    }
                    //如果不存在 并且发信人不是自己
                    if (!isExist && sender.userId !== this.user.userId) {
                        //构建一个临时的消息历史记录 存放targetUser
                        let chatHistory = {
                            chatHistoryId: chatMessage.chatHistoryId,
                            targetUser: sender,
                            chatMessages: []
                        };
                        //加入tab 不改变激活的tab
                        this.addTab(chatHistory,false);
                        //加入对应的消息列表
                        this.putNewMessage(chatMessage);
                    }
                    //最后通知服务器 我已经接收了消息
                    message.ack();
                }else {
                    //直接加入对应的消息列表
                   this.putNewMessage(chatMessage);
                }
            },
```

**发送消息**

```js
sendMessage: function () {
                console.log("发送消息：");
                stompClient.send("/app/sendToUser", {}, JSON.stringify({
                        'chatMessageContent': this.unSendChatMessage,
                        'recipientId': this.recipientId,
                    })
                );
   				 //清空输入框
                this.unsendChatMessage='';
```

**从通信列表中移除用户**

```js
//移除tab
            removeTab(userId) {
                //移除
                console.log("移除", userId);
                for (let i = 0; i < this.innerTabs.length; i++) {
                    if (this.innerTabs[i].targetUser.userId === userId) {
                        //删除
                        this.innerTabs.splice(i, 1);
                        //改变默认激活的tab
                        if (i + 1 < this.innerTabs.length) {
                            setTimeout(() => {
                                this.innerTabsDefActive = this.innerTabs[i + 1].targetUser.userId;
                            }, 20);
                        }
                        if (i - 1 >= 0) {
                            setTimeout(() => {
                                this.innerTabsDefActive = this.innerTabs[i - 1].targetUser.userId;
                            }, 20);
                        }
                        //换背景图 依照数组的情况换背景 由watch来监控，这里不需要了
                        // this.changeBackImg();
                        break;
                    }
                }
            },
```

更多内容...，可以在我[Github](https://github.com/Shirtiny)上查看源码。

- mounted()

```java
mounted() {
            //绘制canvas
            this.canvasStart();
        },
```

- watch监控

```js
 watch: {
            receiveNewMessage: {
                handler(newName, oldName) {
                    //dom更新之后执行
                    this.$nextTick(() => {
                        console.log("dom更新了 , 移动滚条到底部");
                        //移动滚条到底部 把class为shMessageHistoryBox的dom节点都做一次滚动条移动 因为切换tab会切换dom节点
                        let historyBoxArray = document.getElementsByClassName("shMessageHistoryBox");
                        for (let historyBox of historyBoxArray) {
                            let scrollTop = historyBox.scrollTop;
                            let scrollHeight = historyBox.scrollHeight;
                            let clientHeight = historyBox.clientHeight;
                            console.log("scrollHeight:", scrollHeight, ";scrollTop:", scrollTop, ";clientHeight:", clientHeight, ";scrollHeight - scrollTop - clientHeight:", scrollHeight - scrollTop - clientHeight);
                            //开始移动
                            historyBox.scrollTop = historyBox.scrollTop + (scrollHeight - scrollTop - clientHeight);
                        }
                    });
                    console.log("receiveNewMessage改变了", oldName, newName);
                }
            }
```

- 结构

![](https://file.moetu.org/images/2019/11/29/93c1d2ef78f83af432fed01e1fe7dc88da4a0334efd6a20c.png)

- 主要css

```html
/*注意下面三个div的 overflow:hidden 的作用是清除浮动 让外层div自适应内层div高度*/
/*最小高度，=盒子里的内容高度+上下padding*/ .shMessageBox { min-height: 66px; padding: 0 16px 16px;
margin: 0; position: relative; line-height: 12px; font-size: 12px; overflow: hidden } .shMessage {
margin: 0; overflow: hidden; padding: 0 10px; max-width: 480px; display: block; } .shMessageContent
{ margin: 0; /*padding: 8px 16px 8px 20px;*/ line-height: 1.5; font-size: 14px; padding: 8px 16px;
word-wrap: break-word; word-break: break-word; box-sizing: border-box; z-index: 1; border-radius: 0
16px 16px 16px; background: #fff; overflow: hidden; } /* 改变tab自定标签的高度 3个height要一致*/
.shELInnerTab .el-tabs__item { height: 60px !important; } .shELInnerTab .el-tabs__active-bar {
height: 60px !important; } .shELInnerTab .shELInnerTabDiv { height: 60px !important; width: 150px
!important; padding: 5px 5px 5px 5px; } /* 消息记录的盒子 带有滚动条*/ .shMessageHistoryBox {
overflow-x: hidden; overflow-y: scroll; height: 350px; background-color: #f4f5f7;; padding: 15px
10px; margin: 5px 5px }
```

## 离线状态处理

- 消息的收信人离线时，无法及时收到消息，所以消息模型需要增加一个字段，来标识已读状态。

```java
package cn.shirtiny.community.SHcommunity.Model;

import ....

//聊天消息
@Data
@TableName("chat_message")
public class ChatMessage {
    //主键
    @TableId(value = "chat_message_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long chatMessageId;
    //记录此消息的 聊天记录的id
    @TableField(value = "chat_history_id", insertStrategy = FieldStrategy.NOT_NULL)
    private String chatHistoryId;
    //消息内容
    @TableField(value = "chat_message_content", insertStrategy = FieldStrategy.NOT_EMPTY)
    private String chatMessageContent;
    //创建时间
    @TableField(value = "gmt_created", insertStrategy = FieldStrategy.NOT_NULL)
    private Long gmtCreated;
    //发送者id，可以为空
    @TableField(value = "sender_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long senderId;
    //接收者id，可以为空
    @TableField(value = "recipient_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long recipientId;
    //标识是否已读，不为空 默认false
    @TableField(value = "readed")
    private boolean readed;
    //标识为系统通知
    @TableField(value = "systems")
    private boolean systems;

    //发送者
    @TableField(exist = false)
    private UserDTO sender;
    //接收者
    @TableField(exist = false)
    private UserDTO recipient;
}
```

- 当客户端收到消息时，需要`message.ack()`来通知服务端它已经接收了消息

```js
//订阅回调函数
onGetMessage(message) {
	//通知服务器 我已经接收了消息 让服务器把消息改成已读
	message.ack({chatMessageId: chatMessage.chatMessageId});
}
//订阅
stompClient.subscribe('/user/' + subscribeChannel + '/121chat', this.onGetMessage, {
id: this.subId
});
```

> 通过ack的自定义header传递消息对象或消息id，以传达给服务器具体消息对象的信息。

- 当服务器通过`webSocketHandler`在收到客户端回应的ack时，改变对应消息的已读状态。如果没有收到ack，则该消息保持默认的未读状态。我这里不管是否收到ack，消息都入库存储。若需求较大，也可以针对未读消息引入缓存或消息队列。

```java
@Override
            public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
                //检查客户端传来的ack，根据ack来改变数据库中的已读标识
                String payload = (String)message.getPayload();
                //如果stomp帧是ACK,载荷字符串以ACK开头
                boolean isACK = payload.startsWith("ACK");
                if (isACK){
                    System.out.println("这是ack");
                    Matcher matcher = chatMessageIdReg.matcher(payload);
                    while (matcher.find()){
                        String chatMessageId = matcher.group(1);
                        //更新消息为已读状态
                        chatMessageService.updateMessageRead(chatMessageId,true);
                    }
                }
            }
```

- 用户上线时，在导航条提示用户未读消息的计数，引导其前往消息中心

![](https://file.moetu.org/images/2019/12/05/5849f3aafcaf6fe93c1686058245e5e3460bc51f3d70093c.png)

在消息中心可以直接显示全部消息，也可以选择将消息重新发送到相应频道。最后更新用户点击过的聊天记录消息的已读状态。

```js
//更新对应tab的消息记录的消息为已读状态
            updateHistoryRead() {
                if (this.innerTabs.length !== 0 && this.recipientId != null && Number(this.recipientId) !== 0 && this.user != null && this.isConnected) {
                    for (let i = 0; i < this.innerTabs.length; i++) {
                        if (this.innerTabs[i].targetUser.userId === this.recipientId) {
                            //如果消息记录的最后一条消息的收信人是本地用户 更新该消息记录的已读状态
                            let lastIndex = this.innerTabs[i].chatMessages.length - 1;
                            if (lastIndex >= 0 && this.user.userId === this.innerTabs[i].chatMessages[lastIndex].recipientId) {
                                axios.get('/shApi/updateChatHistoryRead?chatHistoryId=' + this.innerTabs[i].chatHistoryId).then(res => {
                                    console.log(this.innerTabs[i].chatHistoryId, "更新为已读");
                                });
                            }
                        }
                    }
                }
            },
```

```js
        watch: {
            recipientId: {
                handler(newName, oldName) {
                    //订阅
                    if (this.recipientId != null && this.user != null && this.isConnected) {
                        this.subscribe();
                    }
                    //更新对应消息历史记录的消息为已读状态
                    this.updateHistoryRead();
                }
            },
        }
```
