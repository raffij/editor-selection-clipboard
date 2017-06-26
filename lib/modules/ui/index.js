const Bus = require('nanobus')
const nanomorph = require('nanomorph')
const nanoraf = require('nanoraf')
const container = require('./container')

module.exports = ui

function ui (editor) {
  const ui = new Bus()
  ui.state = {}
  ui.element = container(editor)

  const render = nanoraf(function () {
    ui.element = nanomorph(ui.element, container(editor))
  })
  ui.on('update', render)
  ui.on('focusnext', onfocusnext)
  ui.on('focusprevious', onfocusprevious)
  return ui

  function onfocusnext () {
    const elements = Array.from(ui.element.querySelectorAll('[data-tabbable]'))
    const target = elements[elements.indexOf(document.activeElement) + 1]
    if (target) target.focus()
  }

  function onfocusprevious () {
    const elements = Array.from(ui.element.querySelectorAll('[data-tabbable]'))
    const target = elements[elements.indexOf(document.activeElement) - 1]
    if (target) target.focus()
  }
}
