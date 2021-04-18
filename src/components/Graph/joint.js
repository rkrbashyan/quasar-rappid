import * as joint from '@clientio/rappid/build/package/rappid'
import { memoize } from 'lodash'

joint.shapes.app = {}

joint.shapes.app.CircularModel = joint.shapes.standard.Ellipse.define(
  'app.CircularModel',
  {
    attrs: {
      root: {
        magnet: false
      }
    },
    ports: {
      groups: {
        in: {
          markup: [
            {
              tagName: 'circle',
              selector: 'portBody',
              attributes: {
                r: 10
              }
            }
          ],
          attrs: {
            portBody: {
              magnet: true,
              fill: '#61549c',
              strokeWidth: 0
            },
            portLabel: {
              fontSize: 11,
              fill: '#61549c',
              fontWeight: 800
            }
          },
          position: {
            name: 'ellipse',
            args: {
              startAngle: 0,
              step: 30
            }
          },
          label: {
            position: {
              name: 'radial',
              args: null
            }
          }
        },
        out: {
          markup: [
            {
              tagName: 'circle',
              selector: 'portBody',
              attributes: {
                r: 10
              }
            }
          ],
          attrs: {
            portBody: {
              magnet: true,
              fill: '#61549c',
              strokeWidth: 0
            },
            portLabel: {
              fontSize: 11,
              fill: '#61549c',
              fontWeight: 800
            }
          },
          position: {
            name: 'ellipse',
            args: {
              startAngle: 180,
              step: 30
            }
          },
          label: {
            position: {
              name: 'radial',
              args: null
            }
          }
        }
      }
    }
  },
  {
    portLabelMarkup: [
      {
        tagName: 'text',
        selector: 'portLabel'
      }
    ]
  }
)

joint.shapes.app.RectangularModel = joint.shapes.standard.Rectangle.define(
  'app.RectangularModel',
  {
    attrs: {
      root: {
        magnet: false
      }
    },
    ports: {
      groups: {
        in: {
          markup: [
            {
              tagName: 'circle',
              selector: 'portBody',
              attributes: {
                r: 10
              }
            }
          ],
          attrs: {
            portBody: {
              magnet: true,
              fill: '#61549c',
              strokeWidth: 0
            },
            portLabel: {
              fontSize: 11,
              fill: '#61549c',
              fontWeight: 800
            }
          },
          position: {
            name: 'left'
          },
          label: {
            position: {
              name: 'left',
              args: {
                y: 0
              }
            }
          }
        },
        out: {
          markup: [
            {
              tagName: 'circle',
              selector: 'portBody',
              attributes: {
                r: 10
              }
            }
          ],
          position: {
            name: 'right'
          },
          attrs: {
            portBody: {
              magnet: true,
              fill: '#61549c',
              strokeWidth: 0
            },
            portLabel: {
              fontSize: 11,
              fill: '#61549c',
              fontWeight: 800
            }
          },
          label: {
            position: {
              name: 'right',
              args: {
                y: 0
              }
            }
          }
        }
      }
    }
  },
  {
    portLabelMarkup: [
      {
        tagName: 'text',
        selector: 'portLabel'
      }
    ]
  }
)

joint.shapes.app.Link = joint.shapes.standard.Link.define(
  'app.Link',
  {
    router: {
      name: 'normal'
    },
    connector: {
      name: 'rounded'
    },
    labels: [],
    attrs: {
      line: {
        stroke: '#8f8f8f',
        strokeDasharray: '0',
        strokeWidth: 2,
        fill: 'none',
        sourceMarker: {
          type: 'path',
          d: 'M 0 0 0 0',
          stroke: 'none'
        },
        targetMarker: {
          type: 'path',
          d: 'M 0 -5 -10 0 0 5 z',
          stroke: 'none'
        }
      }
    }
  },
  {
    defaultLabel: {
      attrs: {
        rect: {
          fill: '#ffffff',
          stroke: '#8f8f8f',
          strokeWidth: 1,
          refWidth: 10,
          refHeight: 10,
          refX: -5,
          refY: -5
        }
      }
    },

    getMarkerWidth: function(type) {
      const d =
        type === 'source'
          ? this.attr('line/sourceMarker/d')
          : this.attr('line/targetMarker/d')
      return this.getDataWidth(d)
    },

    getDataWidth: memoize(function(d) {
      return new joint.g.Path(d).bbox().width
    })
  },
  {
    connectionPoint: function(line, view, magnet, opt, type, linkView) {
      const markerWidth = linkView.model.getMarkerWidth(type)
      opt = { offset: markerWidth, stroke: true }
      // connection point for UML shapes lies on the root group containg all the shapes components
      const modelType = view.model.get('type')
      if (modelType.indexOf('uml') === 0) opt.selector = 'root'
      // taking the border stroke-width into account
      if (modelType === 'standard.InscribedImage') opt.selector = 'border'
      return joint.connectionPoints.boundary.call(
        this,
        line,
        view,
        magnet,
        opt,
        type,
        linkView
      )
    }
  }
)

joint.shapes.app.NavigatorElementView = joint.dia.ElementView.extend({
  body: null,

  markup: [
    {
      tagName: 'rect',
      selector: 'body',
      attributes: {
        fill: '#31d0c6'
      }
    }
  ],

  initFlag: ['RENDER', 'UPDATE', 'TRANSFORM'],

  presentationAttributes: {
    size: ['UPDATE'],
    position: ['TRANSFORM'],
    angle: ['TRANSFORM']
  },

  confirmUpdate: function(flags) {
    if (this.hasFlag(flags, 'RENDER')) this.render()
    if (this.hasFlag(flags, 'UPDATE')) this.update()
    if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation()
  },

  render: function() {
    const doc = joint.util.parseDOMJSON(this.markup)
    this.body = doc.selectors.body
    this.el.appendChild(doc.fragment)
  },

  update: function() {
    const size = this.model.size()
    this.body.setAttribute('width', size.width)
    this.body.setAttribute('height', size.height)
  }
})

joint.shapes.app.NavigatorLinkView = joint.dia.LinkView.extend({
  initialize: joint.util.noop,

  render: joint.util.noop,

  update: joint.util.noop
})

window.joint = joint

export default joint
