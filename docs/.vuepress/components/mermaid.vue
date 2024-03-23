<template>
  <div class="mermaid">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Mermaid} from "mermaid";

export default {
  name: "mermaid",
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
        m.run();
      });
    }
  }
};
</script>
