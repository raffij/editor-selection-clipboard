const html = require('bel')
const toolbar = require('./toolbar')

module.exports = item

function item (editor, block) {
  return html`<div id=${block.key} class="item ${block.constructor.type}">
    ${toolbar(editor, block)}
    <div class="content">${main(editor, block)}</div>
  </div>`
}

function main (editor, block) {
  switch (block.constructor.type) {
    case 'paragraph':
      return require('./paragraph')(editor, block)
    case 'image':
      return require('./image')(editor, block)
  }
}
