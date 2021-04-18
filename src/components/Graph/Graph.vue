<template>
  <div class="joint-app joint-theme-modern">
    <div class="app-header">
      <div class="app-title">
        <h1>Rappid</h1>
      </div>
      <div class="toolbar-container" />
    </div>
    <div class="app-body">
      <div class="stencil-container" />
      <div class="paper-container" />
      <div class="inspector-container" />
      <div class="navigator-container" />
    </div>
  </div>
</template>

<script>
import GraphService from './services/graph-service'
import { StencilService } from './services/stencil-service'
import { ToolbarService } from './services/toolbar-service'
import { InspectorService } from './services/inspector-service'
import { HaloService } from './services/halo-service'
import { KeyboardService } from './services/keyboard-service'
import { LocalStoragePersistence as PersistenceService } from './services/persistence-service'

import { ThemePicker } from './theme-picker'

export default {
  mounted() {
    this.rappid = new GraphService(
      this.$el,
      new StencilService(),
      new ToolbarService(),
      new InspectorService(),
      new HaloService(),
      new KeyboardService(),
      new PersistenceService()
    )

    this.rappid.startRappid()

    const themePicker = new ThemePicker({ mainView: this.rappid })
    themePicker.render().$el.appendTo(document.body)

    const graphCells = localStorage.getItem('graph')
    if (graphCells) {
      try {
        this.rappid.graph.fromJSON(JSON.parse(graphCells))
      } catch (_) {
        //
      }
    }
  }
}
</script>

<style>
/*import rappid styles*/
@import '~@clientio/rappid/build/package/rappid.css';
@import './css/style.css';
@import './css/theme-picker.css';

@import './css/style.modern.css';
@import './css/style.dark.css';
@import './css/style.material.css';
</style>
