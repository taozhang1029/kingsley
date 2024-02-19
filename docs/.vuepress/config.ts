import {defineConfig} from "vuepress/config";
// 不要忘了安装 moment
// @ts-ignore
import moment from 'moment';

export default defineConfig({
    base: '/blog/',
    // 网站的标题，它将会被用作所有页面标题的前缀，同时，默认主题下，它将显示在导航栏（navbar）上。
    title: '程序员涛涛',
    // 网站的描述，它将会以 <meta> 标签渲染到当前页面的 HTML 中。
    description: '程序员涛涛的博客空间',
    markdown: {
        lineNumbers: true
    },
    configureWebpack: {
        resolve: {
            alias: {
            }
        }
    },
    plugins: [
        [
            '@vuepress/last-updated',
            {
                transformer: (timestamp: number, lang: string) => {
                    moment.locale(lang)
                    return moment(timestamp).format('YYYY-MM-DD HH:mm')
                }
            }
        ]
    ],
    themeConfig: {
        smoothScroll: true,
        // string | boolean
        lastUpdated: '最后更新于',
        nav: [
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
                items: [
                    {text: '小程序', link: '/mini-program/'},
                    {text: '安卓', link: '/android/'},
                    {text: 'IOS', link: '/ios/'},
                ]
            },
            {
                text: 'Github',
                link: 'https://github.com/taozhang1029',
                rel: true
            },
        ],
        sidebar: {
            '/front-end/': [
                {
                    title: 'Vue学习',   // 必要的
                    collapsable: true, // 可选的, 默认值是 true,
                    sidebarDepth: 1,    // 可选的, 默认值是 1
                    children: [
                        '/front-end/vue/vuejs'
                    ]
                },
            ],
            '/back-end/': [
                {
                    title: '规则引擎',   // 必要的
                    collapsable: true, // 可选的, 默认值是 true,
                    path: '/back-end/rule-engine',
                    sidebarDepth: 1,    // 可选的, 默认值是 1
                    children: [
                        {
                            title: 'Drools',   // 必要的
                            path: '/back-end/rule-engine/Drools',
                        },
                        {
                            title: 'LiteFlow',   // 必要的
                            path: '/back-end/rule-engine/LiteFlow',
                        }
                    ]
                },
            ],
            '/mini-program/': [
                '',
            ],
            '/android/': [
                '',
                'native',
            ],
            '/ios/': [
                '',
            ],
        },
    }
})
