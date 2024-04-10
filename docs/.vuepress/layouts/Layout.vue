<template>
  <Layout>
    <template #page-bottom>
      <CommentService :darkmode="isDarkMode" />
    </template>
  </Layout>
</template>

<script lang="ts" setup>
/**
 * 替换默认布局
 * 只要当前文件命名为 Layout.vue 并且放置在 .vuepress/layouts/ 目录下，并且在 client.ts 中注册，那么它将作为全局默认布局，即使没有在md文件的 Frontmatter 中指定布局
 * @see https://ecosystem.vuejs.press/zh/themes/default/extending.html#%E5%B8%83%E5%B1%80%E6%8F%92%E6%A7%BD
 */
import Layout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
import {onBeforeMount, onMounted, ref,} from 'vue'

let isDarkMode = ref(false)
let toggleDarkModeBtn = null

onMounted(() => {
  toggleDarkModeBtn = document.querySelector('.toggle-color-mode-button')
  isDarkMode.value = toggleDarkModeBtn.children[0].style.display === 'none'
  toggleDarkModeBtn.addEventListener('click', toggleDarkMode)
})

onBeforeMount(() => {
  if (toggleDarkModeBtn !== null) {
    toggleDarkModeBtn.removeEventListener('click', toggleDarkMode)
    toggleDarkModeBtn = null
  }
})

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}
</script>

<style lang="scss" scoped>

</style>
