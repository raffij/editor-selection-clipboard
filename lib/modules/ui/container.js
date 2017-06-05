const html = require('bel')
const item = require('./item')

module.exports = container

function container (editor) {
  return html`<div class="container">
    ${editor.blockList.map(block => item(editor, block))}
  </div>`
}
