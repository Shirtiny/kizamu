---
title: HttpClient
date: 2019-08-16 11:54:26
tags:
  - httpclient
  - java
categories: 学习经验
---

# 使用HttpClient模拟浏览器访问

HttpClient 是Apache HttpComponents 下的子项目，是支持 HTTP 协议的客户端编程工具包。它被用来发送和接受 HTTP 消息，并不能处理http响应内容。

<!-- more -->

## 依赖

```xml
 <dependency>
            <groupId>org.apache.httpcomponents</groupId>
            <artifactId>httpclient</artifactId>
     		<version>4.5.6</version>
</dependency>
```

## 基本使用

### Get

```java
//httpClient的创建
CloseableHttpClient httpClient = HttpClients.createDefault();
//创建一个GET对象
HttpGet get = new HttpGet("http://shirtiny.cn");
//发送请求，得到一个response对象
CloseableHttpResponse response = httpClient.execute(get);
//取响应实体，转换成字符串打印
HttpEntity entity = response.getEntity();
String string = EntityUtils.toString(entity, "utf-8");
//响应状态码
int statusCode = response.getStatusLine().getStatusCode();
```

当需要传递参数时，可以直接在url改，也可以使用URIBuilder构建url

**参数**

```java
//基础url
URIBuilder uriBuilder = new URIBuilder("https://api.kaaass.net/biliapi/video/resolve");
//加入参数
uriBuilder.addParameter("id","53175612");
uriBuilder.addParameter("quality","80");
//构建出url
URI uri = uriBuilder.build();
//放入get请求对象中即可
HttpGet get=new HttpGet(uri);
//然后执行...
httpClient.execute(get);
```

### POST

与Get类似。当需要提交表格数据时：

```java
//创建一个post对象
HttpPost post = new HttpPost("http://localhost:8082/httpclient/post.html");
//创建一个Entity。模拟一个表单
List<NameValuePair> kvList = new ArrayList<>();
kvList.add(new BasicNameValuePair("username", "zhangsan"));
kvList.add(new BasicNameValuePair("password", "123"));
//包装成一个Entity对象
StringEntity entity = new UrlEncodedFormEntity(kvList, "utf-8");
//设置请求的内容
post.setEntity(entity);
//执行post请求
CloseableHttpResponse response = httpClient.execute(post);
```

## 工具类

一个方便其他服务调用的httpClient的工具类。

```java
package Http_Utils;

import ...

public class HttpClientUtil {

	public static String doGet(String url, Map<String, String> param) {

		// 创建Httpclient对象
		CloseableHttpClient httpclient = HttpClients.createDefault();

		String resultString = "";
		CloseableHttpResponse response = null;
		try {
			// 创建uri
			URIBuilder builder = new URIBuilder(url);
			if (param != null) {
				for (String key : param.keySet()) {
					builder.addParameter(key, param.get(key));
				}
			}
			URI uri = builder.build();

			// 创建http GET请求
			HttpGet httpGet = new HttpGet(uri);

			// 执行请求
			response = httpclient.execute(httpGet);
			// 判断返回状态是否为200
			if (response.getStatusLine().getStatusCode() == 200) {
				resultString = EntityUtils.toString(response.getEntity(), "UTF-8");
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (response != null) {
					response.close();
				}
				httpclient.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return resultString;
	}

	public static String doGet(String url) {
		return doGet(url, null);
	}

	public static String doPost(String url, Map<String, String> param) {
		// 创建Httpclient对象
		CloseableHttpClient httpClient = HttpClients.createDefault();
		CloseableHttpResponse response = null;
		String resultString = "";
		try {
			// 创建Http Post请求
			HttpPost httpPost = new HttpPost(url);
			// 创建参数列表
			if (param != null) {
				List<NameValuePair> paramList = new ArrayList<>();
				for (String key : param.keySet()) {
					paramList.add(new BasicNameValuePair(key, param.get(key)));
				}
				// 模拟表单
				UrlEncodedFormEntity entity = new UrlEncodedFormEntity(paramList);
				httpPost.setEntity(entity);
			}
			// 执行http请求
			response = httpClient.execute(httpPost);
			resultString = EntityUtils.toString(response.getEntity(), "utf-8");
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				response.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}

		return resultString;
	}

	public static String doPost(String url) {
		return doPost(url, null);
	}

	public static String doPostJson(String url, String json) {
		// 创建Httpclient对象
		CloseableHttpClient httpClient = HttpClients.createDefault();
		CloseableHttpResponse response = null;
		String resultString = "";
		try {
			// 创建Http Post请求
			HttpPost httpPost = new HttpPost(url);
			// 创建请求内容
			StringEntity entity = new StringEntity(json, ContentType.APPLICATION_JSON);
			httpPost.setEntity(entity);
			// 执行http请求
			response = httpClient.execute(httpPost);
			resultString = EntityUtils.toString(response.getEntity(), "utf-8");
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				response.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}

		return resultString;
	}
}

```

- [HttpClient详解](https://www.yeetrack.com/?p=779)
- [pdf文档](http://78.141.206.203/file/HttpClient.pdf)
