---
title: Sftp文件上传、下载
date: 2019-08-05 17:22:51
tags:
  - ftp
  - 上传下载
categories: 学习经验
---

# Sftp协议下文件上传、下载

## 使用JSch进行Sftp连接

**问题产生**

我用common-net，ftp连接时使用21端口会超时，后来发现使用Xftp工具用21端口也超时

<!-- more -->

```java
Connection timed out: connect
```

查了下百度，[端口问题](https://zhidao.baidu.com/question/251945042.html)。

- ftp服务用的是20、21端口，客户端添加ftp信息的时候输入的是21端口

- ssh服务用的是22端口，应用于远程ssh管理Linux服务器；

然后我换了22端口进行尝试。

```java
 Could not parse response code.
Server Reply: SSH-2.0-OpenSSH_7.4
```

异常如上，百度了下，于是开始用sftp协议尝试。

参考文章：[主要参考](https://www.ktanx.com/blog/p/4028)，[详细参考](https://blog.csdn.net/LNView/article/details/72412606)

**问题解决**

我制作了一个工具类，以供调用。

**maven依赖**

```xml
<dependency>
        <groupId>com.jcraft</groupId>
        <artifactId>jsch</artifactId>
</dependency>
<dependency>
        <groupId>com.jcraft</groupId>
        <artifactId>jzlib</artifactId>
 </dependency>
```

还有一些依赖，如springMVC的依赖。

**简单上传**

遇到了很多的问题，像如何简化、如何创建目录、如何检查目录是否存在、认证问题等，在注释里写得很详细。

```java
package IO_Utils;

import com.jcraft.jsch.*;
import java.io.*;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Properties;
import java.util.Vector;

/*
* 我的sftp上传工具
* */

public class ImageSftp {

    /**方法内属性说明
    *
    private static ChannelSftp Sftp = null;

    //用户名(由外部传参)

    private static String ImgServerUsername = "root";
    //主机ip(由外部传参)
    private static String ImgServerIp =  "78.141.206.203";
    //密码(由外部传参)
    private static String ImgServerPassword = "123456";
    //端口号(由外部传参)
    private static int ImgServerPort = 22;
    //上传到的服务器目录(由外部传参)
    private static String ImgServerDirectory = "/data/images/";

    //上传到服务器的文件命名为(由外部传参)
    private static String ImgServerFileName="";

    //要上传的本地文件
//    private static File clientFile=null;

    //下载到本地的目录（由外部传参）
    private static String ClientDirectory = "D:\\aria2\\";



    //下载到本地的文件命名为（由外部传参）
    private static String ClientFileName ="";
*/
    private Channel channel=null;
    private Session sshSession=null;
	private ChannelSftp  sftp =null;

/*
* 获取连接对象的方法
* */
    public  ChannelSftp getConnect(String imgServerIp, int imgServerPort,String imgServerUsername,String imgServerPassword)  {


        JSch jsch = new JSch();
        try {


        //用户名、ip、端口号
       sshSession = jsch.getSession(imgServerUsername,imgServerIp, imgServerPort);

        //配置属性
            Properties config = new Properties();
            config.put("StrictHostKeyChecking","no");
            config.put("PreferredAuthentications","password");
            sshSession.setConfig(config);
            //不检查主机严格密钥
//            sshSession.setConfig("StrictHostKeyChecking", "no");
            //关闭gssapi认证，只使用密码认证，减少耗时 //config.put("userauth.gssapi-with-mic", "no");
//            sshSession.setConfig("PreferredAuthentications","password");

            //给密码设值
        sshSession.setPassword(imgServerPassword);
        //设置多少毫秒超时（设了会报错）
//        sshSession.connect(600);
//          sshSession.setServerAliveInterval(92000);// 请求时长

        System.out.println("正在与服务器建立连接");
        //开启sshSession链接
//        sshSession.connect();
        sshSession.connect(5000);


            //获取sftp通道
            channel = sshSession.openChannel("sftp");
            channel.connect();
            ChannelSftp  sftp = (ChannelSftp) channel;
            System.out.println("已成功建立连接");
            return sftp;
        }catch (JSchException e){
            e.printStackTrace();
            System.out.println("建立连接失败");
            return null;
        }
    }


    /**
    * 上传方法
     * @param sftp 通过getConnect()方法获得的链接对象
     * @param inputStream 要上传文件的输入流
    * //@param serverDirectory 某类文件存放的目录，必须指明为根目录某处，如：/data/video/，斜杠必须带
     * @param finalServerDirectory 上传文件最终所在的目录，=serverDirectory/nextDirectory
    * @param serverFileName 为上传到服务器后的文件名
    *  */

    public  boolean upload(ChannelSftp sftp,InputStream inputStream ,String finalServerDirectory,String serverFileName) throws IOException,  SftpException {
        //连接服务器
//        ChannelSftp sftp = getConnect();

        if (sftp!=null) {


            //进入要存储的服务器目录
//            sftp.cd(serverDirectory);

            SftpATTRS stat=null;
            //判断文件夹是不是存在，这里要捕获异常，不然会卡住
            try {


             stat = sftp.stat(finalServerDirectory);
            System.out.println("找到了目标文件（夹）："+stat+"\n\n\n");

            }catch (Exception e){
                System.out.println("找不到目标目录");
            }

            if (stat!=null){//stat有返回值，说明文件夹存在
                //进入该文件夹
                sftp.cd(finalServerDirectory);
                System.out.println("进入文件夹");
            }else {
                //创建文件夹，然后进入
                sftp.mkdir(finalServerDirectory);
                sftp.cd(finalServerDirectory);

                System.out.println("自动创建"+finalServerDirectory+"文件夹，并进入");
            }


            //本地文件，存到流，不需要，因为前台会直接收到MultipartFile类型的文件，并且能获得流
//            File clientFile = new File(filePath);
//            InputStream fileInputStream = new FileInputStream(clientFile);

            //上传到服务器后的名字，由外部传参
//        serverFileName="1.avi";

            System.out.println("上传ing");
			//获取文件大小（字节）
            long size = inputStream.available();
            //执行上传（断点续传方式）
            sftp.put(inputStream, serverFileName,new SftpMonitor(size),ChannelSftp.RESUME);

            System.out.println("上传完毕");


//交给单独方法去断开连接
//            System.out.println("关闭连接");
            //断开连接
//            sftp.disconnect();
//
//            System.out.println("连接是否已关闭"+sftp.isClosed());

            return true;

        }else {
            return false;
        }
    }


    /**
     * 关闭连接
    * */

    public void close() throws Exception{
        if (sftp!=null){
            sftp.quit();
        }
        if (channel!=null){
            channel.disconnect();
            System.out.println("已关闭通道");
        }
        if (sshSession!=null){
            sshSession.disconnect();
            System.out.println("已关闭连接");
        }

    }

    /*
    * 下载方法
    *   未写，因为暂时用不到
    * 暂定
    * */

//    public static String download() throws JSchException, SftpException, FileNotFoundException {
//        ChannelSftp sftp = getConnect();
//
//        clientFileName="123.png";
//        File clientFile=new File(clientDirectory+clientFileName);
//        serverDirectory="/data/images/";
//        serverFileName="123.png";
//        sftp.get(serverDirectory+serverFileName, new FileOutputStream(clientFile));
//        return clientDirectory+clientFileName;
//
//    }



    //测试

    public static void main(String[] args) throws Exception {

        String imgServerIp="78.141.206.203";
        int imgServerPort=22;
        String imgServerUsername="root";
        String imgServerPWD="123456";

        ImageSftp imageSftp=new ImageSftp();

        ChannelSftp connect = imageSftp.getConnect(imgServerIp, imgServerPort, imgServerUsername, imgServerPWD);

//        String filePath="C:\\Users\\Shirtiny\\Downloads\\masu.jpg";//要上传的文件的路径//现在是你直接给我个输入流

        //获取输入流
        String filePath="D:\\MY文档\\音乐\\折戸伸治 - 潮鳴り.mp3";
        File file=new File(filePath);
//        long fileSize = file.length();
//        System.out.println("文件大小"+fileSize);
        FileInputStream fileInputStream = new FileInputStream(file);

        String finalServerDirectory="/data/music";//上传到的服务器目录,调用上传方法时，若找不到该目录，则程序自动创建。代表文件最终存放的目录
        String serverFileName="潮鸣.mp3";//上传到服务器的文件命名为
//        Vector ls = connect.ls(finalServerDirectory);
//        connect.put("D:\\MY文档\\音乐\\折戸伸治 - 潮鳴り.mp3","123.mp3",new SftpMonitor(),ChannelSftp.OVERWRITE);

        boolean flag = imageSftp.upload(connect, fileInputStream, finalServerDirectory, serverFileName);

        System.out.println("是否完成："+flag);
        //关闭连接
        connect.quit();
        imageSftp.close();


    }

}

```

下载方法未写

[下载时拒绝访问的问题](https://blog.csdn.net/xujingcheng123/article/details/78997819/)

## 实例

我现在需要将一个文件（图片为例）上传到服务器，使用sftp协议，需求如下：

- 点击上传按钮，选择文件后即可上传
- 能看到上传的进度和速度
- 能在上传成功、异常结束时得到反馈
- 要求在上传后，程序自动显示该图片
- 图片需要按照一定分类去存储，以方便管理，减少资源消耗
- 图片名称不能重复，并且图片能正确显示
- 全程支持中文
- 支持断点续传

### 首先，进度监控、断点续传

很显然我们目前的这个工具类还不能满足我们的需求，它还需要两个功能：

1.实时监控，这样我们才能知道上传的速度、进度

2.断点续传，值得高兴的是，Jsch为我们提供了这个功能。

#### 1. 实时监控

**SftpProgressMonitor**

Jsch提供了一个SftpProgressMonitor接口，包括了初始化时执行的`init()`方法、每传输一个数据块就会执行一次的`count()`方法、以及在传输结束时执行的`end()`方法。

基于这个接口，我们可以写出一个简单监控类：

```java
package IO_Utils;

import com.jcraft.jsch.SftpProgressMonitor;

/**
 * 上传进程监控
 * */

public class SftpMonitor implements SftpProgressMonitor {

    private long counted;//初始字节数，已经上传的字节数
    private long fileSize;//最终文件大小
    private long percent;//进度百分比值


    public SftpMonitor() {
    }

    public SftpMonitor(long fileSize) {
        this.fileSize = fileSize;
    }

    @Override
    public void init(int op, String src, String dest, long errfileSize) {


        System.out.println("初始化完成"+"文件大小为："+fileSize);
    }

    @Override
    public boolean count(long count) {

//        System.out.println("之前已上传"+counted+"("+percent+"%)");
        counted +=count;
//        if (percent>=this.count/fileSize){
//            return  true;
//        }
        percent= counted*100/fileSize;
        System.out.println("进度-----已传输："+counted/1024+" kb/"+fileSize/1024+" kb"+"("+percent+"%)");

        return true;
    }

    @Override
    public void end() {
        System.out.println("end结束");
    }
}

```

它的使用方式：

```java
long size = inputStream.available();//通过流获取文件大小
            //执行上传
            sftp.put(inputStream, serverFileName,new SftpMonitor(size);//在执行put方法时初始化一个监控类
```

很抱歉，由于时间关系，我不能像以往那样详细说明，Jsch：[put方法的重载](https://www.cnblogs.com/longyg/archive/2012/06/25/2556576.html)。

**SftpProgressMonitor+TimerTask+Pojo**

我们需要获得传输的速度，所以需要有个**Timer**来帮忙，对此不了解的可查看[Timer的使用](https://blog.csdn.net/ecjtuxuan/article/details/2093757).

我们可以通过重写TimerTask类的`run()`方法，来实现我们需要的功能。我写了一个`start()`方法用于创建timer对象，新建计划任务，`stop()`方法用于终止计时。`run()`方法会按照我们设置的计划，每隔一段时间执行一次，用单独的线程来执行。

我把需要的信息封装到一个pojo类里，你也可以不封装。

**由此**便有了一个新的监控类：

```jaav
package Sftp_service;

import com.jcraft.jsch.SftpProgressMonitor;
import org.springframework.beans.factory.annotation.Autowired;


import java.text.DecimalFormat;
import java.util.Timer;
import java.util.TimerTask;

public class mySftpTimerMonitor extends TimerTask implements SftpProgressMonitor {




    private  long fileSize;//文件总大小
    private  long counted;//已传输数据，单位字节
    private  long counted_Before=0;//上一秒的已传输数据，单位字节
    private long i_ed=0;//已计时间，单位s
    private Timer timer;//计时器对象
    private long timeInterval=2*1000;//时间间隔，单位ms
    private boolean timerIsStarted;//是否已经开始计时
    private DecimalFormat format = new DecimalFormat( "#.##");//用于转换数据显示格式


    private SftpSpeedInfo speedInfo=new SftpSpeedInfo();

    public mySftpTimerMonitor() {
    }



    mySftpTimerMonitor(long fileSize) {
        this.fileSize = fileSize;
    }

    @Override//监视器方法重写
    public boolean count(long count) {//每传输一次数据块，就会执行一次count方法
        if (!timerIsStarted){//只在无计时器时，开启计时器
            timerStart();//开始计时
        }

        incrementCounted(count);//执行自增

        return true;
    }


    //Timertask run
    @Override//计时器方法重写
    public void run() {//计时器控制的方法，每多少时间执行一次，用单独的线程执行。前提是启动计时器
        /*
         *i++;
         *System.out.println(counted+"已用时间"+this.i+"s");
         *可以这样。不过可能是考虑到多线程的原因应该这样做：
         * */
        //这样取值更好，其他线程需要等待这个线程取完值，才能去取值
        long i1 =getI_ed();//这样就有个新问题，如何使i自增，直接在run内i++是不行的，因为getI()的值没有变
        long i2 = incrementI_ed(i1);//新建个方法，用来使秒数自增一次，自憎后的值为i2
        long counted_latest=getCounted();//同理拿到当前的，已传输数据量counted的值
        long counted_before = getCounted_Before();//拿到上一次的已传数据量
        setCounted_Before(counted_latest);//把这次的已传数据量存起来
        double speed=(double)(counted_latest-counted_before)/(1024*(timeInterval/1000));//计算传输速度，单位kb/s，speed=当前已传输量-上次的已传输量/(1024*时间间隔/1000)
        double percent=(double)counted_latest/(double)fileSize;

        speedInfo.setPercent(format.format(percent*100)+"%");//百分比
        speedInfo.setSpeed(format.format(speed)+"kb/s");//速度
        speedInfo.setCounted(format.format((double)counted/1024)+"kb");//已传输量

        speedInfo.setTimed(i2);//用时 s
        System.out.println(speedInfo);

    }



    private void timerStart(){//自定义的计时器方法，启动计时器
        if (timer!=null){
            timer.cancel();//终止此计时器，丢弃所有当前已安排的任务。
            timer.purge();//从此计时器的任务队列中移除所有已取消的任务。
        }else {

        timer=new Timer();
//        这个方法是调度一个task，在delay（ms）后开始调度，每次调度完后，最少等待period（ms）后才开始调度
        timer.schedule(this,1000,timeInterval);
        timerIsStarted=true;
        System.out.println("Timer is started,计时器启动完成");
        }
    }




    public void stop(){//自定义的计时器方法，停止计时器
        if (timer != null) {
            timer.cancel();
            timer.purge();
            timer = null;
            timerIsStarted=false;
        }
        System.out.println("stop timer,停止计时");

    }





    @Override//监视器方法重写
    public void init(int i, String s, String s1, long l) {

        speedInfo.setFileSize(format.format((double)this.fileSize/1024)+"kb");//文件大小

    }

    @Override//监视器方法重写
    public void end() {//传输结束
        stop();//停止计时器，并清空数据
    }


    //使用synchronized关键字，线程排队调用，即线程同步


    public synchronized long getFileSize() {
        return fileSize;
    }

    private synchronized long getCounted_Before() {//取出上一秒的数据量
        return counted_Before;
    }

    private synchronized void setCounted_Before(long counted_latest) {//把这一秒的已传输数据量记录给counted_Before，为下一秒服务
        this.counted_Before = counted_latest;
    }

    private synchronized long getI_ed() {//上一秒i的值，已计秒数
        return i_ed;
    }

    private synchronized long getCounted() {//此次已传数据量的值
        return counted;
    }


    private synchronized void incrementCounted(long count){//已传数据量自增方法
        counted=counted+count;
    }
    //
    private synchronized long incrementI_ed(long i1){//已计秒数 自增方法
        i_ed=i1+(timeInterval/1000);//自增一次，自增值为间隔时间（s）
        return i_ed;
    }


}

```

#### 2.断点续传

好在Jsch提供了这个功能，我们不必再费脑筋。我们只需要在执行`put()`时，把mode的值改为**ChannelSftp.RESUME**即可。

```java
 long size = inputStream.available();
sftp.put(inputStream, serverFileName,new mySftpTimerMonitor(size),ChannelSftp.RESUME);
```

**OVERWRITE**是覆盖，**APPEND**是扩展。

### 其次，文件夹分类、文件名随机

直接看代码即可，这是service层：

```java
package com.SH.Service.ServiceImpl;

import ID_Utils.ID_Imghelper;
import com.SH.Service.IimgService;
import Sftp_service.ImageSftp;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.SftpException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;


@Service
public class imgServiceImpl   implements IimgService {


    @Value("${ImgServerIp}")
    private String ImgServerIp;//图片服务器ip

    @Value("${ImgServerPort}")
    private int ImgServerPort;//端口号

    @Value("${ImgServerUsername}")
    private String ImgServerUsername;//用户名

    @Value("${ImgServerPassword}")
    private String ImgServerPassword;//密码

    @Value("${ImgServerDirectory}")
    private String ImgServerDirectory;//存储路径


    @Override
    public boolean Imgupload(InputStream inputStream,String suffix) throws Exception {

        boolean flag;
        ImageSftp imageSftp=new ImageSftp();

        String fileName= ID_Imghelper.getImgID()+suffix;

        ChannelSftp connect = imageSftp.getConnect(ImgServerIp, ImgServerPort, ImgServerUsername, ImgServerPassword);
        //根据时间创建一个字符串作为文件夹的名字，方便管理
        String nextDirectory = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        //最终文件存放的目录名
        String finalServerDirectory=ImgServerDirectory + "/" + nextDirectory;

        try {
            flag= imageSftp.upload(connect,inputStream,finalServerDirectory,fileName);
            System.out.println("上传返回值："+flag);
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        } catch (SftpException e) {
            return false;
        }

            imageSftp.close();

        return flag;
    }

}

```

其中用**imageSftp.properties**存储服务器信息，使用@Value注解获取配置文件信息。

spring配置：

```xml
<bean id="dbproperties" class="org.springframework.beans.factory.config.PreferencesPlaceholderConfigurer">
        <property name="locations">
            <array>
               <!--数据库配置文件 --> <value>classpath:db.properties</value>
                <!--图片服务器配置文件 -->  <value>classpath:imageSftp.properties</value>
            </array>
        </property>
    </bean>
```

imageSftp.properties：

```properties
ImgServerIp=78.141.206.203
ImgServerPort=22
ImgServerUsername=root
ImgServerPassword=123456
ImgServerDirectory=/data/images
```

**ID_Imghelper**，根据时间随机生成图片Id（文件名）的工具类：

```java
package ID_Utils;

import java.util.Random;

public class ID_Imghelper {

    public static String getImgID(){

        long timeMillis = System.currentTimeMillis();
        Random random = new Random();
        int randomInt = random.nextInt(9999);

        //%X 获得数字，把它转为16进制，大写字母
        //%04X 增加的04，意思是，转化后的字符串占4个字符，不够用0填充
        String imgID=timeMillis+String.format("%04X",randomInt);
        /*其他转化：
        *  %x - 接受一个数字并将其转化为十六进制数格式, 使用小写字母
        *   %d, %i - 接受一个数字并将其转化为有符号的整数格式
         * %s - 接受一个字符串并按照给定的参数格式化该字符串
         * %e - 接受一个数字并将其转化为科学记数法格式, 使用小写字母e
         */
        return imgID;
    }

    public static void main(String[] args) {
        String imgID = ID_Imghelper.getImgID();
        System.out.println(imgID);

    }

}

```

### 最后，图片回显、结果反馈、中文支持等

图片回显只需要把服务器上的文件地址拼接出来即可。

这里给个参考，Controller：

```java
package com.SH.Controller;

import ...

@Controller

public class testController {

    @Autowired
    private IimgService imgService;

    @RequestMapping(value = "/upload",produces = "text/plain;charset=UTF-8")
    //produces属性，设置响应格式
    @ResponseBody
    public String upload(MultipartFile file,Map<String,Object> map) throws Exception {


        InputStream inputStream = file.getInputStream();
        System.out.println("文件大小"+file.getSize());
        String originalFilename = file.getOriginalFilename();

        //截取字符串substring(start,stop)，从下标为start值的位置（第start个字符）开始截取,省略stop会截取start以后得全部字符串
        //注意stop值为要截取到字符的对应下标+1，如字符串123，下标为012，从如要截取出字符串12，比喻成区间（下标）为[0,1)，写法为substring(0,2)
        //lastIndexOf(".")字符串倒数第一个.的下标
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        System.out.println(originalFilename);
        System.out.println(suffix);

        System.out.println((file.getSize()/1024.00)+"kb");

        boolean flag = imgService.Imgupload(inputStream, suffix);

        //json转换对象
        ObjectMapper MAPPER=new ObjectMapper();

        if (flag){

            map.put("上传成功",flag);
            //把对象转换为json格式字符串
            return MAPPER.writeValueAsString(map);

        }else {
            map.put("上传失败",flag);

            return MAPPER.writeValueAsString(map);
        }


    }

}

```

参考文章：

https://blog.csdn.net/weixin_36910300/article/details/80532868

https://blog.csdn.net/qq_33390789/article/details/78614466

https://www.cnblogs.com/longyg/archive/2012/06/25/2556576.html

https://www.cnblogs.com/ssslinppp/p/6248763.html

https://blog.csdn.net/chaogewudi1/article/details/81629183

https://www.cnblogs.com/awkflf11/articles/5179156.html

https://www.cnblogs.com/longyg/archive/2012/06/25/2556576.html

https://blog.csdn.net/ecjtuxuan/article/details/2093757

https://blog.csdn.net/hl_java/article/details/79035237

https://blog.csdn.net/zjy15203167987/article/details/82531772

https://www.jb51.net/article/135720.htm
