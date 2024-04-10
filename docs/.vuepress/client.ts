import {defineClientConfig} from '@vuepress/client'
// @ts-ignore
import Layout from './layouts/Layout.vue'

/**
 * 客户端配置文档
 * https://v2.vuepress.vuejs.org/zh/advanced/cookbook/usage-of-client-config.html
 */
export default defineClientConfig({
    layouts: {
        Layout,
    },
    enhance({app, router, siteData}) {

    },
    setup() {
    },
    rootComponents: [],
})
