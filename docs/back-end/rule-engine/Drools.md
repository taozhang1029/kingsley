# Drools实战

## 一、Drools简介

Drools 是一款由JBoss组织提供的基于 Java 语言编写的开源规则引擎，可以将复杂且多变的业务规则从硬编码中解放出来，以规则脚本的形式存放在文件或特定的存储介质中（例如存放在数据库中），使用 Rete 算法对所编写的规则求值。

[Drools官网](https://drools.org/)  
[Drools源码](https://github.com/kiegroup/drools)

Drools 被分为两个主要的部分：编译和运行时。编译是将规则描述文件按 ANTLR 3 语法进行解析，对语法进行正确性的检查，然后产生一种中间结构“descr”，descr 用 AST 来描述规则。目前，Drools 支持四种规则描述文件，分别是：drl 文件、 xls 文件、brl 文件和 dsl 文件，其中，常用的描述文件是 drl 文件和 xls 文件，而 xls 文件更易于维护，更直观，更为被业务人员所理解。运行时是将 AST传到 PackageBuilder，由 PackagBuilder来产生 RuleBase，它包含了一个或多个 Package 对象。

##  二、Drools快速入门

在项目中使用Drools时，既可以单独使用，也可以整合Spring使用。如果单独使用只需要导入如下maven坐标即可：

```xml
<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-compiler</artifactId>
  	<!-- 最新版本 8.41.0.Final, 8.x 需要java 55版本，即jdk11 -->
    <version>${drools-version}</version>
</dependency>
```

Drools API开发步骤如下：

```mermaid
graph TD;
获取KieServices --> 获取KieContainer;
获取KieContainer --> KieSession;
KieSession --> Insert_fact;
Insert_fact --> 触发规则;
触发规则 --> 关闭KieSession;
```

快速入门案例：

1、创建maven工程，导入 drools-compiler 依赖，本案例中使用 7.32.0.Final

2、在recourse目录下新建 META-INF 目录，创建 kmodule.xml 文件（即 recourse/META-INF/kmodule.xml）

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<kmodule xmlns="http://www.drools.org/xsd/kmodule">
    <!--
        name: 指定kbase的名称，可以任意，但是需要唯一
        packages: 指定规则文件的目录，需要根据实际的项目结构来指定，否则无法加载到对应的规则文件
        default: 指定kbase的默认值，true表示默认，false表示非默认
    -->
    <kbase name="kbase1" packages="rules" default="true">
        <!--
            name: 指定session的名称，可以任意，但是需要唯一
            ksession: 指定session是否为默认
        -->
        <ksession name="ksession-rule" default="true"/>
    </kbase>
</kmodule>
```

3、在recourse目录下新建 rules 目录，创建一个 bookDiscount.drl 规则文件

```java
// package 后面的只是个逻辑概念，不是一定与规则文件所在目录相同，甚至可以写成abc
package rules;

// 引入用于Java与Drools通信的实体
import com.kingsley.entity.Order
import java.math.BigDecimal;

dialect  "mvel"

// 规则名可以任意，只要多个规则之间唯一即可
// 所购图书总价在100元以下的没有优惠
rule "bookDiscount1"
    when
        $order:Order(originalPrice < 100) // 模式匹配，到规则引擎中（工作内存）查找满足条件的Order对象，赋值给$order（固定写法）
    then
        $order.setActualPrice($order.getOriginalPrice());
        System.out.println("命中规则1，图书的原始价格为: " + $order.originalPrice);
end

// 所购图书总价在100元-200元之间，优惠20元
rule "bookDiscount2"
    when
        $order:Order(originalPrice >= 100 && originalPrice < 200) // 模式匹配，到规则引擎中（工作内存）查找满足条件的Order对象，赋值给$order（固定写法）
    then
        $order.setActualPrice($order.getOriginalPrice().subtract(BigDecimal.valueOf(20)));
        System.out.println("命中规则2，图书的原始价格为: " + $order.originalPrice);
end

// 所购图书总价在200元-300元之间，优惠50元
rule "bookDiscount3"
    when
        $order:Order(originalPrice >= 200 && originalPrice < 300) // 模式匹配，到规则引擎中（工作内存）查找满足条件的Order对象，赋值给$order（固定写法）
    then
        $order.setActualPrice($order.getOriginalPrice().subtract(BigDecimal.valueOf(50)));
        System.out.println("命中规则3，图书的原始价格为: " + $order.originalPrice);
end


// 所购图书总价在300元以上，优惠100元
rule "bookDiscount4"
    when
        $order:Order(originalPrice >= 300) // 模式匹配，到规则引擎中（工作内存）查找满足条件的Order对象，赋值给$order（固定写法）
    then
        $order.setActualPrice($order.getOriginalPrice().subtract(BigDecimal.valueOf(100)));
        System.out.println("命中规则4，图书的原始价格为: " + $order.originalPrice);
end

```

4、编写测试代码，这里使用junit单元测试

```java
package com.kingsley.drools;

import com.kingsley.entity.Order;
import org.junit.Test;
import org.kie.api.KieServices;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;

import java.math.BigDecimal;

/**
 * 图书优惠Drools单元测试
 *
 * @author kingsley
 * @date 2024/1/23 00:42
 */
public class BookDiscountTest {

    @Test
    public void testMatchRule1() {
        commonest(BigDecimal.TEN);
    }

    @Test
    public void testMatchRule2() {
        commonest(BigDecimal.TEN.multiply(BigDecimal.TEN));
    }

    @Test
    public void testMatchRule3() {
        commonest(BigDecimal.TEN.multiply(BigDecimal.TEN).multiply(BigDecimal.valueOf(2)));
    }

    @Test
    public void testMatchRule4() {
        commonest(BigDecimal.TEN.multiply(BigDecimal.TEN).multiply(BigDecimal.valueOf(5)));
    }

    private void commonest(BigDecimal originalPrice) {
        // 获取KieServices
        KieServices kieServices = KieServices.get();
        // 获取KieContainer容器对象
        KieContainer kieContainer = kieServices.newKieClasspathContainer();
        // 从容器中获取默认Session对象，kmodule.xml 配置的 ksession-rule 设置成了默认，所以使用无参方法能获取到这个默认session
        KieSession session = kieContainer.newKieSession();

        // 创建fact对象
        Order order = new Order();
        order.setOriginalPrice(originalPrice);

        // insert fact
        session.insert(order);

        // 触发（激活）规则，由Drools框架自动进行规则匹配，如果规则匹配成功则执行规则中配置的逻辑
        session.fireAllRules();

        // 关闭session
        session.dispose();

        System.out.println("优惠后的实际价格为：" + order.getActualPrice());
    }
}
```

## 三、Drools规则引擎的构成

Drools规则引擎由三部分构成：
1. **Working Memory(工作内存)**： drools会从Working Memory中获取数据并和规则文件中定义的规则进行匹配，所以我们开发的应用程序只需要将我们的数据插入到Working Memory中，
    例如在测试代码中，我们通过session.insert(order)方法将Order对象插入到Working Memory中。
2. **Rule Base(规则库)**：我们在规则文件中定义的规则都会被加载到规则库中
3. **Inference Engine(推理引擎)**

其中Inference Engine又包括三部分：
1. **Pattern Matcher(匹配器)**：将Rule Base中的规则和Working Memory中的数据（也称为Fact）进行匹配，如果匹配成功，则将匹配到的规则加入到Agenda中
2. **Agenda**(议程)：用于存放通过Pattern Matcher匹配到的规则
3. **Execution Engine(执行引擎)**：执行引擎会从议程中取出匹配到的规则，并执行规则中的then部分的逻辑

> Fact：事实，是规则引擎中数据的载体，通常是一个对象，是业务代码与规则引擎之间的桥梁，规则引擎通过Fact来获取数据，然后通过规则来处理Fact。

如下是Drools规则引擎的结构图：

![Drools规则引擎的结构图](./Drools.png)

规则引擎执行过程：
1. 将初始数据Fact插入到Working Memory中
2. 使用Pattern Matcher匹配规则和Fact
3. 如果执行规则存在冲突，即同时存在多个规则匹配到Fact，则将冲突的规则放入冲突集合
4. 解决冲突，将激活的规则加入到Agenda中
5. 执行Agenda中的规则，重复步骤2-5，直到执行完所有规则

## 四、Drools基础语法

### 1、规则文件构成

在使用Drools时，非常重要的一个工作就是编写规则文件，规则文件的后缀名通常为.drl，drl是Drools Rule Language的缩写，一套完整的Drools规则文件内容构成如下：

| 关键字      | 描述                              |
|----------|---------------------------------|
| package  | 包名，只限于逻辑上的管理，同一包名下的查询或者函数可以直接调用 |
| import   | 用于导入类或者静态方法                     |
| global   | 全局变量                            |
| function | 自定义函数                           |
| query    | 查询                              |
| rule end | 规则体的开始和结束标志符                    |

Drools支持的规则文件除了.drl外，还有Excel文件类型的

### 2、规则体语法结构

规则体是Drools规则文件的重要部分，是进行业务规则判断、处理业务结果的部分，规则体语法结构如下：
```java
rule "规则名称"
    attributes
    when
        LHS
    then
        RHS
end
```

**rule**：关键字，规则体的开始标志符，后面跟规则名称  
**attributes**：规则属性，是rule与when之间的参数，为可选项  
**when**：关键字，规则体的条件部分，用于判断规则是否生效，如果条件成立，则执行then部分的逻辑  
**LHS**（Left Hand Side）：左部条件，是when部分的条件，用于判断规则是否生效，它由零个或多个条件元素组成，如果LHS为空，则它将被视为true。如果条件成立，则执行then部分的逻辑  
**then**：关键字，规则体的处理部分，用于处理规则生效后的结果  
**RHS**（Right Hand Side）：是规则的后果或行动部分  
**end**：关键字，规则体的结束标志符，表示规则体的结束，必须与rule关键字配对使用

### 3、注释
Drools支持两种注释，一种是单行注释，另一种是多行注释，两种注释的语法与Java类中使用一致，如下：
```java
// 单行注释
rule "rule1"
    when
    then
        System.out.println("Hello World!");
end


/*
多行注释
*/
rule "rule2"
    when
    then
        System.out.println("Hello World!");
end
```

### 4、Pattern模式匹配
Pattern模式匹配的语法如下：绑定变量名：Object(Field约束)
其中绑定变量名可以省略，通常绑定变量名的命名一版建议以$开头，如果定义了绑定变量名，那么在then部分的逻辑中就可以通过绑定变量名来操作对应的Fact对象。
Field约束部分是需要返回true或者false的0个或多个条件表达式。

```java
// 所购图书总价在200元-300元之间，优惠50元
rule "bookDiscount3"
    when
        $order:Order(originalPrice >= 200 && originalPrice < 300) // 模式匹配，到规则引擎中（工作内存）查找满足条件的Order对象，赋值给$order（固定写法）
    then
        $order.setActualPrice($order.getOriginalPrice().subtract(BigDecimal.valueOf(50)));
        System.out.println("命中规则3，图书的原始价格为: " + $order.originalPrice);
end
```

通过上面的例子我们可以知道  
1、工作内存中必须存在Order这种类型的Fact对象——类型约束  
2、Fact对象的originalPrice必须大于等于200元——属性约束    
3、Fact对象的originalPrice必须小于300元——属性约束  
以上条件必须同时满足，当前规则才有可能被激活

**绑定变量即可用在对象上，也可以用在对象的属性上**
```java
// 所购图书总价在200元-300元之间，优惠50元
rule "bookDiscount3"
    when
        $order:Order($op:originalPrice >= 200 && originalPrice < 300) 
    then
        $order.setActualPrice($order.getOriginalPrice().subtract(BigDecimal.valueOf(50)));
        System.out.println("命中规则3，图书的原始价格为: " + $op);
end
```

**LHS部分还可以定义多个Pattern模式匹配，多个Pattern模式匹配可以使用逻辑运算符 and 或者 or 进行连接，也可以不写，默认是and。**
```java
// 所购图书总价在200元-300元之间，优惠50元
rule "bookDiscount3"
    when
        $order:Order($op:originalPrice >= 200 && originalPrice < 300) and
        $customer:Customer(age >= 18 && gender == 'male')
    then
        $order.setActualPrice($order.getOriginalPrice().subtract(BigDecimal.valueOf(50)));
        System.out.println("命中规则3，图书的原始价格为: " + $op);
end
```

### 5、比较操作符
Drools支持的比较操作符如下：

| 操作符          | 描述                               |
|--------------|----------------------------------|
| ==           | 等于                               |
| !=           | 不等于                              |
| <            | 小于                               |
| <=           | 小于等于                             |
| \>           | 大于                               |
| >=           | 大于等于                             |
| contains     | 检查Fact对象的属性值是否包含指定的值             |
| not contains | 检查Fact对象的属性值是否不包含指定的值            |
| memberOf     | 检查Fact对象的属性值是否在一个或多个集合中          |
| not memberOf | 检查Fact对象的属性值是否不在一个或多个集合中         |
| matches      | 检查Fact对象的属性值是否与提供的标准Java正则表达式匹配  |
| not matches  | 检查Fact对象的属性值是否与提供的标准Java正则表达式不匹配 |

语法：前6个操作符和Java的比较操作符一致  
- **contains** ｜ **not contains** 语法结构  
Object(Field[Collection/Array] contains value)
Object(Field[Collection/Array] not contains value)

- **memberOf** ｜ **not memberOf** 语法结构  
Object(Field memberOf value[Collection/Array])
Object(Field not memberOf value[Collection/Array])

- **matches** ｜ **not matches** 语法结构  
Object(Field matches "正则表达式")
Object(Field not matches "正则表达式")

### 6、执行指定规则

使用Drools框架提供的规则过滤器，可以只执行指定的规则，不执行其他规则。
```java

    /**
     * Fire all Matches on the Agenda
     *
     * @param agendaFilter filters the Matches that may fire
     * @return returns the number of rules fired
     */
    int fireAllRules(AgendaFilter agendaFilter);
    
```
![img.png](img.png)

### 7、关键字
Drools的关键字分为：硬关键字和软关键字。
**硬关键字**：硬关键字是我们在规则文件中 定义包名 或者 规则名 时明确不能使用的，硬关键字一旦使用，编译器会报错。
**软关键字**：软关键字虽然可以使用的，但是不建议使用。
硬关键字包括：true、false、null
软关键字包括：lock-on-active、date-effective、date-expires、no-loop、auto-focus、activation-group、agenda-group、entry-point、duration、
package、import、dialect、salience、enabled、attributes、rule、extend、when、then、template、query、declare、function、global、
eval、not、in、or、and、exists、forall、accumulate、from、collect、action、reverse、result、end、over、init

### 8、Drools内置方法



