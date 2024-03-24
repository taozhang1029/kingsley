import {viteBundler} from '@vuepress/bundler-vite'
import {defineUserConfig} from 'vuepress'
import themeSidebar from 'vuepress-theme-sidebar';
import defaultTheme from '@vuepress/theme-default';
import {registerComponentsPlugin} from '@vuepress/plugin-register-components'
import { photoSwipePlugin } from '@vuepress/plugin-photo-swipe'
import {path} from '@vuepress/utils'

export default defineUserConfig({
    bundler: viteBundler(),
    base: '/blog/',
    // 网站的标题，它将会被用作所有页面标题的前缀，同时，默认主题下，它将显示在导航栏（navbar）上。
    title: '编程游乐场',
    // 网站的描述，它将会以 <meta> 标签渲染到当前页面的 HTML 中。
    description: '程序员涛涛的博客空间',
    plugins: [
        registerComponentsPlugin({
            componentsDir: path.resolve('docs/.vuepress/components'),
        }),
        photoSwipePlugin(),
    ],
    theme: themeSidebar({
        colorMode: 'dark',
        // string | boolean
        lastUpdatedText: '最后更新于',
        contributors: false,
        navbar: [
            {
                text: 'Github',
                link: 'https://github.com/taozhang1029',
            },
        ],
        sidebar: 'auto'
        // sidebarType: "left"
    })
})
