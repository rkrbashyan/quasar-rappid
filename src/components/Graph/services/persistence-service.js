import debounce from 'lodash/debounce'

export class LocalStoragePersistence {
  constructor() {
    this.save = debounce(graph => {
      try {
        const diagramJsonString = JSON.stringify(graph.toJSON())
        localStorage.setItem('graph', diagramJsonString)
      } catch (_) {
        //
      }
    }, 1000)
  }
}
