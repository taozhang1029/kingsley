<template>
  <div class="container">
    <div class="description">
      <div class="title">描述：</div>
      <slot></slot>
    </div>
    <div class="divider"></div>
    <div class="description">
      <div class="title">提示：</div>
      <slot name="tips">

      </slot>
    </div>
    <div class="divider"></div>
    <div class="examples">
      <div v-for="(example, index) in examplesArray" class="example">
        <div class="title">示例 {{ index + 1 }}：</div>
        <!-- 图片 -->
        <div v-show="example.images && example.images.length > 0">
          <img v-for="image in example.images" :src="image" alt="">
        </div>
        <div class="divider"></div>
        <!-- 输入 -->
        <div class="input">
          <div class="subtitle">输入：</div>
          <div class="io-content">{{ example.input }}</div>
        </div>
        <div class="output">
          <div class="subtitle">输出：</div>
          <div class="io-content">{{ example.output }}</div>
        </div>
        <div class="example-description" v-show="example.description">
          <div class="subtitle">解释：</div>
          <div class="io-content">{{ example.description }}</div>
        </div>
        <div class="divider"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    examples: {
      type: String,
      default: '[]'
    }
  },
  computed: {
    examplesArray() {
      return JSON.parse(this.examples.replaceAll('\'', "\""))
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  .divider {
    height: 10px;
    width: 100%;
    color: black;
    margin: 5px 0;
  }

  .title {
    font-weight: 600;
    margin-bottom: 10px;;
  }

  .subtitle {
    font-weight: 600;
    display: inline-block;
  }

  .example {
    margin: 10px 0;

    .io-content {
      display: inline-block;
    }

    .example-description {
      white-space: normal;
    }
  }
}
</style>
