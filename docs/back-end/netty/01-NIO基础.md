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

<div style="margin-top: 10px;">
<mermaid>
{{`
flowchart TB
     thread1 --> socket1
     thread2 --> socket2
     thread3 --> socket3
`}}
</mermaid>
</div>

⚠️ 多线程版缺点
- 内存占用高（创建大量线程）
- 线程切换开销大
- 只适合连接数少的场景

#### 线程池版设计

<div style="margin-top: 10px;">
<mermaid>
{{`
flowchart TB
   thread1 --> socket1
   thread1 .-> socket3
   thread2 --> socket2
   thread2 .-> socket4
`}}
</mermaid>
</div>

⚠️ 线程池版缺点
- 阻塞模式下，线程仅能处理一个socket连接
- 仅适合短连接的场景

#### Selector版设计

Selector的作用就是配合一个线程来管理多个Channel，获取这些Channel上发生的事件，这些Channel工作在非阻塞模式下，不会让线程吊死在一个Channel上。适合连接数特别多，但是每个连接的流量都比较小的场景。

<div style="margin-top: 10px;">
<mermaid>
{{`
flowchart TB
  thread --> selector
  selector --> channel1
  selector --> channel2
  selector --> channel3
`}}
</mermaid>
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

### 1、ByteBuffer的正确使用姿势

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
