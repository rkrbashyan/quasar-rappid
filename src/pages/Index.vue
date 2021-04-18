<template>
  <q-page class="graph row no-wrap">
    <Graph />
  </q-page>
</template>

<script>
import Graph from '../components/Graph'

export default {
  name: 'PageIndex',
  components: {
    Graph
  }
}
</script>

<style>
.graph {
  height: 100%;
}
</style>
