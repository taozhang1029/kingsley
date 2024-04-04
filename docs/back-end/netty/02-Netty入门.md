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
public class NettyServer {
    public static void main(String[] args) throws Exception {
        new ServerBootstrap()
                .group(new NioEventLoopGroup()) // 1
                .channel(NioServerSocketChannel.class) // 2
                .childHandler(new ChannelInitializer<NioSocketChannel>() { // 3
                    protected void initChannel(NioSocketChannel ch) {
                        ch.pipeline().addLast(new StringDecoder()); // 5
                        ch.pipeline().addLast(new SimpleChannelInboundHandler<String>() { // 6
                            @Override
                            protected void channelRead0(ChannelHandlerContext ctx, String msg) {
                                System.out.println(msg);
                            }
                        });
                    }
                })
                .bind(8080); // 4
    }
}
```