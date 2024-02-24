<template>
  <div class="container">
    <h2 title="查看原题">
      <a :href="url" target="_blank">{{ title }}</a>
    </h2>
    <div class="level">
      <div style="display: inline-block; font-weight: 600">难度：</div>
      <div v-if="level==='1'" class="easy levelDesc">简单</div>
      <div v-else-if="level==='2'" class="medium levelDesc">中等</div>
      <div v-else class="hard levelDesc">困难</div>
    </div>
    <div class="divider"></div>
    <div class="description">
      <div class="title">描述：</div>
      <slot></slot>
    </div>
    <div class="divider"></div>
    <div class="description">
      <div class="title">提示：</div>
      <slot name="tips"></slot>
    </div>

    <div class="examples">
      <div v-for="(example, index) in examplesArray" class="example card">
        <div class="title">示例{{ index + 1 }}：</div>
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
    level: {
      type: String,
      require: true,
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

  .level {
    .levelDesc  {
      display: inline-block;
      border-radius: 9999px;
      background: #0000000f;
      padding: 0.25rem 0.5rem;
      line-height: 16px;
    }
    .easy {
      color: #67c23a;
    }
    .medium {
      color: #ffb800;
    }
    .hard {
      color: #f63636;
    }
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

.card {
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
  transition: .3s;
  padding: 20px;
  color: var(--c-text);
  background: var(--c-bg);
}

</style>
