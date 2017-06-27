const html = require('bel')
const item = require('./item')
const marquee = require('./marquee')

module.exports = main

function main (editor) {
  return html`<div class="main">
    ${editor.blockList.map(block => item(editor, block))}
    ${marquee(editor)}
  </div>`
}
