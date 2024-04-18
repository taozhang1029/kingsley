import {viteBundler} from '@vuepress/bundler-vite'
import {defineUserConfig} from 'vuepress'
import themeSidebar from 'vuepress-theme-sidebar'
import {registerComponentsPlugin} from '@vuepress/plugin-register-components'
import {searchPlugin} from '@vuepress/plugin-search'
import {path} from '@vuepress/utils'
import { commentPlugin } from "vuepress-plugin-comment2"

export default defineUserConfig({
    bundler: viteBundler(),
    port: 3000,
    base: '/blog/',
    // 网站的标题，它将会被用作所有页面标题的前缀，同时，默认主题下，它将显示在导航栏（navbar）上。
    title: 'Coding游乐场',
    // 网站的描述，它将会以 <meta> 标签渲染到当前页面的 HTML 中。
    description: 'Coding游乐场',
    // 网站的head，它将会以 <head> 标签渲染到当前页面的 HTML 中。
    head: [
        ['link', {rel: 'icon', href: '/blog/favicon.ico'}],
    ],
    lang: 'zh-CN',
    plugins: [
        registerComponentsPlugin({
            componentsDir: path.resolve('docs/.vuepress/components'),
        }),
        // 暂时注释掉photoSwipePlugin，会出现两次dialog的情况
        // photoSwipePlugin(),
        searchPlugin(),
        commentPlugin({
            // 插件选项
            provider: "Giscus", //评论服务提供者。
            comment: true, //启用评论功能
            repo: "taozhang1029/blog", //远程仓库
            repoId: "R_kgDOLNSFGw", //对应自己的仓库Id
            category: "Announcements",
            categoryId: "DIC_kwDOLNSFG84CemZn",
            darkTheme: 'https://giscus.app/themes/noborder_dark.css'
        }),
    ],
    theme: themeSidebar({
        // string | boolean
        lastUpdatedText: '最后更新于',
        contributors: false,
        navbar: [
            {
                text: 'Github',
                link: 'https://github.com/taozhang1029',
            },
        ],
        // sidebarType: "left"
    })
})
