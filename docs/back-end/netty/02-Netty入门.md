---
author: kingsley
---

# Netty入门

## 一、概述

### 1、Netty 是什么？

> Netty is an asynchronous event-driven network application framework for rapid development of maintainable high performance protocol servers & clients.

Netty 是一个**异步**的、**基于事件驱动**的**网络应用框架**，用于快速开发可维护、高性能的网络服务器和客户端。
> 底层基于 NIO ，所以 Netty 运行在 JVM 上。

### 2、Netty 的作者

![](image/19.png)

他还是另一个著名的高性能 Java 网络框架 [Mina](https://mina.apache.org/mina-project/quick-start-guide.html) 的重要贡献者

### 3、Netty 的地位

Netty 在 Java 网络应用框架中的地位就好比：Spring 框架在 JavaEE 开发中的地位

以下的框架都使用了 Netty，因为它们有网络通信需求！

- Cassandra - nosql 数据库
- Spark - 大数据分布式计算框架
- Hadoop - 大数据分布式存储框架
- RocketMQ - ali 开源的消息队列
- ElasticSearch - 搜索引擎
- gRPC - rpc 框架
- Dubbo - rpc 框架
- Spring 5.x - flux api 完全抛弃了 tomcat ，使用 netty 作为服务器端
- Zookeeper - 分布式协调框架

### 4、Netty 的优势

- Netty vs NIO，工作量大，bug 多
    - 需要自己构建协议
    - 解决 TCP 传输问题，如粘包、半包
    - epoll 空轮询导致 CPU 100%
    - 对 API 进行增强，使之更易用，如 FastThreadLocal => ThreadLocal，ByteBuf => ByteBuffer
- Netty vs 其它网络应用框架
    - Mina 由 apache 维护，将来 3.x 版本可能会有较大重构，破坏 API 向下兼容性，Netty 的开发迭代更迅速，API 更简洁、文档更优秀
    - 久经考验，16年，Netty 版本
        - 2.x 2004
        - 3.x 2008
        - 4.x 2013
        - 5.x 已废弃（没有明显的性能提升，维护成本高）

## 二、快速入门

### 1、目标

开发一个简单的服务器端和客户端

- 客户端向服务器端发送 hello, world
- 服务器仅接收，不返回

加入依赖

```xml
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.59.Final</version>
</dependency>
```

### 2、服务器端

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.string.StringDecoder;

/**
 * netty服务端
 *
 * @author kingsley
 * @date 2024/4/7 21:41
 */
public class HelloServer {

    public static void main(String[] args) {
        // 1、启动器，负责组装netty组件，启动服务器
        new ServerBootstrap()
                /*
                 * 2、创建 NioEventLoopGroup，可以简单理解为 BossEventLoop 和 WorkerEventLoop(selector, thread)
                 * NioEventLoopGroup 包含 BossEventLoop 和 WorkerEventLoop，可简单理解为NIO基础中学到的 Boss 和 Worker
                 * WorkerEventLoop中有最重要的两部分：selector，线程。
                 *  - selector：用于监听客户端连接、处理网络事件（可读、可写）；
                 *  - thread：处理具体的网络事件，充分利用CPU
                 */
                .group(new NioEventLoopGroup())
                /*
                 * 3、选择服务器的ServerSocketChannel实现
                 *  - NioServerSocketChannel：NIO
                 *  - OioServerSocketChannel：BIO
                 * 在启动时会反射调用NioServerSocketChannel的构造方法，创建对象
                 */
                .channel(NioServerSocketChannel.class)
                /*
                 * 4、boss负责处理连接，worker（child）负责处理读写，决定了worker能执行哪些操作（handler）
                 */
                .childHandler(
                        /*
                         * 5、添加和客户端进行数据读写的通道的初始化器，它本身是一个特殊的handler，它的作用是管理一系列的handler，可以理解为拦截器
                         * 该方法不会立即执行初始化操作，而是等待连接建立后才会执行初始化
                         */
                        new ChannelInitializer<NioSocketChannel>() {
                            @Override
                            protected void initChannel(NioSocketChannel ch) {
                                /*
                                 * 6、添加具体的handler
                                 *  - StringDecoder：将接收到的ByteBuf转换为字符串
                                 *  - ChannelInboundHandlerAdapter：自定义handler
                                 */
                                ch.pipeline().addLast(new StringDecoder());
                                ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                                    /*
                                     * 7、channelRead处理读事件
                                     */
                                    @Override
                                    public void channelRead(ChannelHandlerContext ctx, Object msg) {
                                        /*
                                         * 8、接收到消息并处理，这里打印上一步转换好的字符串
                                         */
                                        System.out.println("收到的消息：" + msg);
                                    }
                                });
                            }
                        })
                /*
                 * 9、绑定监听端口并启动服务器
                 */
                .bind(8080);
    }

}
```
#### 代码解读
- 2处，创建 NioEventLoopGroup，可以简单理解为 线程池 + Selector 后面会详细展开
- 3处，选择服务 Scoket 实现类，其中 NioServerSocketChannel 表示基于 NIO 的服务器端实现，其它实现还有
![img.png](image/20.png)
- 4处，为啥方法叫 childHandler，是接下来添加的处理器都是给 SocketChannel 用的，而不是给 ServerSocketChannel。ChannelInitializer 处理器（仅执行一次），它的作用是待客户端 SocketChannel 建立连接后，执行 initChannel 以便添加更多的处理器
- 6处，SocketChannel 的处理器，解码 ByteBuf => String
- 7处，SocketChannel 的业务处理器，使用上一个处理器的处理结果
### 3、客户端

```java
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.string.StringEncoder;

/**
 * netty客户端
 * @author kingsley
 * @date 2024/4/7 22:02
 */
public class HelloClient {

    public static void main(String[] args) throws InterruptedException {
        // 1、创建客户端启动对象
        new Bootstrap()
                // 2、添加EventLoop
                .group(new NioEventLoopGroup())
                // 3、选择客户端channel实现类
                .channel(NioSocketChannel.class)
                // 4、添加处理器
                .handler(new ChannelInitializer<NioSocketChannel>() {
                    // 初始化channel，在连接成功之后调用
                    @Override
                    protected void initChannel(NioSocketChannel ch) {
                        // 5、往pipeline链中添加一个handler处理器，这里使用 StringEncoder 将字符串编码成 ByteBuf
                        ch.pipeline().addLast(new StringEncoder());
                    }
                })
                // 6、启动客户端连接服务器，等待连接成功
                .connect("127.0.0.1", 8080)
                // 7、阻塞方法，等待连接成功
                .sync()
                // 8、代表连接对象，可以理解为通道，通过该对象可以发送消息给服务器
                .channel()
                // 9、向服务器发送数据
                .writeAndFlush("hello, netty");
    }

}
```
#### 代码解读
- 2处，创建 NioEventLoopGroup，同 Server
- 3处，选择客户端 Socket 实现类，NioSocketChannel 表示基于 NIO 的客户端实现，其它实现还有
![img.png](image/21.png)
- 4处，添加 SocketChannel 的处理器，ChannelInitializer 处理器（仅执行一次），它的作用是待客户端 SocketChannel 建立连接后，执行 initChannel 以便添加更多的处理器
- 5处，消息会经过通道 handler 处理，这里是将 String => ByteBuf 发出
- 6处，启动客户端连接服务器，等待连接成功
- 7处，Netty 中很多方法都是异步的，如 connect，这时需要使用 sync 方法等待 connect 建立连接完毕
- 8处，获取 channel 对象，它即为通道抽象，可以进行数据读写操作
- 9处，写入消息并清空缓冲区

### 4、流程梳理
![img.png](image/22.png)

💡 提示
> **一开始需要树立正确的观念**
> * 把 channel 理解为数据的通道 
> * 把 msg 理解为流动的数据，最开始输入是 ByteBuf，但经过 pipeline 的加工，会变成其它类型对象，最后输出又变成 ByteBuf 
> * 把 handler 理解为数据的处理工序 
>    * 工序有多道，合在一起就是 pipeline，pipeline 负责发布事件（读、读取完成...）传播给每个 handler， handler 对自己感兴趣的事件进行处理（重写了相应事件处理方法）
>    * handler 分 Inbound 和 Outbound 两类
> * 把 eventLoop 理解为处理数据的工人
>    * 工人可以管理多个 channel 的 IO 操作，并且一旦工人负责了某个 channel，就要负责到底（绑定），目的是为了线程安全。
       > 总结起来就说是：**一个 eventLoop 只负责一个 NioEventLoopGroup 中的一个线程，这个线程可以管理多个 channel，但一个 channel 只能由一个 eventLoop 管理**
>    * 工人既可以执行 IO 操作，也可以进行任务处理，每位工人有任务队列，队列里可以堆放多个 channel 的待处理任务，任务分为普通任务、定时任务
>    * 工人按照 pipeline 顺序，依次按照 handler 的规划（代码）处理数据，可以为每道工序指定不同的工人

## 三、组件
### 1、EventLoop
事件循环对象，本质是一个单线程执行器（同时维护了一个 Selector），里面有 run 方法处理 Channel 上源源不断的 IO 事件。 
```java
package io.netty.channel;

import io.netty.util.concurrent.OrderedEventExecutor;

/**
 * Will handle all the I/O operations for a {@link io.netty.channel.Channel} once registered.
 * One {@link EventLoop} instance will usually handle more than one {@link io.netty.channel.Channel} but this may depend on
 * implementation details and internals.
 *
 */
@SuppressWarnings("all")
public interface EventLoop extends OrderedEventExecutor, EventLoopGroup {
    @Override
    EventLoopGroup parent();
}
```
它的继承关系比较复杂
- 一条线是继承自 java.util.concurrent.ScheduledExecutorService，因此包含了线程池中所有的方法
- 另一条线是继承自 netty 自己的 OrderedEventExecutor
  - 提供了 boolean inEventLoop(Thread thread) 方法判断一个线程是否属于此 EventLoop
  - 提供了 parent 方法来看看自己属于哪个 EventLoopGroup

### 2、EventLoopGroup
事件循环组，是一组 EventLoop。Channel 一般会调用 EventLoopGroup 的 register 方法来绑定其中一个 EventLoop，后续这个 Channel 上的 IO 事件都由此 EventLoop 来处理（保证了 IO 事件处理时的线程安全）
- 继承自 netty 自己的 EventExecutorGroup
  - 实现了 Iterable 接口提供遍历 EventLoop 的能力
  - 另有 next 方法获取集合中下一个 EventLoop

以一个简单的实现为例：

<CodeGroup>
  <CodeGroupItem title="客户端">

```java
package com.kingsley.netty.c2;

import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.util.concurrent.EventExecutor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.TimeUnit;

/**
 * EventLoop测试
 *
 * @author kingsley
 * @date 2024/4/7 23:46
 */
@Slf4j
public class TestEventLoop {

    public static void main(String[] args) throws InterruptedException {
        /*
         * 1、创建事件循环组，这里设置2个线程，2个线程就是2个EventLoop
         * NioEventLoopGroup：可处理IO事件、普通任务、定时任务
         * DefaultEventLoopGroup：处理普通任务、定时任务
         */
        EventLoopGroup group = new NioEventLoopGroup(2);
        // 2、获取下一个事件循环对象
        log.info("EventLoop: {}", group.next());
        log.info("EventLoop: {}", group.next());
        log.info("EventLoop: {}", group.next());
        log.info("---------");
        // 也可以使用 for 循环
        for (EventExecutor eventLoop : group) {
            log.info("EventLoop: {}", eventLoop);
        }

        // 处理普通任务
        group.next().execute(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            log.info("执行普通任务");
        });

        // 处理定时任务
        group.next().schedule(() -> {
            log.info("执行定时任务1");
        }, 10, TimeUnit.MILLISECONDS);
        group.next().schedule(() -> {
            log.info("执行定时任务2");
        }, 10, TimeUnit.MILLISECONDS);

        // 阻塞主线程
        TimeUnit.MILLISECONDS.sleep(200);

        // 3、优雅的关闭
        group.shutdownGracefully();

        log.info("main");
    }

}
```

  </CodeGroupItem>

  <CodeGroupItem title="输出">

```shell
2024-04-08 00:09:05.465 INFO  [main] com.kingsley.netty.c2.TestEventLoop               : EventLoop: io.netty.channel.nio.NioEventLoop@28feb3fa
2024-04-08 00:09:05.465 INFO  [main] com.kingsley.netty.c2.TestEventLoop               : EventLoop: io.netty.channel.nio.NioEventLoop@675d3402
2024-04-08 00:09:05.465 INFO  [main] com.kingsley.netty.c2.TestEventLoop               : EventLoop: io.netty.channel.nio.NioEventLoop@28feb3fa
2024-04-08 00:09:05.465 INFO  [main] com.kingsley.netty.c2.TestEventLoop               : ---------
2024-04-08 00:09:05.465 INFO  [main] com.kingsley.netty.c2.TestEventLoop               : EventLoop: io.netty.channel.nio.NioEventLoop@28feb3fa
2024-04-08 00:09:05.465 INFO  [main] com.kingsley.netty.c2.TestEventLoop               : EventLoop: io.netty.channel.nio.NioEventLoop@675d3402
2024-04-08 00:09:05.551 INFO  [nioEventLoopGroup-2-2] com.kingsley.netty.c2.TestEventLoop               : 执行定时任务1
2024-04-08 00:09:05.741 INFO  [main] com.kingsley.netty.c2.TestEventLoop               : main
2024-04-08 00:09:06.545 INFO  [nioEventLoopGroup-2-1] com.kingsley.netty.c2.TestEventLoop               : 执行普通任务
2024-04-08 00:09:06.546 INFO  [nioEventLoopGroup-2-1] com.kingsley.netty.c2.TestEventLoop               : 执行定时任务2
```

  </CodeGroupItem>
</CodeGroup>

#### 💡 优雅关闭  
优雅关闭 shutdownGracefully 方法。该方法会首先切换 EventLoopGroup 到关闭状态从而拒绝新的任务的加入，然后在任务队列的任务都处理完成后，停止线程的运行。从而确保整体应用是在正常有序的状态下退出的

#### NioEventLoop 处理 io 事件

服务器端两个 nio worker 工人，配置四个客户端，通过命令行参数设置客户端ID，然后快速依次启动

![img.png](image/clientCnnfig.png)
![](https://cdn.jsdelivr.net/gh/taozhang1029/static-repository@master/img/202404172353544.png)

<CodeGroup>
<CodeGroupItem title="服务端">

```java
package com.kingsley.netty.c3;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.Charset;

/**
 * @author kingsley
 * @date 2024/4/17 22:43
 */
@Slf4j
public class EventLoopServer {

    /**
     * 主程序入口。
     * 使用ServerBootstrap启动一个服务器，配置使用NIO传输，绑定到8080端口。
     * 对每个新连接，使用ChannelInitializer初始化Channel，加入自定义的ChannelInboundHandlerAdapter以处理入站事件。
     */
    public static void main(String[] args) {
        new ServerBootstrap() // 创建ServerBootstrap实例，用于启动服务器
                .group(new NioEventLoopGroup(1), new NioEventLoopGroup(2)) // 指定使用NIO事件循环组
                .channel(NioServerSocketChannel.class) // 指定使用NIO服务器套接字通道
                .childHandler(new ChannelInitializer<NioSocketChannel>() { // 定义子通道（即每个新连接）的初始化处理器
                    @Override
                    protected void initChannel(NioSocketChannel ch) throws Exception {
                        ch.pipeline().addLast(new ChannelInboundHandlerAdapter() { // 向通道处理链中添加自定义的入站事件处理器
                            @Override
                            public void channelRead(ChannelHandlerContext ctx, Object msg) { // 当有数据读取时
                                ByteBuf buf = (ByteBuf) msg; // 将接收到的消息转换为ByteBuf类型
                                log.info("receive: {}", buf.toString(Charset.defaultCharset())); // 打印接收到的数据
                            }
                        });
                    }
                }).bind(8080); // 绑定到8080端口并启动服务器
    }

}
```

</CodeGroupItem>
<CodeGroupItem title="客户端">

```java
package com.kingsley.netty.c3;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.string.StringEncoder;
import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;

/**
 * netty客户端
 *
 * @author kingsley
 * @date 2024/4/7 22:02
 */
@Slf4j
public class EvenLoopClient {

    public static void main(String[] args) throws InterruptedException {
        // 1、创建客户端启动对象
        Channel channel = new Bootstrap()
                // 2、添加EventLoop
                .group(new NioEventLoopGroup())
                // 3、选择客户端channel实现类
                .channel(NioSocketChannel.class)
                // 4、添加处理器
                .handler(new ChannelInitializer<NioSocketChannel>() {
                    // 初始化channel，在连接成功之后调用
                    @Override
                    protected void initChannel(NioSocketChannel ch) {
                        // 5、往pipeline链中添加一个handler处理器，这里使用 StringEncoder 将字符串编码成 ByteBuf
                        ch.pipeline().addLast(new StringEncoder());
                    }
                })
                // 6、启动客户端连接服务器，等待连接成功
                .connect("127.0.0.1", 8080)
                // 阻塞方法，等待连接成功
                .sync()
                // 代表连接对象
                .channel();
        String clientId = args[0];
        log.info("客户端连接成功，channel: {}, clientId: {}", channel, clientId);
        // 7、向服务器发送数据
        channel.writeAndFlush(clientId + " ===> hello, netty1");
        Thread.sleep(10000);
        channel.writeAndFlush(clientId + "hello, netty2");
    }
}
```

</CodeGroupItem>

<CodeGroupItem title="输出">

```shell
2024-04-17 23:55:39.875 DEBUG [nioEventLoopGroup-3-1] io.netty.util.Recycler                            : -Dio.netty.recycler.maxCapacityPerThread: 4096
2024-04-17 23:55:39.876 DEBUG [nioEventLoopGroup-3-1] io.netty.util.Recycler                            : -Dio.netty.recycler.maxSharedCapacityFactor: 2
2024-04-17 23:55:39.876 DEBUG [nioEventLoopGroup-3-1] io.netty.util.Recycler                            : -Dio.netty.recycler.linkCapacity: 16
2024-04-17 23:55:39.876 DEBUG [nioEventLoopGroup-3-1] io.netty.util.Recycler                            : -Dio.netty.recycler.ratio: 8
2024-04-17 23:55:39.876 DEBUG [nioEventLoopGroup-3-1] io.netty.util.Recycler                            : -Dio.netty.recycler.delayedQueue.ratio: 8
2024-04-17 23:55:39.889 DEBUG [nioEventLoopGroup-3-1] io.netty.buffer.AbstractByteBuf                   : -Dio.netty.buffer.checkAccessible: true
2024-04-17 23:55:39.890 DEBUG [nioEventLoopGroup-3-1] io.netty.buffer.AbstractByteBuf                   : -Dio.netty.buffer.checkBounds: true
2024-04-17 23:55:39.893 DEBUG [nioEventLoopGroup-3-1] io.netty.util.ResourceLeakDetectorFactory         : Loaded default ResourceLeakDetector: io.netty.util.ResourceLeakDetector@452b789e
2024-04-17 23:55:39.899 INFO  [nioEventLoopGroup-3-1] com.kingsley.netty.c3.EventLoopServer             : receive: client2 ===> hello, netty1
2024-04-17 23:55:40.430 INFO  [nioEventLoopGroup-3-2] com.kingsley.netty.c3.EventLoopServer             : receive: client3 ===> hello, netty1
2024-04-17 23:55:41.053 INFO  [nioEventLoopGroup-3-1] com.kingsley.netty.c3.EventLoopServer             : receive: client4 ===> hello, netty1
2024-04-17 23:55:41.603 INFO  [nioEventLoopGroup-3-2] com.kingsley.netty.c3.EventLoopServer             : receive: client1 ===> hello, netty1
2024-04-17 23:55:49.858 INFO  [nioEventLoopGroup-3-1] com.kingsley.netty.c3.EventLoopServer             : receive: client2 ===> hello, netty2
2024-04-17 23:55:50.419 INFO  [nioEventLoopGroup-3-2] com.kingsley.netty.c3.EventLoopServer             : receive: client3 ===> hello, netty2
2024-04-17 23:55:51.045 INFO  [nioEventLoopGroup-3-1] com.kingsley.netty.c3.EventLoopServer             : receive: client4 ===> hello, netty2
2024-04-17 23:55:51.599 INFO  [nioEventLoopGroup-3-2] com.kingsley.netty.c3.EventLoopServer             : receive: client1 ===> hello, netty2
```

</CodeGroupItem>

</CodeGroup>

> - 从前四个读事件日志可以看出，服务端依次使用 nioEventLoopGroup-3-1、nioEventLoopGroup-3-2 线程处理客户端的请求。证明一个线程(EventLoop)可以处理多个客户端的请求，并且是通过轮询的方式获取线程(EventLoop)来处理客户端的请求
> - 根据后四次读事件日志可以看出，对于同一个客户端连接通道，服务端使用相同的线程(EventLoop)处理请求

![](https://cdn.jsdelivr.net/gh/taozhang1029/static-repository@master/img/202404180052346.png)

#### ❓上述服务端的代码是否存在问题呢？
由于服务端的一个线程可能要处理多个客户端的请求，如果某一个客户端的请求处理时间过长，那么服务端线程就会阻塞，导致其他客户端的请求无法处理。这种情况下服务端的吞吐量就会因为一个客户端的影响而下降。

💡 解决方案

创建一个独立的 EventLoopGroup 专门处理业务逻辑
```java
package com.kingsley.netty.c3;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.Charset;

/**
 * @author kingsley
 * @date 2024/4/17 22:43
 */
@Slf4j
public class EventLoopServer2 {

    /**
     * 主程序入口。
     * 使用ServerBootstrap启动一个服务器，配置使用NIO传输，绑定到8080端口。
     * 对每个新连接，使用ChannelInitializer初始化Channel，加入自定义的ChannelInboundHandlerAdapter以处理入站事件。
     */
    public static void main(String[] args) {
        // 创建一个独立的 EventLoopGroup
        EventLoopGroup group = new DefaultEventLoopGroup();
        new ServerBootstrap()
                .group(new NioEventLoopGroup(1), new NioEventLoopGroup(2))
                .channel(NioServerSocketChannel.class)
                .childHandler(new ChannelInitializer<NioSocketChannel>() {
                    @Override
                    protected void initChannel(NioSocketChannel ch) {
                        ch.pipeline()
                                // 使用 NioEventLoopGroup 处理
                                .addLast(new ChannelInboundHandlerAdapter() {
                                    @Override
                                    public void channelRead(ChannelHandlerContext ctx, Object msg) {
                                        ByteBuf buf = (ByteBuf) msg;
                                        log.info("receive: {}", buf.toString(Charset.defaultCharset()));
                                        // 将消息传递到下一个 handler 处理，必须加这一行代码 ！！！ 否则在这就断了，不会将消息交给后续 handler 处理
                                        ctx.fireChannelRead(msg);
                                    }
                                })
                                // 使用 DefaultEventLoop 处理
                                .addLast(group, "handler2", new ChannelInboundHandlerAdapter() {
                                    @Override
                                    public void channelRead(ChannelHandlerContext ctx, Object msg) {
                                        ByteBuf buf = (ByteBuf) msg; // 将接收到的消息转换为ByteBuf类型
                                        log.info("handler2 use defaultEventLoop process receive: {}", buf.toString(Charset.defaultCharset()));
                                    }
                                });
                    }
                }).bind(8080);
    }

}
```

先启动服务端，然后同时启动客户端1、客户端2，服务端输出：
```shell
2024-04-18 00:28:42.995 INFO  [nioEventLoopGroup-4-1] com.kingsley.netty.c3.EventLoopServer2            : receive: client2 ===> hello, netty1
2024-04-18 00:28:42.996 INFO  [defaultEventLoopGroup-2-1] com.kingsley.netty.c3.EventLoopServer2            : handler2 use defaultEventLoop process receive: client2 ===> hello, netty1
2024-04-18 00:28:43.585 INFO  [nioEventLoopGroup-4-2] com.kingsley.netty.c3.EventLoopServer2            : receive: client1 ===> hello, netty1
2024-04-18 00:28:43.586 INFO  [defaultEventLoopGroup-2-2] com.kingsley.netty.c3.EventLoopServer2            : handler2 use defaultEventLoop process receive: client1 ===> hello, netty1
2024-04-18 00:28:52.970 INFO  [nioEventLoopGroup-4-1] com.kingsley.netty.c3.EventLoopServer2            : receive: client2 ===> hello, netty2
2024-04-18 00:28:52.972 INFO  [defaultEventLoopGroup-2-1] com.kingsley.netty.c3.EventLoopServer2            : handler2 use defaultEventLoop process receive: client2 ===> hello, netty2
2024-04-18 00:28:53.580 INFO  [nioEventLoopGroup-4-2] com.kingsley.netty.c3.EventLoopServer2            : receive: client1 ===> hello, netty2
2024-04-18 00:28:53.583 INFO  [defaultEventLoopGroup-2-2] com.kingsley.netty.c3.EventLoopServer2            : handler2 use defaultEventLoop process receive: client1 ===> hello, netty2
```
可以发现第二个handler使用的是 defaultEventLoopGroup，并且也是轮询绑定机制

![](https://cdn.jsdelivr.net/gh/taozhang1029/static-repository@master/img/202404180053271.png)

#### 💡 handler 执行中如何换人？

关键代码

<Badge type="warning" text="io.netty.channel.AbstractChannelHandlerContext#invokeChannelRead()" vertical="middle" />