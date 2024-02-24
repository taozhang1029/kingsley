// @ts-ignore
import AlgorithmQuestion from './components/AlgorithmQuestion.vue'
// @ts-ignore
import { defineClientConfig } from 'vuepress/client'

export default defineClientConfig({
    enhance({app}) {
        app.component('AlgorithmQuestion', AlgorithmQuestion)
    },
})
