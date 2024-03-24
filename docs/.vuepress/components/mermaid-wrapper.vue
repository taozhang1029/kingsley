<template>
  <div>
    <slot>
      <div class="dsl">{{dsl}}</div>
    </slot>
  </div>
</template>

<script lang="ts">
import {Mermaid} from "mermaid";

export default {
  name: "mermaid",
  props: {
    dsl: {
      type: String,
      default: ""
    }
  },
  mounted() {
    this.importMermaid()
  },
  updated() {
    this.importMermaid()
  },
  methods: {
    importMermaid() {
      (import("mermaid/dist/mermaid") as Promise<any>).then((m: Mermaid) => {
        m.initialize({
          startOnLoad: true
        })
        m.run({
          querySelector: '.dsl'
        });
      });
    }
  }
};
</script>
