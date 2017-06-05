const Bus = require('nanobus')
const nanomorph = require('nanomorph')
const nanoraf = require('nanoraf')
const container = require('./container')

module.exports = ui

function ui (editor) {
  const bus = new Bus()
  bus.state = {}
  bus.element = container(editor)

  const render = nanoraf(function () {
    bus.element = nanomorph(bus.element, container(editor))
  })
  bus.on('update', render)

  return bus
}
