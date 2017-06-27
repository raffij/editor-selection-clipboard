const Bus = require('nanobus')
const nanomorph = require('nanomorph')
const nanoraf = require('nanoraf')
const container = require('./container')

module.exports = ui

function ui (editor) {
  let element
  const ui = new Bus()
  ui.state = {}

  Object.defineProperty(ui, 'element', {
    get () {
      if (typeof element === 'undefined') element = container(editor)
      return element
    }
  })

  const render = nanoraf(function () {
    element = nanomorph(element, container(editor))
  })
  ui.on('update', render)
  return ui
}
