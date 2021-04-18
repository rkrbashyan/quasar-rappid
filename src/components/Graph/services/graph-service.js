import joint from '../joint'
import * as dagre from 'dagre'
import * as _ from 'lodash'

import { embedElement, findElementBelow } from '../utils'
class GraphSinkService {
  constructor(
    el,
    stencilService,
    toolbarService,
    inspectorService,
    haloService,
    keyboardService,
    persistenceService
  ) {
    this.el = el

    // apply current joint js theme
    const view = new joint.mvc.View({ el })
    view.delegateEvents({
      'mouseup input[type="range"]': evt => evt.target.blur()
    })

    this.stencilService = stencilService
    this.toolbarService = toolbarService
    this.inspectorService = inspectorService
    this.haloService = haloService
    this.keyboardService = keyboardService
    this.persistenceService = persistenceService

    // backwards compatibility for older shapes
    this.exportStylesheet = '.scalable * { vector-effect: non-scaling-stroke }'
  }

  startRappid() {
    joint.setTheme('modern')

    this.initializePaper()
    this.initializeStencil()
    this.initializeSelection()
    this.initializeToolsAndInspector()
    this.initializeNavigator()
    this.initializeToolbar()
    this.initializeKeyboardShortcuts()
    this.initializeTooltips()
  }

  initializePaper() {
    const graph = (this.graph = new joint.dia.Graph())

    graph.on('add', (cell, collection, opt) => {
      embedElement(graph, cell)

      if (opt.stencil) {
        this.inspectorService.create(cell)
      }
    })

    graph.on('change add remove', () => {
      if (this.persistenceService) {
        this.persistenceService.save(graph)
      }
    })

    this.commandManager = new joint.dia.CommandManager({ graph })

    const paper = (this.paper = new joint.dia.Paper({
      width: 1000,
      height: 1000,
      gridSize: 10,
      drawGrid: true,
      model: graph,
      defaultLink: new joint.shapes.app.Link(),
      defaultConnectionPoint: joint.shapes.app.Link.connectionPoint,
      interactive: { linkMove: false },
      async: true,
      sorting: joint.dia.Paper.sorting.APPROX
      // embeddingMode: true
    }))

    paper.on('blank:mousewheel', _.partial(this.onMousewheel, null), this)
    paper.on('cell:mousewheel', this.onMousewheel.bind(this))

    const keyboard = this.keyboardService.keyboard

    paper.on({
      // Unembed the element that has just been grabbed by the user.
      'element:pointerdown': function(elementView, evt) {
        if (!keyboard.isActive('shift', evt)) {
          const element = elementView.model

          if (!element.get('embeds') || element.get('embeds').length === 0) {
            // Show the dragged element above all the other cells (except when the
            // element is a parent).
            element.toFront()
          }

          if (element.get('parent')) {
            graph.getCell(element.get('parent')).unembed(element)
          }
        }
      },

      'element:pointerup': function(elementView, evt, x, y) {
        if (!keyboard.isActive('shift', evt)) {
          embedElement(this.model, elementView.model)
        }
      }
    })

    paper.on({
      'element:pointerdown': function(elementView, evt) {
        if (keyboard.isActive('shift', evt)) {
          evt.data = elementView.model.position()
        }
      },

      'element:pointerup': function(elementView, evt, x, y) {
        if (keyboard.isActive('shift', evt) && evt.data) {
          const coordinates = new joint.g.Point(x, y)
          const elementAbove = elementView.model
          const elementBelow = findElementBelow(
            this.model,
            coordinates,
            elementAbove
          )
          const elementBelowPosition = elementBelow && elementBelow.position()

          if (
            elementBelow &&
            elementBelow.get('parent') === elementAbove.get('parent')
          ) {
            elementBelow.position(evt.data.x, evt.data.y)
            elementAbove.position(
              elementBelowPosition.x,
              elementBelowPosition.y
            )
          } else {
            elementAbove.position(evt.data.x, evt.data.y)
          }
        }
      }
    })

    this.snaplines = new joint.ui.Snaplines({ paper: paper })

    const paperScroller = (this.paperScroller = new joint.ui.PaperScroller({
      paper,
      autoResizePaper: true,
      scrollWhileDragging: true,
      cursor: 'grab'
    }))

    this.renderPlugin('.paper-container', paperScroller)
    paperScroller.render().center()
  }

  initializeStencil() {
    this.stencilService.create(this.paperScroller, this.snaplines)
    this.renderPlugin('.stencil-container', this.stencilService.stencil)
    this.stencilService.setShapes()
  }

  initializeSelection() {
    this.clipboard = new joint.ui.Clipboard()
    this.selection = new joint.ui.Selection({
      paper: this.paper,
      useModelGeometry: true
    })
    this.selection.collection.on(
      'reset add remove',
      this.onSelectionChange.bind(this)
    )

    const keyboard = this.keyboardService.keyboard

    // Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
    // Otherwise, initiate paper pan.
    this.paper.on('blank:pointerdown', (evt, x, y) => {
      if (keyboard.isActive('shift', evt)) {
        this.selection.startSelecting(evt)
      } else {
        this.selection.collection.reset([])
        this.paperScroller.startPanning(evt)
        this.paper.removeTools()
      }
    })

    this.paper.on('element:pointerdown', (elementView, evt) => {
      // Select an element if CTRL/Meta key is pressed while the element is clicked.
      if (keyboard.isActive('ctrl meta', evt)) {
        this.selection.collection.add(elementView.model)
      }
    })

    this.selection.on(
      'selection-box:pointerdown',
      (elementView, evt) => {
        // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
        if (keyboard.isActive('ctrl meta', evt)) {
          this.selection.collection.remove(elementView.model)
        }
      },
      this
    )
  }

  onSelectionChange() {
    const { paper, selection } = this
    const { collection } = selection
    paper.removeTools()
    joint.ui.Halo.clear(paper)
    joint.ui.FreeTransform.clear(paper)
    joint.ui.Inspector.close()
    if (collection.length === 1) {
      const primaryCell = collection.first()
      const primaryCellView = paper.requireView(primaryCell)
      selection.destroySelectionBox(primaryCell)
      this.selectPrimaryCell(primaryCellView)
    } else if (collection.length === 2) {
      collection.each(function(cell) {
        selection.createSelectionBox(cell)
      })
    }
  }

  selectPrimaryCell(cellView) {
    const cell = cellView.model
    if (cell.isElement()) {
      this.selectPrimaryElement(cellView)
    } else {
      this.selectPrimaryLink(cellView)
    }
    this.inspectorService.create(cell)
  }

  selectPrimaryElement(elementView) {
    const element = elementView.model

    new joint.ui.FreeTransform({
      cellView: elementView,
      allowRotation: false,
      preserveAspectRatio: !!element.get('preserveAspectRatio'),
      allowOrthogonalResize: element.get('allowOrthogonalResize') !== false
    }).render()

    this.haloService.create(elementView)
  }

  selectPrimaryLink(linkView) {
    const ns = joint.linkTools
    const toolsView = new joint.dia.ToolsView({
      name: 'link-pointerdown',
      tools: [
        new ns.Vertices(),
        new ns.SourceAnchor(),
        new ns.TargetAnchor(),
        new ns.SourceArrowhead(),
        new ns.TargetArrowhead(),
        new ns.Segments(),
        new ns.Boundary({ padding: 15 }),
        new ns.Remove({ offset: -20, distance: 40 })
      ]
    })

    linkView.addTools(toolsView)
  }

  initializeToolsAndInspector() {
    this.paper.on('cell:pointerup', cellView => {
      const cell = cellView.model
      const { collection } = this.selection
      if (collection.includes(cell)) {
        return
      }
      collection.reset([cell])
    })

    this.paper.on('link:mouseenter', linkView => {
      // Open tool only if there is none yet
      if (linkView.hasTools()) {
        return
      }

      const ns = joint.linkTools
      const toolsView = new joint.dia.ToolsView({
        name: 'link-hover',
        tools: [
          new ns.Vertices({ vertexAdding: false }),
          new ns.SourceArrowhead(),
          new ns.TargetArrowhead()
        ]
      })

      linkView.addTools(toolsView)
    })

    this.paper.on('link:mouseleave', linkView => {
      // Remove only the hover tool, not the pointerdown tool
      if (linkView.hasTools('link-hover')) {
        linkView.removeTools()
      }
    })

    this.graph.on('change', (cell, opt) => {
      if (!cell.isLink() || !opt.inspector) {
        return
      }

      const ns = joint.linkTools
      const toolsView = new joint.dia.ToolsView({
        name: 'link-inspected',
        tools: [new ns.Boundary({ padding: 15 })]
      })

      cell.findView(this.paper).addTools(toolsView)
    })
  }

  initializeNavigator() {
    const navigator = (this.navigator = new joint.ui.Navigator({
      width: 240,
      height: 115,
      paperScroller: this.paperScroller,
      zoom: false,
      paperOptions: {
        async: true,
        sorting: joint.dia.Paper.sorting.NONE,
        elementView: joint.shapes.app.NavigatorElementView,
        linkView: joint.shapes.app.NavigatorLinkView,
        cellViewNamespace: {
          /* no other views are accessible in the navigator */
        }
      }
    }))

    this.renderPlugin('.navigator-container', navigator)
  }

  initializeToolbar() {
    this.toolbarService.create(this.commandManager, this.paperScroller)

    this.toolbarService.toolbar.on({
      'svg:pointerclick': this.openAsSVG.bind(this),
      'png:pointerclick': this.openAsPNG.bind(this),
      'to-front:pointerclick': this.applyOnSelection.bind(this, 'toFront'),
      'to-back:pointerclick': this.applyOnSelection.bind(this, 'toBack'),
      'layout:pointerclick': this.layoutDirectedGraph.bind(this),
      'snapline:change': this.changeSnapLines.bind(this),
      'clear:pointerclick': this.graph.clear.bind(this.graph),
      'print:pointerclick': this.paper.print.bind(this.paper),
      'grid-size:change': this.paper.setGridSize.bind(this.paper)
    })

    this.renderPlugin('.toolbar-container', this.toolbarService.toolbar)
  }

  applyOnSelection(method) {
    this.graph.startBatch('selection')
    this.selection.collection.models.forEach(function(model) {
      model[method]()
    })
    this.graph.stopBatch('selection')
  }

  changeSnapLines(checked) {
    if (checked) {
      this.snaplines.startListening()
      this.stencilService.stencil.options.snaplines = this.snaplines
    } else {
      this.snaplines.stopListening()
      this.stencilService.stencil.options.snaplines = null
    }
  }

  initializeKeyboardShortcuts() {
    this.keyboardService.create(
      this.graph,
      this.clipboard,
      this.selection,
      this.paperScroller,
      this.commandManager
    )
  }

  initializeTooltips() {
    return new joint.ui.Tooltip({
      rootTarget: document.body,
      target: '[data-tooltip]',
      direction: joint.ui.Tooltip.TooltipArrowPosition.Auto,
      padding: 10
    })
  }

  openAsSVG() {
    this.paper.hideTools().toSVG(
      svg => {
        new joint.ui.Lightbox({
          image: 'data:image/svg+xml,' + encodeURIComponent(svg),
          downloadable: true,
          fileName: 'Rappid'
        }).open()
        this.paper.showTools()
      },
      {
        preserveDimensions: true,
        convertImagesToDataUris: true,
        useComputedStyles: false,
        stylesheet: this.exportStylesheet
      }
    )
  }

  openAsPNG() {
    this.paper.hideTools().toPNG(
      dataURL => {
        new joint.ui.Lightbox({
          image: dataURL,
          downloadable: true,
          fileName: 'Rappid'
        }).open()
        this.paper.showTools()
      },
      {
        padding: 10,
        useComputedStyles: false,
        stylesheet: this.exportStylesheet
      }
    )
  }

  onMousewheel(cellView, evt, ox, oy, delta) {
    if (this.keyboardService.keyboard.isActive('alt', evt)) {
      evt.preventDefault()
      this.paperScroller.zoom(delta * 0.2, {
        min: 0.2,
        max: 5,
        grid: 0.2,
        ox,
        oy
      })
    }
  }

  layoutDirectedGraph() {
    joint.layout.DirectedGraph.layout(this.graph, {
      graphlib: dagre.graphlib,
      dagre: dagre,
      setVertices: true,
      rankDir: 'TB',
      marginX: 100,
      marginY: 100
    })

    this.paperScroller.centerContent()
  }

  renderPlugin(selector, plugin) {
    this.el.querySelector(selector).appendChild(plugin.el)
    plugin.render()
  }
}

export default GraphSinkService
