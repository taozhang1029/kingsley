---
title: 1. 反转链表
---

<AlgorithmQuestion title="反转链表" level="1" 
url="https://www.nowcoder.com/practice/75e878df47f24fdc9dc3e400ec6058ca?tpId=295&tqId=23286&ru=/exam/oj&qru=/ta/format-top101/question-ranking&sourceUrl=%2Fexam%2Foj"
examples="[
{
'input': '{1,2,3}',
'output': '{3,2,1}'
},
{
'input': '{}',
'output': '{}',
'description': '空链表则输出空'
}]">

<div>
给定一个单链表的头结点pHead(该头节点是有值的，比如在下图，它的val是1)，长度为n，反转该链表后，返回新链表的表头。

如当输入链表{1,2,3}时，
经反转后，原链表变为{3,2,1}，所以对应的输出为{3,2,1}。
以上转换过程如下图所示：

<img src="https://uploadfiles.nowcoder.com/images/20211014/423483716_1634206291971/4A47A0DB6E60853DEDFCFDF08A5CA249" style="max-height: 300px">
</div>
<template #tips>
<ul>
<li>数据范围：0≤n≤1000</li>
<li>
要求：空间复杂度O(1)，时间复杂度 O(n) 。
</li>
</ul>
</template>
</AlgorithmQuestion>

题解

```java
import java.util.*;

/*
 * public class ListNode {
 *   int val;
 *   ListNode next = null;
 *   public ListNode(int val) {
 *     this.val = val;
 *   }
 * }
 */

public class Solution {
    /**
     * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
     *
     * 
     * @param head ListNode类 
     * @return ListNode类
     */
    public ListNode ReverseList (ListNode head) {
        // write code here
    }
}
```
