---
title: Json格式数据转Html表格
date: 2019-08-09 18:23:32
tags:
  - Json
categories: 学习经验
---

# Json数据→包含html语言的字符串

## 输入数据

数据库可以把下面的Json格式的字符串数据存储起来

```json
[
  {
    "group": "主体",
    "params": [
      { "k": "品牌", "v": "1" },
      { "k": "型号", "v": "2" },
      { "k": "颜色", "v": "3" },
      { "k": "上市年份", "v": "4" }
    ]
  },
  {
    "group": "网络",
    "params": [
      { "k": "4G网络制式", "v": "a" },
      { "k": "3G网络制式", "v": "b" },
      { "k": "2G网络制式", "v": "c" }
    ]
  },
  {
    "group": "存储",
    "params": [
      { "k": "机身内存", "v": "de" },
      { "k": "储存卡类型", "v": "ef" }
    ]
  }
]
```

<!-- more -->

## 需要把json转成List

Json到java对象的转换，工具类：

```java
package com.SH.utils;

import java.util.List;

import ...

    /*工具类，用于把json数据转成需要的java对象
    */
public class JsonUtils {

    // 定义jackson对象
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /**
     * 将对象转换成json字符串。
     * <p>Title: pojoToJson</p>
     * <p>Description: </p>
     * @param data
     * @return
     */
    public static String objectToJson(Object data) {
    	try {
			String string = MAPPER.writeValueAsString(data);
			return string;
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
    	return null;
    }

    /**
     * 将json结果集转化为对象
     *
     * @param jsonData json数据
     * @param clazz 对象中的object类型
     * @return
     */
    public static <T> T jsonToPojo(String jsonData, Class<T> beanType) {
        try {
            T t = MAPPER.readValue(jsonData, beanType);
            return t;
        } catch (Exception e) {
        	e.printStackTrace();
        }
        return null;
    }

    /**
     * 将json数据转换成pojo对象list
     * <p>Title: jsonToList</p>
     * <p>Description: </p>
     * @param jsonData
     * @param beanType
     * @return
     */
    public static <T>List<T> jsonToList(String jsonData, Class<T> beanType) {
    	JavaType javaType = MAPPER.getTypeFactory().constructParametricType(List.class, beanType);
    	try {
    		List<T> list = MAPPER.readValue(jsonData, javaType);
    		return list;
		} catch (Exception e) {
			e.printStackTrace();
		}

    	return null;
    }

}

```

## 详细参考

拿到数据库里的Json数据后，对其进行转换，两次遍历，利用map拿到value，然后使用StringBuffer生成html格式的字符串。

```java
@Service
public class SqlJson2JavaString {

	public String json2String(String sqlData) {

		String jsonData = sqlData;
		//生成html
		// 把规格参数json数据转换成java对象
		List<Map> jsonList = JsonUtils.jsonToList(jsonData, Map.class);
		StringBuffer sb = new StringBuffer();
		sb.append("<table cellpadding=\"0\" cellspacing=\"1\" width=\"100%\" border=\"0\" class=\"Ptable\">\n");
		sb.append("    <tbody>\n");
		for(Map m1:jsonList) {
			sb.append("        <tr>\n");
			sb.append("            <th class=\"tdTitle\" colspan=\"2\">"+m1.get("group")+"</th>\n");
			sb.append("        </tr>\n");
			List<Map> list2 = (List<Map>) m1.get("params");
			for(Map m2:list2) {
				sb.append("        <tr>\n");
				sb.append("            <td class=\"tdTitle\">"+m2.get("k")+"</td>\n");
				sb.append("            <td>"+m2.get("v")+"</td>\n");
				sb.append("        </tr>\n");
			}
		}
		sb.append("    </tbody>\n");
		sb.append("</table>");
		return sb.toString();
	}

}

```

这样，数据库存储中，这种<K,V>对形式的表格数据，可以用json数据保存，可以单表操作。

## 输出结果

1. 使用工具类，处理数据库中json格式数据

```java
//将接收到的jsonData，转为map集合
List<Map> jsonList = JsonUtils.jsonToList(jsonData, Map.class);
System.out.println(jsonList);
```

打印转换的结果：

```java
[{group=主体, params=[{k=品牌, v=1}, {k=型号, v=2}, {k=颜色, v=3}, {k=上市年份, v=4}]}, {group=网络, params=[{k=4G网络制式, v=a}, {k=3G网络制式, v=b}, {k=2G网络制式, v=c}]}, {group=存储, params=[{k=机身内存, v=de}, {k=储存卡类型, v=ef}]}]
```

2. 使用StringBuffer和遍历取出需要的数据：

```java
StringBuffer sb = new StringBuffer();
		sb.append("<table cellpadding=\"0\" cellspacing=\"1\" width=\"100%\" border=\"0\" class=\"Ptable\">\n");
		sb.append("    <tbody>\n");
		for(Map m1:jsonList) {
			sb.append("        <tr>\n");
			sb.append("            <th class=\"tdTitle\" colspan=\"2\">"+m1.get("group")+"</th>\n");
			sb.append("        </tr>\n");
			List<Map> list2 = (List<Map>) m1.get("params");
			for(Map m2:list2) {
				sb.append("        <tr>\n");
				sb.append("            <td class=\"tdTitle\">"+m2.get("k")+"</td>\n");
				sb.append("            <td>"+m2.get("v")+"</td>\n");
				sb.append("        </tr>\n");
			}
		}
		sb.append("    </tbody>\n");
		sb.append("</table>");
		return sb.toString();
```

最终结果为：

```html
<table cellpadding="0" cellspacing="1" width="100%" border="0" class="Ptable">
  <tbody>
    <tr>
      <th class="tdTitle" colspan="2">主体</th>
    </tr>
    <tr>
      <td class="tdTitle">品牌</td>
      <td>1</td>
    </tr>
    <tr>
      <td class="tdTitle">型号</td>
      <td>2</td>
    </tr>
    <tr>
      <td class="tdTitle">颜色</td>
      <td>3</td>
    </tr>
    <tr>
      <td class="tdTitle">上市年份</td>
      <td>4</td>
    </tr>
    <tr>
      <th class="tdTitle" colspan="2">网络</th>
    </tr>
    <tr>
      <td class="tdTitle">4G网络制式</td>
      <td>a</td>
    </tr>
    <tr>
      <td class="tdTitle">3G网络制式</td>
      <td>b</td>
    </tr>
    <tr>
      <td class="tdTitle">2G网络制式</td>
      <td>c</td>
    </tr>
    <tr>
      <th class="tdTitle" colspan="2">存储</th>
    </tr>
    <tr>
      <td class="tdTitle">机身内存</td>
      <td>de</td>
    </tr>
    <tr>
      <td class="tdTitle">储存卡类型</td>
      <td>ef</td>
    </tr>
  </tbody>
</table>
```
