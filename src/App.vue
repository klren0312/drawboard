<template>
  <DrawBoard/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DrawBoard from './components/DrawBoard.vue'

export default defineComponent({
  name: 'App',
  components: {
    DrawBoard
  }
})
</script>

<style>
body {
  padding: 0;
  margin: 0;
}
</style>