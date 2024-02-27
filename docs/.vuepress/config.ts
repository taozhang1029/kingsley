import {viteBundler} from '@vuepress/bundler-vite'
import {defineUserConfig} from 'vuepress'
import {defaultTheme} from "@vuepress/theme-default";
import {parseSidebarArrayJson} from "../autoSidebar";

export default defineUserConfig({
    bundler: viteBundler(),
    base: '/blog/',
    // 网站的标题，它将会被用作所有页面标题的前缀，同时，默认主题下，它将显示在导航栏（navbar）上。
    title: '编程游乐场',
    // 网站的描述，它将会以 <meta> 标签渲染到当前页面的 HTML 中。
    description: '程序员涛涛的博客空间',
    plugins: [],
    theme: defaultTheme({
        // string | boolean
        lastUpdatedText: '最后更新于',
        contributors: false,
        navbar: [
            {
                text: '首页',
                link: '/'
            },
            {
                text: '后端',
                link: '/back-end/',
            },
            {
                text: '前端',
                link: '/front-end/'
            },
            {
                text: '移动端',
                children: [
                    {text: '小程序', link: '/mini-program/'},
                    {text: '安卓', link: '/android/'},
                    {text: 'IOS', link: '/ios/'},
                ]
            },
            {
                text: '算法',
                link: '/algorithm/',
            },
            {
                text: '资源',
                link: '/resource/ai/ollama'
            },
            {
                text: 'Github',
                link: 'https://github.com/taozhang1029',
            },
        ],
        sidebar: {
            '/front-end/': [
                {
                    text: 'Vue学习',   // 必要的
                    collapsible: true,// 可选的, 默认值是 true,
                    children: [
                        '/front-end/vue/vuejs'
                    ]
                },
            ],
            '/back-end/': [
                {
                    text: '规则/流程引擎',   // 必要的
                    collapsible: true, // 可选的, 默认值是 true,
                    link: '/back-end/rule-engine',
                    children: [
                        {
                            text: 'Drools',   // 必要的
                            link: '/back-end/rule-engine/Drools',
                        },
                        {
                            text: 'LiteFlow',   // 必要的
                            link: '/back-end/rule-engine/LiteFlow',
                        }
                    ]
                },
            ],
            '/resource/': [
                {
                    text: 'AI',
                    collapsible: true,
                    children: [
                        {
                            text: 'Ollama',   // 必要的
                            link: '/resource/ai/ollama',
                        },
                    ]
                },
            ],
            '/mini-program/': [
                '',
            ],
            '/android/': [
                {
                    text: '原生安卓',
                    link: '/android/',
                    collapsible: false, // 可选的, 默认值是 true,
                },
                {
                    text: '混合开发',
                    collapsible: true,
                    children: [
                        {
                            text: 'Flutter',
                            link: '/android/flutter',
                        },
                        {
                            text: 'React Native',
                            link: '/android/react-native',
                        },
                        {
                            text: 'uni-app',
                            link: '/android/uni-app',
                        },
                    ]
                }
            ],
            '/ios/': [
                '',
            ],
            '/algorithm/': [
                {
                    text: '算法',
                    link: '/algorithm/'
                },
                {
                    text: 'LeetCode',
                    collapsible: true,
                    children: [
                        ...parseSidebarArrayJson(
                            "docs/algorithm/leetcode/",
                            (filename: string) => filename.replace("BM", ""))
                    ]
                },
                {
                    text: '牛客',
                    collapsible: true,
                    children: [
                        ...parseSidebarArrayJson(
                            "docs/algorithm/newcoder",
                            (filename: string) => filename.replace("BM", ""))
                    ]
                }
            ]
        },
    })
})
