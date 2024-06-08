import{_ as t,r as e,o,c,d as l,w as s,e as i,a as n,b as a}from"./app-C8q1F3U4.js";const u={},k=n("div",null,[a(" 给定一个二叉搜索树, 找到该树中两个指定节点的最近公共祖先。 "),n("a",{href:"https://baike.baidu.com/item/%E6%9C%80%E8%BF%91%E5%85%AC%E5%85%B1%E7%A5%96%E5%85%88/8918834?fr=aladdin",target:"_blank"},"百度百科"),a(" 中最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）。” 例如，给定如下二叉搜索树: root = [6,2,8,0,4,7,9,null,null,3,5] "),n("img",{src:"https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2018/12/14/binarysearchtree_improved.png"})],-1),r=n("ul",null,[n("li",null,"所有节点的值都是唯一的。"),n("li",null,"p、q 为不同节点且均存在于给定的二叉搜索树中。")],-1),d=i(`<p>我的题解</p><p>解答用时 27m0s， 执行耗时 6ms 击败 75.22% 使用 Java 的用户， 消耗内存 43.86MB 击败 42.28% 使用 Java 的用户</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Definition for a binary tree node.
 * public class TreeNode <span class="token punctuation">{</span>
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) <span class="token punctuation">{</span> val = x; <span class="token punctuation">}</span>
 * <span class="token punctuation">}</span>
 */</span>

<span class="token keyword">class</span> <span class="token class-name">Solution</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token class-name">TreeNode</span> <span class="token function">lowestCommonAncestor</span><span class="token punctuation">(</span><span class="token class-name">TreeNode</span> root<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> p<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> q<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 特殊情况处理</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token punctuation">.</span>left <span class="token operator">==</span> q <span class="token operator">||</span> p<span class="token punctuation">.</span>right <span class="token operator">==</span> q<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> p<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>q<span class="token punctuation">.</span>left <span class="token operator">==</span> p <span class="token operator">||</span> q<span class="token punctuation">.</span>right <span class="token operator">==</span> p<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> q<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token comment">// 排序，保证 find 方法中满足 p.val &lt; q.val，方便处理</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token punctuation">.</span>val <span class="token operator">&lt;</span> q<span class="token punctuation">.</span>val<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">find</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> p<span class="token punctuation">,</span> q<span class="token punctuation">,</span> root<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">find</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> q<span class="token punctuation">,</span> p<span class="token punctuation">,</span> root<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">private</span> <span class="token class-name">TreeNode</span> <span class="token function">find</span><span class="token punctuation">(</span><span class="token class-name">TreeNode</span> root<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> p<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> q<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> posible<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 一边一个的场景</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token punctuation">.</span>val <span class="token operator">&lt;=</span> root<span class="token punctuation">.</span>val <span class="token operator">&amp;&amp;</span> q<span class="token punctuation">.</span>val <span class="token operator">&gt;=</span> root<span class="token punctuation">.</span>val<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> root<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token comment">// 小的刚好是当前节点，大的在右边的场景</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>p <span class="token operator">==</span> root<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 如果大的和小的在同一侧，则直接返回当前节点</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>posible<span class="token punctuation">.</span>val <span class="token operator">&gt;</span> q<span class="token punctuation">.</span>val<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">return</span> root<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token comment">// 不在一侧，则之前找到的祖先为最近公共祖先</span>
            <span class="token keyword">return</span> posible<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token comment">// 大的刚好是当前节点，小的在左边的场景</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>p <span class="token operator">==</span> root<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 如果大的和小的在同一侧，则直接返回当前节点</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>posible<span class="token punctuation">.</span>val <span class="token operator">&lt;</span> q<span class="token punctuation">.</span>val<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">return</span> root<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token comment">// 不在一侧，则之前找到的祖先为最近公共祖先</span>
            <span class="token keyword">return</span> posible<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token comment">// 都在左边的场景，继续往左找</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>root<span class="token punctuation">.</span>val <span class="token operator">&gt;</span> q<span class="token punctuation">.</span>val<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token function">find</span><span class="token punctuation">(</span>root<span class="token punctuation">.</span>left<span class="token punctuation">,</span> p<span class="token punctuation">,</span> q<span class="token punctuation">,</span> root<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token comment">// 至剩下 p.val &gt; root.val，即都在右边的场景了，继续往右找</span>
        <span class="token keyword">return</span> <span class="token function">find</span><span class="token punctuation">(</span>root<span class="token punctuation">.</span>right<span class="token punctuation">,</span> p<span class="token punctuation">,</span> q<span class="token punctuation">,</span> root<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="方法一-两次遍历" tabindex="-1"><a class="header-anchor" href="#方法一-两次遍历"><span>方法一：两次遍历</span></a></h4><p>注意到题目中给出的是一棵「二叉搜索树」，因此我们可以快速地找出树中的某个节点以及从根节点到该节点的路径，例如我们需要找到节点 p：</p><ul><li><p>我们从根节点开始遍历；</p></li><li><p>如果当前节点就是 p，那么成功地找到了节点；</p></li><li><p>如果当前节点的值大于 p 的值，说明 p 应该在当前节点的左子树，因此将当前节点移动到它的左子节点；</p></li><li><p>如果当前节点的值小于 p 的值，说明 p 应该在当前节点的右子树，因此将当前节点移动到它的右子节点。</p></li></ul><p>对于节点 q 同理。在寻找节点的过程中，我们可以顺便记录经过的节点，这样就得到了从根节点到被寻找节点的路径。</p><p>当我们分别得到了从根节点到 p 和 q 的路径之后，我们就可以很方便地找到它们的最近公共祖先了。显然，p 和 q 的最近公共祖先就是从根节点到它们路径上的「分岔点」，也就是最后一个相同的节点。 因此，如果我们设从根节点到 p 的路径为数组 path_p，从根节点到 q 的路径为数组 path_q，那么只要找出最大的编号 i，其满足</p><div class="language-textmate line-numbers-mode" data-ext="textmate" data-title="textmate"><pre class="language-textmate"><code>path_p[i]=path_q[i] 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>那么对应的节点就是「分岔点」，即 p 和 q 的最近公共祖先就是 path_p[i] 或 path_q[i]。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">class</span> <span class="token class-name">Solution</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token class-name">TreeNode</span> <span class="token function">lowestCommonAncestor</span><span class="token punctuation">(</span><span class="token class-name">TreeNode</span> root<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> p<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> q<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">TreeNode</span><span class="token punctuation">&gt;</span></span> path_p <span class="token operator">=</span> <span class="token function">getPath</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> p<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">TreeNode</span><span class="token punctuation">&gt;</span></span> path_q <span class="token operator">=</span> <span class="token function">getPath</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> q<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">TreeNode</span> ancestor <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> path_p<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> i <span class="token operator">&lt;</span> path_q<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token operator">++</span>i<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>path_p<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span> <span class="token operator">==</span> path_q<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                ancestor <span class="token operator">=</span> path_p<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">break</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> ancestor<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">TreeNode</span><span class="token punctuation">&gt;</span></span> <span class="token function">getPath</span><span class="token punctuation">(</span><span class="token class-name">TreeNode</span> root<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> target<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">TreeNode</span><span class="token punctuation">&gt;</span></span> path <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">TreeNode</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">TreeNode</span> node <span class="token operator">=</span> root<span class="token punctuation">;</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span>node <span class="token operator">!=</span> target<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            path<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>target<span class="token punctuation">.</span>val <span class="token operator">&lt;</span> node<span class="token punctuation">.</span>val<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                node <span class="token operator">=</span> node<span class="token punctuation">.</span>left<span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                node <span class="token operator">=</span> node<span class="token punctuation">.</span>right<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        path<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> path<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="方法二-一次遍历" tabindex="-1"><a class="header-anchor" href="#方法二-一次遍历"><span>方法二：一次遍历</span></a></h4><p>在方法一中，我们对从根节点开始，通过遍历找出到达节点 p 和 q 的路径，一共需要两次遍历。我们也可以考虑将这两个节点放在一起遍历。 整体的遍历过程与方法一中的类似：</p><ul><li><p>我们从根节点开始遍历；</p></li><li><p>如果当前节点的值大于 p 和 q 的值，说明 p 和 q 应该在当前节点的左子树，因此将当前节点移动到它的左子节点；</p></li><li><p>如果当前节点的值小于 p 和 q 的值，说明 p 和 q 应该在当前节点的右子树，因此将当前节点移动到它的右子节点；</p></li><li><p>如果当前节点的值不满足上述两条要求，那么说明当前节点就是「分岔点」。此时，p 和 q 要么在当前节点的不同的子树中，要么其中一个就是当前节点。</p></li></ul><p>可以发现，如果我们将这两个节点放在一起遍历，我们就省去了存储路径需要的空间。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">class</span> <span class="token class-name">Solution</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token class-name">TreeNode</span> <span class="token function">lowestCommonAncestor</span><span class="token punctuation">(</span><span class="token class-name">TreeNode</span> root<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> p<span class="token punctuation">,</span> <span class="token class-name">TreeNode</span> q<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">TreeNode</span> ancestor <span class="token operator">=</span> root<span class="token punctuation">;</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token punctuation">.</span>val <span class="token operator">&lt;</span> ancestor<span class="token punctuation">.</span>val <span class="token operator">&amp;&amp;</span> q<span class="token punctuation">.</span>val <span class="token operator">&lt;</span> ancestor<span class="token punctuation">.</span>val<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                ancestor <span class="token operator">=</span> ancestor<span class="token punctuation">.</span>left<span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token punctuation">.</span>val <span class="token operator">&gt;</span> ancestor<span class="token punctuation">.</span>val <span class="token operator">&amp;&amp;</span> q<span class="token punctuation">.</span>val <span class="token operator">&gt;</span> ancestor<span class="token punctuation">.</span>val<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                ancestor <span class="token operator">=</span> ancestor<span class="token punctuation">.</span>right<span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">break</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> ancestor<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>该解法与我的题解思想基本一致，但解法二的代码更简洁。</p></blockquote>`,17);function v(m,b){const p=e("AlgorithmQuestion");return o(),c("div",null,[l(p,{title:"二叉搜索树的最近公共祖先",level:"2",url:"https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/description/?envType=daily-question&envId=2024-02-25",examples:`[
{
'input': 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8',
'output': '6',
'description': '节点 2 和节点 8 的最近公共祖先是 6。'
},
{
'input': 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4',
'output': '2',
'description': '节点 2 和节点 4 的最近公共祖先是 2, 因为根据定义最近公共祖先节点可以为节点本身。'
}]`},{tips:s(()=>[r]),default:s(()=>[k]),_:1}),d])}const f=t(u,[["render",v],["__file","235.html.vue"]]),w=JSON.parse('{"path":"/algorithm/leetcode/235.html","title":"235. 二叉搜索树的最近公共祖先","lang":"zh-CN","frontmatter":{"title":"235. 二叉搜索树的最近公共祖先"},"headers":[],"git":{"updatedTime":1711124190000},"filePathRelative":"algorithm/leetcode/235.md"}');export{f as comp,w as data};