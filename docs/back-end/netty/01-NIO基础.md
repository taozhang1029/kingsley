---
author: kingsley
---

# NIO基础

non-blocking IO 非阻塞IO

NIO与IO的区别：
- IO是阻塞的，NIO是非阻塞的
- IO是同步的，NIO是异步的
- IO是面向流的，NIO是面向块的
- IO是面向字节的，NIO是面向缓冲区的
- IO是面向连接的，NIO是面向连接的

## 一、三大组件

### 1、Channel

Channel：通道，负责连接，负责读写数据，负责缓冲区数据的传输

Channel有一点类似于Stream，他是读写数据的双向通道，可以从Channel将数据读入到Buffer中，也可以将Buffer中的数据写入到Channel中。
而之前的Stream是单向的，要么是读，要么是写，Channel比Stream更加底层。


常见的Channel：

- FileChannel：用于读取、写入、映射、操作文件
- SocketChannel：用于读取、写入、操作套接字
- ServerSocketChannel：用于监听、接受、操作套接字
- DatagramChannel：用于读取、写入、操作Datagram包

### 2、Buffer

Buffer：缓冲区，负责数据的读写操作，缓冲区是Channel的附属产品，它负责将数据从Channel中读取到内存中，或者将内存中的数据写入到Channel中。

常见的Buffer：
- ByteBuffer：用于读写字节.(最常用)
    - MappedByteBuffer：用于读写内存映射文件
    - DirectByteBuffer：用于读写直接内存
    - HeapByteBuffer：用于读写堆内存
- CharBuffer：用于读写字符
- DoubleBuffer：用于读写double
- FloatBuffer：用于读写float
- IntBuffer：用于读写int
- LongBuffer：用于读写long
- ShortBuffer：用于读写short

### 3、Selector

Selector：选择器，负责监听Channel，当Channel中的数据可以读写时，Selector会通知程序员，然后程序员就可以根据通知，对Channel进行读写操作。

Selector单从字面意思上不好理解，需要结合服务器的设计演化来理解它的用途。

#### 多线程版设计

<div>
<mermaid-wrapper dsl="
flowchart TB
     thread1 --> socket1
     thread2 --> socket2
     thread3 --> socket3
">
</mermaid-wrapper>
</div>

⚠️ 多线程版缺点
- 内存占用高（创建大量线程）
- 线程切换开销大
- 只适合连接数少的场景

#### 线程池版设计

<div style="margin-top: 10px;">
<mermaid-wrapper dsl="
flowchart TB
   thread1 --> socket1
   thread1 .-> socket3
   thread2 --> socket2
   thread2 .-> socket4
">
</mermaid-wrapper>
</div>

⚠️ 线程池版缺点
- 阻塞模式下，线程仅能处理一个socket连接
- 仅适合短连接的场景

#### Selector版设计

Selector的作用就是配合一个线程来管理多个Channel，获取这些Channel上发生的事件，这些Channel工作在非阻塞模式下，不会让线程吊死在一个Channel上。适合连接数特别多，但是每个连接的流量都比较小的场景。

<div style="margin-top: 10px;">
<mermaid-wrapper dsl="
flowchart TB
  thread --> selector
  selector --> channel1
  selector --> channel2
  selector --> channel3
">
</mermaid-wrapper>
</div>

调用Selector的select()方法会阻塞直到Channel上发生读写就绪事件，当发生事件时，select方法就会返回这些事件交给thread处理

<hr>

## 二、ByteBuffer

Channel与Buffer实践案例：

maven依赖：
```xml
<dependencies>
    <dependency>
        <groupId>io.netty</groupId>
        <artifactId>netty-all</artifactId>
        <version>4.1.59.Final</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.16</version>
    </dependency>
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.8.8</version>
    </dependency>
    <dependency>
        <groupId>com.google.guava</groupId>
        <artifactId>guava</artifactId>
        <version>19.0</version>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.2.11</version>
    </dependency>
</dependencies>
```
文件数据 data.txt
```txt
1234567890abc
```

测试代码
```java
package com.kingsley.netty.c1;

import lombok.extern.slf4j.Slf4j;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

/**
 * @author kingsley
 * @date 2024/3/22 21:02
 */
@Slf4j
public class FileChannelByteBufferTest {

    public static void main(String[] args) {
        // FileChannel
        // 1、输入输出流 2、RandomAccessFile
        try (FileChannel fc = new FileInputStream("data.txt").getChannel()) {
            // 准备缓冲区
            ByteBuffer buffer = ByteBuffer.allocate(10);
            while (true) {
                // 从channel中读取数据到buffer中
                int readSize = fc.read(buffer);
                log.debug("readSize:{}", readSize);
                // 读取到末尾
                if (readSize == -1) {
                    break;
                }
                // 切换至读模式
                buffer.flip();
                while (buffer.hasRemaining()) {
                    log.debug("buffer:{}", (char) buffer.get());
                }
                // 切换到写模式
                buffer.clear();
            }
        } catch (IOException e) {
            log.error("io异常", e);
        }
    }
}

```

输出
```shell
2024-03-22 23:25:22.015 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : readSize:10
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:1
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:2
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:3
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:4
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:5
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:6
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:7
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:8
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:9
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:0
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : readSize:3
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:a
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:b
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : buffer:c
2024-03-22 23:25:22.021 DEBUG [main] com.kingsley.netty.c1.FileChannelByteBufferTest   : readSize:-1

Process finished with exit code 0
```

### 1、ByteBuffer的正确使用

1. 向 buffer 写入数据，例如调用 channel.read(buffer)
2. 调用 flip() 切换至读模式
3. 从 buffer 读取数据，例如调用 buffer.get()
4. 调用 clear() 或 compact() 切换至写模式
5. 重复 1~4 步骤

### 2、ByteBuffer结构

ByteBuffer 有以下重要属性

- capacity
- position
- limit

一开始

![](image/1.png)

写模式下，position 是写入位置，limit 等于容量，下图表示写入了 4 个字节后的状态

![](image/2.png)

flip 动作发生后，position 切换为读取位置，limit 切换为读取限制

![](image/3.png)

读取 4 个字节后  

![](image/4.png)

clear 动作发生后

![](image/5.png)

compact 方法，是把未读完的部分向前压缩，然后切换至写模式

![](image/6.png)

💡 **调试工具类**
```java
package com.kingsley.netty;

import io.netty.util.internal.MathUtil;
import io.netty.util.internal.StringUtil;

import java.nio.ByteBuffer;

/**
 * 调试工具类
 *
 * @author kingsley
 * @date 2024/3/22 23:07
 */
public class ByteBufferUtil {
    private static final char[] BYTE2CHAR = new char[256];
    private static final char[] HEXDUMP_TABLE = new char[256 * 4];
    private static final String[] HEXPADDING = new String[16];
    private static final String[] HEXDUMP_ROWPREFIXES = new String[65536 >>> 4];
    private static final String[] BYTE2HEX = new String[256];
    private static final String[] BYTEPADDING = new String[16];

    static {
        final char[] DIGITS = "0123456789abcdef".toCharArray();
        for (int i = 0; i < 256; i++) {
            HEXDUMP_TABLE[i << 1] = DIGITS[i >>> 4 & 0x0F];
            HEXDUMP_TABLE[(i << 1) + 1] = DIGITS[i & 0x0F];
        }

        int i;

        // Generate the lookup table for hex dump paddings
        for (i = 0; i < HEXPADDING.length; i++) {
            int padding = HEXPADDING.length - i;
            StringBuilder buf = new StringBuilder(padding * 3);
            for (int j = 0; j < padding; j++) {
                buf.append("   ");
            }
            HEXPADDING[i] = buf.toString();
        }

        // Generate the lookup table for the start-offset header in each row (up to 64KiB).
        for (i = 0; i < HEXDUMP_ROWPREFIXES.length; i++) {
            StringBuilder buf = new StringBuilder(12);
            buf.append(StringUtil.NEWLINE);
            buf.append(Long.toHexString((long) i << 4 & 0xFFFFFFFFL | 0x100000000L));
            buf.setCharAt(buf.length() - 9, '|');
            buf.append('|');
            HEXDUMP_ROWPREFIXES[i] = buf.toString();
        }

        // Generate the lookup table for byte-to-hex-dump conversion
        for (i = 0; i < BYTE2HEX.length; i++) {
            BYTE2HEX[i] = ' ' + StringUtil.byteToHexStringPadded(i);
        }

        // Generate the lookup table for byte dump paddings
        for (i = 0; i < BYTEPADDING.length; i++) {
            int padding = BYTEPADDING.length - i;
            StringBuilder buf = new StringBuilder(padding);
            for (int j = 0; j < padding; j++) {
                buf.append(' ');
            }
            BYTEPADDING[i] = buf.toString();
        }

        // Generate the lookup table for byte-to-char conversion
        for (i = 0; i < BYTE2CHAR.length; i++) {
            if (i <= 0x1f || i >= 0x7f) {
                BYTE2CHAR[i] = '.';
            } else {
                BYTE2CHAR[i] = (char) i;
            }
        }
    }

    /**
     * 打印所有内容
     *
     * @param buffer
     */
    public static void debugAll(ByteBuffer buffer) {
        int oldlimit = buffer.limit();
        buffer.limit(buffer.capacity());
        StringBuilder origin = new StringBuilder(256);
        appendPrettyHexDump(origin, buffer, 0, buffer.capacity());
        System.out.println("+--------+-------------------- all ------------------------+----------------+");
        System.out.printf("position: [%d], limit: [%d]\n", buffer.position(), oldlimit);
        System.out.println(origin);
        buffer.limit(oldlimit);
    }

    /**
     * 打印可读取内容
     *
     * @param buffer
     */
    public static void debugRead(ByteBuffer buffer) {
        StringBuilder builder = new StringBuilder(256);
        appendPrettyHexDump(builder, buffer, buffer.position(), buffer.limit() - buffer.position());
        System.out.println("+--------+-------------------- read -----------------------+----------------+");
        System.out.printf("position: [%d], limit: [%d]\n", buffer.position(), buffer.limit());
        System.out.println(builder);
    }

    private static void appendPrettyHexDump(StringBuilder dump, ByteBuffer buf, int offset, int length) {
        if (MathUtil.isOutOfBounds(offset, length, buf.capacity())) {
            throw new IndexOutOfBoundsException(
                    "expected: " + "0 <= offset(" + offset + ") <= offset + length(" + length
                            + ") <= " + "buf.capacity(" + buf.capacity() + ')');
        }
        if (length == 0) {
            return;
        }
        dump.append(
                "         +-------------------------------------------------+" +
                        StringUtil.NEWLINE + "         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |" +
                        StringUtil.NEWLINE + "+--------+-------------------------------------------------+----------------+");

        final int startIndex = offset;
        final int fullRows = length >>> 4;
        final int remainder = length & 0xF;

        // Dump the rows which have 16 bytes.
        for (int row = 0; row < fullRows; row++) {
            int rowStartIndex = (row << 4) + startIndex;

            // Per-row prefix.
            appendHexDumpRowPrefix(dump, row, rowStartIndex);

            // Hex dump
            int rowEndIndex = rowStartIndex + 16;
            for (int j = rowStartIndex; j < rowEndIndex; j++) {
                dump.append(BYTE2HEX[getUnsignedByte(buf, j)]);
            }
            dump.append(" |");

            // ASCII dump
            for (int j = rowStartIndex; j < rowEndIndex; j++) {
                dump.append(BYTE2CHAR[getUnsignedByte(buf, j)]);
            }
            dump.append('|');
        }

        // Dump the last row which has less than 16 bytes.
        if (remainder != 0) {
            int rowStartIndex = (fullRows << 4) + startIndex;
            appendHexDumpRowPrefix(dump, fullRows, rowStartIndex);

            // Hex dump
            int rowEndIndex = rowStartIndex + remainder;
            for (int j = rowStartIndex; j < rowEndIndex; j++) {
                dump.append(BYTE2HEX[getUnsignedByte(buf, j)]);
            }
            dump.append(HEXPADDING[remainder]);
            dump.append(" |");

            // Ascii dump
            for (int j = rowStartIndex; j < rowEndIndex; j++) {
                dump.append(BYTE2CHAR[getUnsignedByte(buf, j)]);
            }
            dump.append(BYTEPADDING[remainder]);
            dump.append('|');
        }

        dump.append(StringUtil.NEWLINE +
                "+--------+-------------------------------------------------+----------------+");
    }

    private static void appendHexDumpRowPrefix(StringBuilder dump, int row, int rowStartIndex) {
        if (row < HEXDUMP_ROWPREFIXES.length) {
            dump.append(HEXDUMP_ROWPREFIXES[row]);
        } else {
            dump.append(StringUtil.NEWLINE);
            dump.append(Long.toHexString(rowStartIndex & 0xFFFFFFFFL | 0x100000000L));
            dump.setCharAt(dump.length() - 9, '|');
            dump.append('|');
        }
    }

    public static short getUnsignedByte(ByteBuffer buffer, int index) {
        return (short) (buffer.get(index) & 0xFF);
    }
}
```

测试ByteBuffer读写
```java
package com.kingsley.netty.c1;

import com.kingsley.netty.ByteBufferUtil;
import lombok.extern.slf4j.Slf4j;

import java.nio.ByteBuffer;

/**
 * 测试ByteBuffer读写
 *
 * @author kingsley
 * @date 2024/3/22 23:11
 */
@Slf4j
public class ByteBufferReadWriteTest {
    public static void main(String[] args) {
        ByteBuffer buffer = ByteBuffer.allocate(10);
        // 'a'
        buffer.put((byte) 0x61);
        ByteBufferUtil.debugAll(buffer);
        // 'bcd'
        buffer.put(new byte[]{'b', 'c', 'd'});
        ByteBufferUtil.debugAll(buffer);
        // 切换读模式
        buffer.flip();
        log.info("buffer read one byte: {}", buffer.get());
        ByteBufferUtil.debugAll(buffer);
        // 压缩并切换写模式
        buffer.compact();
        ByteBufferUtil.debugAll(buffer);
        // 写入两个字节
        buffer.put(new byte[]{'e', 'f'});
        ByteBufferUtil.debugAll(buffer);
    }
}
```
控制台输出
```shell
2024-03-22 23:25:51.116 DEBUG [main] .netty.util.internal.logging.InternalLoggerFactory: Using SLF4J as the default logging framework
+--------+-------------------- all ------------------------+----------------+
position: [1], limit: [10]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 61 00 00 00 00 00 00 00 00 00                   |a.........      |
+--------+-------------------------------------------------+----------------+
+--------+-------------------- all ------------------------+----------------+
position: [4], limit: [10]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 61 62 63 64 00 00 00 00 00 00                   |abcd......      |
+--------+-------------------------------------------------+----------------+
2024-03-22 23:25:51.136 INFO  [main] com.kingsley.netty.c1.ByteBufferReadWriteTest     : buffer read one byte: 97
+--------+-------------------- all ------------------------+----------------+
position: [1], limit: [4]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 61 62 63 64 00 00 00 00 00 00                   |abcd......      |
+--------+-------------------------------------------------+----------------+
+--------+-------------------- all ------------------------+----------------+
position: [3], limit: [10]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 62 63 64 64 00 00 00 00 00 00                   |bcdd......      |
+--------+-------------------------------------------------+----------------+
+--------+-------------------- all ------------------------+----------------+
position: [5], limit: [10]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 62 63 64 65 66 00 00 00 00 00                   |bcdef.....      |
+--------+-------------------------------------------------+----------------+

Process finished with exit code 0
```


### 3、ByteBuffer的常用方法

#### 分配空间
可以使用 allocate 方法为 ByteBuffer 分配空间，其它 buffer 类也有该方法
```java
package com.kingsley.netty.c1;

import java.nio.ByteBuffer;

/**
 * @author kingsley
 * @date 2024/3/22 23:26
 */
public class ByteBufferAllocateTest {

    public static void main(String[] args) {
        // class java.nio.HeapByteBuffer 堆内存，读写效率较低，受到GC的影响（例如buffer可能会被移动）
        System.out.println(ByteBuffer.allocate(16).getClass());
        // class java.nio.DirectByteBuffer 直接内存，读写效率高（少一次拷贝），不受GC的影响，但分配的效率低，使用不当可能导致内存泄漏
        System.out.println(ByteBuffer.allocateDirect(16).getClass());
    }

}
```

#### 向 buffer 写入数据
方法1：调用 channel 的 read 方法 
```java
int writeBytes = channel.write(buf);
```
方法2：调用 buffer 自己的 put 方法
```java
buf.put((byte)127);
```

#### 从 buffer 读取数据
方法1：调用 channel 的 write 方法
```java
int writeBytes = channel.write(buf);
```
方法2：调用 buffer 自己的 get 方法
```java
  byte b = buf.get();
```

get 方法会让 position 读指针向后走，如果想重复读取数据

- 可以调用 rewind 方法将 position 重新置为 0
- 或者调用 get(int i) 方法获取索引 i 的内容，它不会移动读指针

#### mark 和 reset

mark 是在读取时，做一个标记，即使 position 改变，只要调用 reset 就能回到 mark 的位置
> **注意**  
> rewind 和 flip 都会清除 mark 位置

#### 字符串与 ByteBuffer 互转
```java
package com.kingsley.netty.c1;

import com.kingsley.netty.ByteBufferUtil;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

/**
 * 字符串 与 ByteBuffer 之间的转换
 *
 * @author kingsley
 * @date 2024/3/22 23:48
 */
public class ByteBufferStringTest {

    public static void main(String[] args) {
        // 字符串 转为 ByteBuffer
        // 方法1：字符串转字节数组后往 ByteBuffer 写入，不会自动切换到读模式
        ByteBuffer buffer1 = ByteBuffer.allocate(16);
        buffer1.put("hello,world".getBytes());
        ByteBufferUtil.debugAll(buffer1);

        // 方法2：借助 Charset，会自动切换到读模式
        ByteBuffer buffer2 = StandardCharsets.UTF_8.encode("hello,world");
        ByteBufferUtil.debugAll(buffer2);

        // 方法3：借助 ByteBuffer.wrap，会自动切换到读模式
        ByteBuffer buffer3 = ByteBuffer.wrap("hello,world".getBytes());
        ByteBufferUtil.debugAll(buffer3);


        // ByteBuffer 转为 字符串
        // 方法1：ByteBuffer 转为 字节数组，再转为 字符串
        buffer1.flip();
        byte[] bytes = new byte[buffer1.limit()];
        buffer1.get(bytes);
        System.out.println(new String(bytes));

        // 方法2：借助 Charset
        String s2 = StandardCharsets.UTF_8.decode(buffer2).toString();
        System.out.println(s2);
    }

}
```

控制台输出
```shell
+--------+-------------------- all ------------------------+----------------+
position: [11], limit: [16]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 68 65 6c 6c 6f 2c 77 6f 72 6c 64 00 00 00 00 00 |hello,world.....|
+--------+-------------------------------------------------+----------------+
+--------+-------------------- all ------------------------+----------------+
position: [0], limit: [11]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 68 65 6c 6c 6f 2c 77 6f 72 6c 64 00             |hello,world.    |
+--------+-------------------------------------------------+----------------+
+--------+-------------------- all ------------------------+----------------+
position: [0], limit: [11]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 68 65 6c 6c 6f 2c 77 6f 72 6c 64                |hello,world     |
+--------+-------------------------------------------------+----------------+
hello,world
hello,world
```

#### Scattering Reads
分散读取，有一个文本文件 words.txt，文件内容
```txt
onetwothree
```
使用如下方式读取，可以将数据填充至多个 buffer，代码：
```java
package com.kingsley.netty.c1;

import com.kingsley.netty.ByteBufferUtil;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

/**
 * @author kingsley
 * @date 2024/3/23 00:03
 */
@Slf4j
public class ScatteringReadsTest {

    public static void main(String[] args) {
        try (FileChannel fileChannel = new RandomAccessFile("words.txt", "r").getChannel()) {
            ByteBuffer buffer1 = ByteBuffer.allocate(3);
            ByteBuffer buffer2 = ByteBuffer.allocate(3);
            ByteBuffer buffer3 = ByteBuffer.allocate(5);
            fileChannel.read(new ByteBuffer[]{buffer1, buffer2, buffer3});
            buffer1.flip();
            buffer2.flip();
            buffer3.flip();
            ByteBufferUtil.debugRead(buffer1);
            ByteBufferUtil.debugRead(buffer2);
            ByteBufferUtil.debugRead(buffer3);
        } catch (IOException e) {
            log.error("Error", e);
        }
    }
}
```

控制台输出

```shell
+--------+-------------------- read -----------------------+----------------+
position: [0], limit: [3]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 6f 6e 65                                        |one             |
+--------+-------------------------------------------------+----------------+
+--------+-------------------- read -----------------------+----------------+
position: [0], limit: [3]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 74 77 6f                                        |two             |
+--------+-------------------------------------------------+----------------+
+--------+-------------------- read -----------------------+----------------+
position: [0], limit: [5]
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 74 68 72 65 65                                  |three           |
+--------+-------------------------------------------------+----------------+
```

#### Gathering Writes
使用如下方式写入，可以将多个 buffer 的数据填充至 channel
```java
package com.kingsley.netty.c1;

import lombok.extern.slf4j.Slf4j;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;

/**
 * @author kingsley
 * @date 2024/3/23 00:03
 */
@Slf4j
public class GatheringWritesTest {

    public static void main(String[] args) {
        ByteBuffer buffer1 = StandardCharsets.UTF_8.encode("hello");
        ByteBuffer buffer2 = StandardCharsets.UTF_8.encode("world");
        ByteBuffer buffer3 = StandardCharsets.UTF_8.encode("你好");
        try (FileChannel channel = new RandomAccessFile("words2.txt", "rw").getChannel()) {
            channel.write(new ByteBuffer[]{buffer1, buffer2, buffer3});
        } catch (IOException e) {
            log.error("error", e);
        }
    }
    
}
```

## 三、文件编程

### 1、FileChannel

FileChannel 是一个通道，可以读取文件，也可以写入文件。

⚠️ FileChannel 只能工作在阻塞模式下

#### 获取

不能直接打开 FileChannel，必须通过 FileInputStream、FileOutputStream 或者 RandomAccessFile 来获取 FileChannel，它们都有 getChannel 方法

- FileInputStream 获取的 channel 只能读
- FileOutputStream 获取的 channel 只能写
- RandomAccessFile 获取的 channel 是否能读写根据构造 RandomAccessFile 时的读写模式决定

#### 读取
FileChannel 通过read方法读取数据，需要使用 Buffer，返回值表示读到了多少字节，-1 表示到达了文件的末尾

```java
int readBytes = channel.read(buffer);
```

#### 写入
写入的正确姿势如下
```java
ByteBuffer buffer = ...;
buffer.put(...); // 存入数据
buffer.flip();   // 切换读模式

while(buffer.hasRemaining()) {
    channel.write(buffer);
}
```

在 while 中调用 channel.write 是因为 write 方法并不能保证一次将 buffer 中的内容全部写入 channel

#### 关闭
FileChannel 通过 close 方法关闭，关闭后不能再读写。调用了 FileInputStream、FileOutputStream 或者 RandomAccessFile 的 close 方法会间接地调用 channel 的 close 方法

#### 位置
FileChannel 的 position 属性表示当前读取或写入的位置，可以通过调用 position 方法获取或设置

获取当前位置
```java
long position = channel.position();
```

设置当前位置
```java
channel.position(100);
```
设置当前位置后，再调用 read 方法读取数据，就会从当前位置开始读取。如果设置为文件的末尾
- 如果是读模式，则返回 -1
- 如果是写模式，会追加内容，但要注意如果 position 超过了文件末尾，再写入时在新内容和原末尾之间会有空洞（00）

#### 获取文件大小
FileChannel 的 size 属性表示文件的大小，可以通过调用 size 方法获取

```java
long size = channel.size();
```

#### 强制写入
操作系统出于性能的考虑，会将数据缓存，不是立刻写入磁盘。可以调用 force(true) 方法将文件内容和元数据（文件的权限等信息）立刻写入磁盘
```java
channel.force(true);
```

### 2、两个Channel传输数据

1. 创建一个 FileChannel，用于读取文件内容
2. 创建一个 FileChannel，用于写入文件内容
3. 调用 transferTo 方法，将一个 FileChannel 的数据写入另一个 FileChannel
```java
String FROM = "helloword/data.txt";
String TO = "helloword/to.txt";
try (FileChannel from = new FileInputStream(FROM).getChannel();
     FileChannel to = new FileOutputStream(TO).getChannel();) {
    from.transferTo(0, from.size(), to);
} catch (IOException e) {
    e.printStackTrace();
}
```

这种方式比直接操作文件流的效率更高，底层会利用操作系统的零拷贝进行优化。

一次最多传输 2G 的数据，如果要传输的数据量超过 2G，可以多次调用 transferTo 方法

```java
public class TestFileChannelTransferTo {
    public static void main(String[] args) {
        try (
                FileChannel from = new FileInputStream("data.txt").getChannel();
                FileChannel to = new FileOutputStream("to.txt").getChannel();
        ) {
            // 效率高，底层会利用操作系统的零拷贝进行优化
            long size = from.size();
            // left 变量代表还剩余多少字节
            for (long left = size; left > 0; ) {
                System.out.println("position:" + (size - left) + " left:" + left);
                left -= from.transferTo((size - left), left, to);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 3、Path
Path 是 Java 7 新增的类，用于表示文件路径；Paths 是 Path 的工具类，用于创建 Path 对象
```java
Path source = Paths.get("1.txt"); // 相对路径 使用 user.dir 环境变量来定位 1.txt

Path source = Paths.get("d:\\1.txt"); // 绝对路径 代表了  d:\1.txt

Path source = Paths.get("d:/1.txt"); // 绝对路径 同样代表了  d:\1.txt

Path projects = Paths.get("d:\\data", "projects"); // 代表了  d:\data\projects
```

- . 代表了当前路径
- .. 代表了上一级路径

例如目录结构如下
```shell
d:
    |- data
        |- projects
            |- a
            |- b
```

代码

```java
Path path = Paths.get("d:\\data\\projects\\a\\..\\b");
System.out.println(path);
System.out.println(path.normalize()); // 正常化路径
```

会输出

```shell
d:\data\projects\a\..\b
d:\data\projects\b
```

### 4、Files
Files 是一个工具类，提供了很多实用的方法，例如创建文件、删除文件、复制文件、重命名文件、获取文件的属性、获取文件的大小、判断文件是否存在等

- 判断文件是否存在
```java
Path path = Paths.get("helloword/data.txt");
System.out.println(Files.exists(path));
```

- 创建一级目录
```java
Path path = Paths.get("helloword/d1");
Files.createDirectory(path);
```
如果目录已存在，会抛异常 FileAlreadyExistsException  
不能一次创建多级目录，否则会抛异常 NoSuchFileException

- 创建多级目录
```java
Path path = Paths.get("helloword/d1/d2");
Files.createDirectories(path);
```

- 拷贝文件
```java
Path source = Paths.get("helloword/data.txt");
Path target = Paths.get("helloword/target.txt");

Files.copy(source, target);
```
如果文件已存在，会抛异常 FileAlreadyExistsException
> 如果希望用 source 覆盖掉 target，需要用 StandardCopyOption 来控制
> ```java
> Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
> ```

- 移动文件
```java
Path source = Paths.get("helloword/data.txt");
Path target = Paths.get("helloword/data.txt");

Files.move(source, target, StandardCopyOption.ATOMIC_MOVE);
```
StandardCopyOption.ATOMIC_MOVE 保证文件移动的原子性

- 删除文件
```java
Path target = Paths.get("helloword/target.txt");

Files.delete(target);
```
如果文件不存在，会抛异常 NoSuchFileException

- 删除目录
```java
Path target = Paths.get("helloword/d1");

Files.delete(target);
```
如果目录还有内容，会抛异常 DirectoryNotEmptyException

- 遍历目录文件
```java
public static void main(String[] args) throws IOException {
    Path path = Paths.get("C:\\Program Files\\Java\\jdk1.8.0_91");
    AtomicInteger dirCount = new AtomicInteger();
    AtomicInteger fileCount = new AtomicInteger();
    Files.walkFileTree(path, new SimpleFileVisitor<Path>(){
        @Override
        public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) 
            throws IOException {
            System.out.println(dir);
            dirCount.incrementAndGet();
            return super.preVisitDirectory(dir, attrs);
        }

        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) 
            throws IOException {
            System.out.println(file);
            fileCount.incrementAndGet();
            return super.visitFile(file, attrs);
        }
    });
    System.out.println(dirCount); // 133
    System.out.println(fileCount); // 1479
}
```

统计 jar 的数目

```java
Path path = Paths.get("C:\\Program Files\\Java\\jdk1.8.0_91");
AtomicInteger fileCount = new AtomicInteger();
Files.walkFileTree(path, new SimpleFileVisitor<Path>(){
    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) 
        throws IOException {
        if (file.toFile().getName().endsWith(".jar")) {
            fileCount.incrementAndGet();
        }
        return super.visitFile(file, attrs);
    }
});
System.out.println(fileCount); // 724
```

- 删除多级目录
```java
Path path = Paths.get("d:\\a");
Files.walkFileTree(path, new SimpleFileVisitor<Path>(){
    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) 
        throws IOException {
        Files.delete(file);
        return super.visitFile(file, attrs);
    }

    @Override
    public FileVisitResult postVisitDirectory(Path dir, IOException exc) 
        throws IOException {
        Files.delete(dir);
        return super.postVisitDirectory(dir, exc);
    }
});
```

⚠️ 删除很危险
> 删除是危险操作，确保要递归删除的文件夹没有重要内容

- 拷贝多级目录

```java
long start = System.currentTimeMillis();
String source = "D:\\Snipaste-1.16.2-x64";
String target = "D:\\Snipaste-1.16.2-x64aaa";

Files.walk(Paths.get(source)).forEach(path -> {
    try {
        String targetName = path.toString().replace(source, target);
        // 是目录
        if (Files.isDirectory(path)) {
            Files.createDirectory(Paths.get(targetName));
        }
        // 是普通文件
        else if (Files.isRegularFile(path)) {
            Files.copy(path, Paths.get(targetName));
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
});
long end = System.currentTimeMillis();
System.out.println(end - start);
```

## 四、网络编程

### 1、非阻塞 vs 阻塞
#### 阻塞
当线程调用某个方法时，该方法会立即返回，线程会等待某个事件发生，事件发生后，线程才会继续执行。
- 阻塞模式下，相关方法都会导致线程暂停
  - ServerSocketChannel.accept 会在没有连接建立时让线程暂停
  - SocketChannel.read 会在没有数据可读时让线程暂停
  - 阻塞的表现其实就是线程暂停了，暂停期间不会占用 cpu，但线程相当于闲置
- 单线程下，阻塞方法之间相互影响，几乎不能正常工作，需要多线程支持
- 但多线程下，有新的问题，体现在以下方面
  - 32 位 jvm 一个线程 320k，64 位 jvm 一个线程 1024k，如果连接数过多，必然导致 OOM，并且线程太多，反而会因为频繁上下文切换导致性能降低
  - 可以采用线程池技术来减少线程数和线程上下文切换，但治标不治本，如果有很多连接建立，但长时间 inactive，会阻塞线程池中所有线程，因此不适合长连接，只适合短连接

服务器端
```java
// 使用 nio 来理解阻塞模式, 单线程
// 0. ByteBuffer
ByteBuffer buffer = ByteBuffer.allocate(16);
// 1. 创建了服务器
ServerSocketChannel ssc = ServerSocketChannel.open();

// 2. 绑定监听端口
ssc.bind(new InetSocketAddress(8080));

// 3. 连接集合
List<SocketChannel> channels = new ArrayList<>();
while (true) {
    // 4. accept 建立与客户端连接， SocketChannel 用来与客户端之间通信
    log.debug("connecting...");
    SocketChannel sc = ssc.accept(); // 阻塞方法，线程停止运行
    log.debug("connected... {}", sc);
    channels.add(sc);
    for (SocketChannel channel : channels) {
        // 5. 接收客户端发送的数据
        log.debug("before read... {}", channel);
        channel.read(buffer); // 阻塞方法，线程停止运行
        buffer.flip();
        debugRead(buffer);
        buffer.clear();
        log.debug("after read...{}", channel);
    }
}
```
客户端
```java
SocketChannel sc = SocketChannel.open();
sc.connect(new InetSocketAddress("localhost", 8080));
System.out.println("waiting...");
```

debug模式启动，通过IDEA的 Evaluate Expression 功能通过 sc.write(StandardCharsets.UTF_8.encode("hello world")) 向服务器发送数据

#### 非阻塞

- 非阻塞模式下，相关方法都会不会让线程暂停
  - 在 ServerSocketChannel.accept 在没有连接建立时，会返回 null，继续运行
  - SocketChannel.read 在没有数据可读时，会返回 0，但线程不必阻塞，可以去执行其它 SocketChannel 的 read 或是去执行 ServerSocketChannel.accept
  - 写数据时，线程只是等待数据写入 Channel 即可，无需等 Channel 通过网络把数据发送出去
- 但非阻塞模式下，即使没有连接建立，和可读数据，线程仍然在不断运行，白白浪费了 cpu
- 数据复制过程中，线程实际还是阻塞的（AIO 改进的地方）

服务器端 ssc.configureBlocking(false) 设置非阻塞模式，客户端代码不变
```java
// 使用 nio 来理解非阻塞模式, 单线程
// 0. ByteBuffer
ByteBuffer buffer = ByteBuffer.allocate(16);
// 1. 创建了服务器
ServerSocketChannel ssc = ServerSocketChannel.open();
ssc.configureBlocking(false); // 非阻塞模式
// 2. 绑定监听端口
ssc.bind(new InetSocketAddress(8080));
// 3. 连接集合
List<SocketChannel> channels = new ArrayList<>();
while (true) {
    // 4. accept 建立与客户端连接， SocketChannel 用来与客户端之间通信
    SocketChannel sc = ssc.accept(); // 非阻塞，线程还会继续运行，如果没有连接建立，但sc是null
    if (sc != null) {
        log.debug("connected... {}", sc);
        sc.configureBlocking(false); // 非阻塞模式
        channels.add(sc);
    }
    for (SocketChannel channel : channels) {
        // 5. 接收客户端发送的数据
        int read = channel.read(buffer);// 非阻塞，线程仍然会继续运行，如果没有读到数据，read 返回 0
        if (read > 0) {
            buffer.flip();
            debugRead(buffer);
            buffer.clear();
            log.debug("after read...{}", channel);
        }
    }
}
```

#### 多路复用
单线程可以配合 Selector 完成对多个 Channel 可读写事件的监控，这称之为多路复用
- 多路复用仅针对网络 IO、普通文件 IO 没法利用多路复用
- 如果不用 Selector 的非阻塞模式，线程大部分时间都在做无用功，而 Selector 能够保证
  - 有可连接事件时才去连接
  - 有可读事件才去读取
  - 有可写事件才去写入
    - 限于网络传输能力，Channel 未必时时可写，一旦 Channel 可写，会触发 Selector 的可写事件

### 2、Selector
<div>
<mermaid-wrapper dsl="
flowchart TD
subgraph selector 版
thread --> selector
selector --> c1(channel)
selector --> c2(channel)
selector --> c3(channel)
end">
</mermaid-wrapper>
</div>

好处
- 一个线程配合 selector 就可以监控多个 channel 的事件，事件发生线程才去处理。避免非阻塞模式下所做无用功
- 让这个线程能够被充分利用 
- 节约了线程的数量 
- 减少了线程上下文切换

#### 创建
```java
Selector selector = Selector.open();
```

####  绑定(注册) Channel 事件
也称之为注册事件，绑定的事件 selector 才会关心
```java
channel.configureBlocking(false);
SelectionKey key = channel.register(selector, 绑定事件);
```
- channel 必须工作在非阻塞模式
- FileChannel 没有非阻塞模式，因此不能配合 selector 一起使用
- 绑定的事件类型可以有
  - connect - 客户端连接成功时触发
  - accept - 服务器端成功接受连接时触发
  - read - 数据可读入时触发，有因为接收能力弱，数据暂不能读入的情况
  - write - 数据可写出时触发，有因为发送能力弱，数据暂不能写出的情况

#### 监听 Channel 事件
可以通过下面三种方法来监听是否有事件发生，方法的返回值代表有多少 channel 发生了事件
- 方法1，阻塞直到绑定事件发生
```java
int count = selector.select();
```
- 方法2，阻塞直到绑定事件发生，或是超时（时间单位为 ms）
```java
int count = selector.select(long timeout);
```
- 方法3，不会阻塞，也就是不管有没有事件，立刻返回，自己根据返回值检查是否有事件
```java
int count = selector.selectNow();
```

#### 💡 select 何时不阻塞
> - 事件发生时 
>   - 客户端发起连接请求，会触发 accept 事件 
>   - 客户端发送数据过来，客户端正常、异常关闭时，都会触发 read 事件，另外如果发送的数据大于 buffer 缓冲区，会触发多次读取事件 
>   - channel 可写，会触发 write 事件 
>   - 在 linux 下 nio bug 发生时 
> - 调用 selector.wakeup()
> - 调用 selector.close()
> - selector 所在线程 interrupt

### 3、处理 accept 事件
客户端代码为
```java
public class Client {
    public static void main(String[] args) {
        try (Socket socket = new Socket("localhost", 8080)) {
            System.out.println(socket);
            socket.getOutputStream().write("world".getBytes());
            System.in.read();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

服务器端代码为
```java
@Slf4j
public class ChannelDemo6 {
    public static void main(String[] args) {
        try (ServerSocketChannel channel = ServerSocketChannel.open()) {
            channel.bind(new InetSocketAddress(8080));
            System.out.println(channel);
            Selector selector = Selector.open();
            channel.configureBlocking(false);
            channel.register(selector, SelectionKey.OP_ACCEPT);

            while (true) {
                // select 方法：没有事件发生，线程阻塞；有事件，线程才会恢复运行；在事件未处理时，它不会阻塞
                int count = selector.select();
                // int count = selector.selectNow();
                log.debug("select count: {}", count);
                // if(count <= 0) {
                  //  continue;
                // }

                // 获取所有事件
                Set<SelectionKey> keys = selector.selectedKeys();

                // 遍历所有事件，逐一处理；处理完毕需要删除，所以只能使用迭代器
                Iterator<SelectionKey> iter = keys.iterator();
                while (iter.hasNext()) {
                    SelectionKey key = iter.next();
                    // 判断事件类型
                    if (key.isAcceptable()) {
                        // 因为注册该 Selector 的是 ServerSocketChannel 类型的Channel
                        ServerSocketChannel c = (ServerSocketChannel) key.channel();
                        // 事件发生后要么处理，要么取消
                        SocketChannel sc = c.accept();
                        log.debug("{}", sc);
                    }
                    // 处理完毕，必须将事件移除
                    iter.remove();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

#### 💡 事件发生后能否不处理
> 事件发生后，要么处理，要么取消（cancel），不能什么都不做，否则下次该事件仍会触发，这是因为 nio 底层使用的是水平触发
> 
> **水平触发 与 边缘触发**
> 
> 1.水平触发（LT）
当被监控的文件描述符上有可读写事件发生时，会通知用户程序去读写，他会一直通知用户，如果这个描述符是用户不关心的，它每次都返回通知用户，则会导致用户对于关心的描述符的处理效率降低。
> 
> 复用型IO中的select和poll都是使用的水平触发模式。
> 
> 2.边缘触发（ET）
> 当被监控的文件描述符上有可读写事件发生时，会通知用户程序去读写，它只会通知用户进程一次，这需要用户一次把内容读取完，相当于水平触发，效率更高。如果用户一次没有读完数据，再次请求时，不会立即返回，需要等待下一次的新的数据到来时才会返回，这次返回的内容包括上次未取完的数据
> 
> epoll既支持水平触发也支持边缘触发，默认是水平触发。
>   
> 3.比较
> 水平触发是状态达到后，可以多次取数据。这种模式下要注意多次读写的情况下，效率和资源利用率情况。
> 
> 边缘触发数状态改变一次，取一次数据。这种模式下读写数据要注意一次是否能读写完成。
> 
> 4.ET模式带来的问题
> 因为只有当缓冲区中数据由无到有，由少变多时才会区读取数据，
> 所以一次要将缓冲区中的数据读完，否则剩下的数据可能就读不到了。
> 正常的读取数据时，我们若是要保证一次把缓冲区的数据读完，意为本次读被阻塞时即缓冲区中没有数据了，可是我们 epoll 服务器要处理多个用户的请求，read()不能被阻塞，所以采用非阻塞轮询的方式读取数据。
> 
> 若轮询的将数据读完，对方给我们发9.5k的数据，我们采取每次读取1k的方式进行轮询读取，在读完9k的时候，下一次我们读到的数据为0.5k，我们就知道缓冲区中数据已经读完了就停止本次轮询。
> 但还有一种情况，对方给我们发的数据为10k,我们采取每次读取1k的方式轮询的读取数据，当我们已经读取了10k的时候，并不知道有没有数据了，我们仍旧还要尝试读取数据，这时read()就被阻塞了。
>
> 5.epoll应用场景  
> （1） 适合用epoll的应用场景：对于连接特别多，活跃的连接特别少，这种情况等的时间特别久，典型的应用场景为一个需要处理上万的连接服务器，例如各种app的入口服务器，例如qq
>
> （2）不适合epoll的场景：连接比较少，数据量比较大，例如ssh
>
> epoll 的惊群问题：因为epoll 多用于 多个连接，只有少数活跃的场景，但是万一某一时刻，epoll 等的上千个文件描述符都就绪了，这时候epoll 要进行大量的I/O,此时压力太大。

### 4、处理 read 事件

```java

@Slf4j
public class ChannelDemo6 {
  public static void main(String[] args) {
    try (ServerSocketChannel channel = ServerSocketChannel.open()) {
      channel.bind(new InetSocketAddress(8080));
      System.out.println(channel);
      Selector selector = Selector.open();
      channel.configureBlocking(false);
      channel.register(selector, SelectionKey.OP_ACCEPT);

      while (true) {
        int count = selector.select();
        // int count = selector.selectNow();
        log.debug("select count: {}", count);
        // if (count <= 0) {
        //   continue;
        // }

        // 获取所有事件
        Set<SelectionKey> keys = selector.selectedKeys();

        // 遍历所有事件，逐一处理
        Iterator<SelectionKey> iter = keys.iterator();
        while (iter.hasNext()) {
          SelectionKey key = iter.next();
          // 判断事件类型
          if (key.isAcceptable()) {
            ServerSocketChannel c = (ServerSocketChannel) key.channel();
            // 必须处理
            SocketChannel sc = c.accept();
            sc.configureBlocking(false);
            sc.register(selector, SelectionKey.OP_READ);
            log.debug("连接已建立: {}", sc);
          } else if (key.isReadable()) {
            SocketChannel sc = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(128);
            int read = sc.read(buffer);
            if (read == -1) {
              key.cancel();
              sc.close();
            } else {
              buffer.flip();
              debug(buffer);
            }
          }
          // 处理完毕，必须将事件移除
          iter.remove();
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
```

#### 💡 为何要 iter.remove()

> 因为 select 在事件发生后，就会将相关的 key 放入 selectedKeys 集合，但不会在处理完后从 selectedKeys 集合中移除，需要我们自己编码删除。例如
> - 第一次触发了 ssckey 上的 accept 事件，没有移除 ssckey
> - 第二次触发了 sckey 上的 read 事件，但这时 selectedKeys 中还有上次的 ssckey ，在处理时因为没有真正的 serverSocket 连上了，c.accept()返回的是null，就会导致空指针异常

#### 💡 cancel 的作用

cancel 会取消注册在 selector 上的 channel，并从 keys 集合中删除 key 后续不会再监听事件

#### ⚠️ 不处理边界的问题

思考注释中两个问题，以 bio 为例，其实 nio 道理是一样的

```java
public class Server {
  public static void main(String[] args) throws IOException {
    ServerSocket ss = new ServerSocket(9000);
    while (true) {
      Socket s = ss.accept();
      InputStream in = s.getInputStream();
      // 这里这么写，有没有问题
      byte[] arr = new byte[4];
      while (true) {
        int read = in.read(arr);
        // 这里这么写，有没有问题
        if (read == -1) {
          break;
        }
        System.out.println(new String(arr, 0, read));
      }
    }
  }
}
```

客户端

```java
public class Client {
  public static void main(String[] args) throws IOException {
    Socket max = new Socket("localhost", 9000);
    OutputStream out = max.getOutputStream();
    out.write("hello".getBytes());
    out.write("world".getBytes());
    out.write("你好".getBytes());
    max.close();
  }
}
```

输出

```shell
hell
owor
ld�
�好
```

> 这里的输出结果并不是我们想要的，因为每次读取到的数据不一定是4个字节，所以读取到的数据不一定是完整的

#### 处理消息的边界

![](image/7.png)

- 一种思路是固定消息长度，数据包大小一样，服务器按预定长度读取，缺点是浪费带宽
- 另一种思路是按分隔符拆分，缺点是效率低
- TLV 格式，即 Type 类型、Length 长度、Value 数据，类型和长度已知的情况下，就可以方便获取消息大小，分配合适的 buffer，缺点是 buffer 需要提前分配，如果内容过大，则影响 server 吞吐量
  - Http 1.1 是 TLV 格式
  - Http 2.0 是 LTV 格式

<div>
<mermaid-wrapper dsl="
sequenceDiagram
客户端1 ->> 服务器: 发送 01234567890abcdef3333\r
服务器 ->> ByteBuffer1: 第一次read存入01234567890abcdef
服务器 ->> ByteBuffer2: 扩容
ByteBuffer1 ->> ByteBuffer2: 拷贝01234567890abcdef
服务器 ->> ByteBuffer2: 第二次read存入3333\r
ByteBuffer2 ->> ByteBuffer2: 01234567890abcdef3333\r
">
</mermaid-wrapper>
</div>

服务器端

```java
private static void split(ByteBuffer source) {
    source.flip();
    for (int i = 0; i < source.limit(); i++) {
        // 找到一条完整消息
        if (source.get(i) == '\n') {
            int length = i + 1 - source.position();
            // 把这条完整消息存入新的 ByteBuffer
            ByteBuffer target = ByteBuffer.allocate(length);
            // 从 source 读，向 target 写
            for (int j = 0; j < length; j++) {
                target.put(source.get());
            }
            debugAll(target);
        }
    }
    source.compact(); // 0123456789abcdef  position 16 limit 16
}

public static void main(String[] args) throws IOException {
    // 1. 创建 selector, 管理多个 channel
    Selector selector = Selector.open();
    ServerSocketChannel ssc = ServerSocketChannel.open();
    ssc.configureBlocking(false);
    // 2. 建立 selector 和 channel 的联系（注册）
    // SelectionKey 就是将来事件发生后，通过它可以知道事件和哪个channel的事件
    SelectionKey sscKey = ssc.register(selector, 0, null);
    // key 只关注 accept 事件
    sscKey.interestOps(SelectionKey.OP_ACCEPT);
    log.debug("sscKey:{}", sscKey);
    ssc.bind(new InetSocketAddress(8080));
    while (true) {
        // 3. select 方法, 没有事件发生，线程阻塞，有事件，线程才会恢复运行
        // select 在事件未处理时，它不会阻塞, 事件发生后要么处理，要么取消，不能置之不理
        selector.select();
        // 4. 处理事件, selectedKeys 内部包含了所有发生的事件
        Iterator<SelectionKey> iter = selector.selectedKeys().iterator(); // accept, read
        while (iter.hasNext()) {
            SelectionKey key = iter.next();
            // 处理key 时，要从 selectedKeys 集合中删除，否则下次处理就会有问题
            iter.remove();
            log.debug("key: {}", key);
            // 5. 区分事件类型
            if (key.isAcceptable()) { // 如果是 accept
                ServerSocketChannel channel = (ServerSocketChannel) key.channel();
                SocketChannel sc = channel.accept();
                sc.configureBlocking(false);
                ByteBuffer buffer = ByteBuffer.allocate(16); // attachment
                // 将一个 byteBuffer 作为附件关联到 selectionKey 上
                SelectionKey scKey = sc.register(selector, 0, buffer);
                scKey.interestOps(SelectionKey.OP_READ);
                log.debug("{}", sc);
                log.debug("scKey:{}", scKey);
            } else if (key.isReadable()) { // 如果是 read
                try {
                    SocketChannel channel = (SocketChannel) key.channel(); // 拿到触发事件的channel
                    // 获取 selectionKey 上关联的附件
                    ByteBuffer buffer = (ByteBuffer) key.attachment();
                    int read = channel.read(buffer); // 如果是正常断开，read 的方法的返回值是 -1
                    if(read == -1) {
                        key.cancel();
                    } else {
                        split(buffer);
                        // 需要扩容
                        if (buffer.position() == buffer.limit()) {
                            ByteBuffer newBuffer = ByteBuffer.allocate(buffer.capacity() * 2);
                            buffer.flip();
                            newBuffer.put(buffer); // 0123456789abcdef3333\n
                            key.attach(newBuffer);
                        }
                    }

                } catch (IOException e) {
                    e.printStackTrace();
                    key.cancel();  // 因为客户端断开了,因此需要将 key 取消（从 selector 的 keys 集合中真正删除 key）
                }
            }
        }
    }
}
```

客户端

```java
SocketChannel sc = SocketChannel.open();
sc.connect(new InetSocketAddress("localhost", 8080));
SocketAddress address = sc.getLocalAddress();
// sc.write(Charset.defaultCharset().encode("hello\nworld\n"));
sc.write(Charset.defaultCharset().encode("0123\n456789abcdef"));
sc.write(Charset.defaultCharset().encode("0123456789abcdef3333\n"));
System.in.read();
```

#### ByteBuffer 大小分配
- 每个 channel 都需要记录可能被切分的消息，因为 ByteBuffer 不能被多个 channel 共同使用，因此需要为每个 channel 维护一个独立的 ByteBuffer
- ByteBuffer 不能太大，比如一个 ByteBuffer 1Mb 的话，要支持百万连接就要 1Tb 内存，因此需要设计大小可变的 ByteBuffer
  - 一种思路是首先分配一个较小的 buffer，例如 4k，如果发现数据不够，再分配 8k 的 buffer，将 4k buffer 内容拷贝至 8k buffer，优点是消息连续容易处理，缺点是数据拷贝耗费性能，参考实现 [http://tutorials.jenkov.com/java-performance/resizable-array.html](http://tutorials.jenkov.com/java-performance/resizable-array.html)
  - 另一种思路是用多个数组组成 buffer，一个数组不够，把多出来的内容写入新的数组，与前面的区别是消息存储不连续解析复杂，优点是避免了拷贝引起的性能损耗

### 5、处理 write 事件
#### 一次无法写完例子
- 非阻塞模式下，无法保证把 buffer 中所有数据都写入 channel，因此需要追踪 write 方法的返回值（代表实际写入字节数）
- 用 selector 监听所有 channel 的可写事件，每个 channel 都需要一个 key 来跟踪 buffer，但这样又会导致占用内存过多，就有两阶段策略
  - 当消息处理器第一次写入消息时，才将 channel 注册到 selector 上
  - selector 检查 channel 上的可写事件，如果所有的数据写完了，就取消 channel 的注册
  - 如果不取消，会每次可写均会触发 write 事件

服务端代码
```java
public class WriteServer {

    public static void main(String[] args) throws IOException {
        ServerSocketChannel ssc = ServerSocketChannel.open();
        ssc.configureBlocking(false);
        ssc.bind(new InetSocketAddress(8080));

        Selector selector = Selector.open();
        ssc.register(selector, SelectionKey.OP_ACCEPT);

        while(true) {
            selector.select();

            Iterator<SelectionKey> iter = selector.selectedKeys().iterator();
            while (iter.hasNext()) {
                SelectionKey key = iter.next();
                iter.remove();
                if (key.isAcceptable()) {
                    SocketChannel sc = ssc.accept();
                    sc.configureBlocking(false);
                    SelectionKey sckey = sc.register(selector, SelectionKey.OP_READ);
                    // 1. 向客户端发送内容
                    StringBuilder sb = new StringBuilder();
                    for (int i = 0; i < 3000000; i++) {
                        sb.append("a");
                    }
                    ByteBuffer buffer = Charset.defaultCharset().encode(sb.toString());
                    int write = sc.write(buffer);
                    // 3. write 表示实际写了多少字节
                    System.out.println("实际写入字节:" + write);
                    // 4. 如果有剩余未读字节，才需要关注写事件
                    if (buffer.hasRemaining()) {
                        // read 1  write 4
                        // 在原有关注事件的基础上，多关注 写事件
                        sckey.interestOps(sckey.interestOps() + SelectionKey.OP_WRITE);
                        // 把 buffer 作为附件加入 sckey
                        sckey.attach(buffer);
                    }
                } else if (key.isWritable()) {
                    ByteBuffer buffer = (ByteBuffer) key.attachment();
                    SocketChannel sc = (SocketChannel) key.channel();
                    int write = sc.write(buffer);
                    System.out.println("实际写入字节:" + write);
                    if (!buffer.hasRemaining()) { // 写完了
                        key.interestOps(key.interestOps() - SelectionKey.OP_WRITE);
                        key.attach(null);
                    }
                }
            }
        }
    }
```

客户端代码

```java
public class WriteClient {
    public static void main(String[] args) throws IOException {
        Selector selector = Selector.open();
        SocketChannel sc = SocketChannel.open();
        sc.configureBlocking(false);
        sc.register(selector, SelectionKey.OP_CONNECT | SelectionKey.OP_READ);
        sc.connect(new InetSocketAddress("localhost", 8080));
        int count = 0;
        while (true) {
            selector.select();
            Iterator<SelectionKey> iter = selector.selectedKeys().iterator();
            while (iter.hasNext()) {
                SelectionKey key = iter.next();
                iter.remove();
                if (key.isConnectable()) {
                    System.out.println(sc.finishConnect());
                } else if (key.isReadable()) {
                    ByteBuffer buffer = ByteBuffer.allocate(1024 * 1024);
                    count += sc.read(buffer);
                    buffer.clear();
                    System.out.println(count);
                }
            }
        }
    }
}
```

#### 💡 write 为何要取消
只要向 channel 发送数据时，socket 缓冲可写，这个事件会频繁触发，因此应当只在 socket 缓冲区写不下时再关注可写事件，数据写完之后再取消关注

### 6、更进一步

#### 💡 利用多线程优化
> 现在都是多核 cpu，设计时要充分考虑别让 cpu 的力量被白白浪费
前面的代码只有一个选择器，没有充分利用多核 cpu，如何改进呢？

分两组选择器
- 单线程配一个选择器，专门处理 accept 事件
- 创建 cpu 核心数的线程，每个线程配一个选择器，轮流处理 read和write 事件

服务端代码
```java
public class ChannelDemo7 {
    public static void main(String[] args) throws IOException {
      ServerSocketChannel ssc = ServerSocketChannel.open();
      ssc.bind(new InetSocketAddress(8080));
      ssc.configureBlocking(false);
      boss = Selector.open();
      SelectionKey ssckey = ssc.register(boss, 0, null);
      ssckey.interestOps(SelectionKey.OP_ACCEPT);
      WorkerEventLoop[] workers = new WorkerEventLoop[2];
      for (int i = 0; i < workerEventLoops.length; i++) {
        workers[i] = new WorkerEventLoop(i);
      }
      while (true) {
        try {
          boss.select();
          Iterator<SelectionKey> iter = boss.selectedKeys().iterator();
          while (iter.hasNext()) {
            SelectionKey key = iter.next();
            iter.remove();
            if (key.isAcceptable()) {
              ServerSocketChannel c = (ServerSocketChannel) key.channel();
              SocketChannel sc = c.accept();
              sc.configureBlocking(false);
              log.debug("{} connected", sc.getRemoteAddress());
              workers[index.getAndIncrement() % workers.length].register(sc);
            }
          }
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }

    @Slf4j
    static class WorkerEventLoop implements Runnable {
        private Selector worker;
        private volatile boolean start = false;
        private int index;

        private final ConcurrentLinkedQueue<Runnable> tasks = new ConcurrentLinkedQueue<>();

        public WorkerEventLoop(int index) {
            this.index = index;
        }

        public void register(SocketChannel sc) throws IOException {
            if (!start) {
                worker = Selector.open();
                new Thread(this, "worker-" + index).start();
                start = true;
            }
            tasks.add(() -> {
                try {
                    SelectionKey sckey = sc.register(worker, 0, null);
                    sckey.interestOps(SelectionKey.OP_READ);
                    worker.selectNow();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
            worker.wakeup();
        }

        @Override
        public void run() {
            while (true) {
                try {
                    worker.select();
                    Runnable task = tasks.poll();
                    if (task != null) {
                        task.run();
                    }
                    Set<SelectionKey> keys = worker.selectedKeys();
                    Iterator<SelectionKey> iter = keys.iterator();
                    while (iter.hasNext()) {
                        SelectionKey key = iter.next();
                        if (key.isReadable()) {
                            SocketChannel sc = (SocketChannel) key.channel();
                            ByteBuffer buffer = ByteBuffer.allocate(128);
                            try {
                                int read = sc.read(buffer);
                                if (read == -1) {
                                    key.cancel();
                                    sc.close();
                                } else {
                                    buffer.flip();
                                    log.debug("{} message:", sc.getRemoteAddress());
                                    debugAll(buffer);
                                }
                            } catch (IOException e) {
                                e.printStackTrace();
                                key.cancel();
                                sc.close();
                            }
                        }
                        iter.remove();
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

#### 💡 如何拿到 cpu 个数
> - Runtime.getRuntime().availableProcessors() 如果工作在 docker 容器下，因为容器不是物理隔离的，会拿到物理 cpu 个数，而不是容器申请时的个数
> - 这个问题直到 jdk 10 才修复，使用 jvm 参数 UseContainerSupport 配置， 默认开启

### 7、UDP
- UDP 是无连接的，client 发送数据不会管 server 是否开启
- server 这边的 receive 方法会将接收到的数据存入 byte buffer，但如果数据报文超过 buffer 大小，多出来的数据会被默默抛弃

首先启动服务器端
```java
public class UdpServer {
    public static void main(String[] args) {
        try (DatagramChannel channel = DatagramChannel.open()) {
            channel.socket().bind(new InetSocketAddress(9999));
            System.out.println("waiting...");
            ByteBuffer buffer = ByteBuffer.allocate(32);
            channel.receive(buffer);
            buffer.flip();
            debug(buffer);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

运行客户端
```java
public class UdpClient {
    public static void main(String[] args) {
        try (DatagramChannel channel = DatagramChannel.open()) {
            ByteBuffer buffer = StandardCharsets.UTF_8.encode("hello");
            InetSocketAddress address = new InetSocketAddress("localhost", 9999);
            channel.send(buffer, address);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

接下来服务器端输出

```shell
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 68 65 6c 6c 6f                                  |hello           |
+--------+-------------------------------------------------+----------------+

```