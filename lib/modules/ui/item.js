const html = require('bel')
const toolbar = require('./toolbar')

module.exports = item

function item (editor, block) {
  let classList = 'item'
  classList += ` ${block.constructor.type}`
  if (editor.selection.has(block)) classList += ' is-selected'

  return html`<div id=${block.key} class=${classList}>
    ${toolbar(editor, block)}
    <div class="content" onclick=${click}>
      ${main(editor, block)}
    </div>
  </div>`

  function click (event) {
    if (event.shiftKey) {
      editor.selection.enclose(editor.selection.source, block)
      editor.ui.emit('update')
    } else if (event.metaKey) {
      editor.selection.toggle(block)
      editor.ui.emit('update')
    } else {
      editor.selection.clear()
      editor.selection.add(block)
      editor.ui.emit('update')
    }
    event.stopPropagation()
  }
}

function main (editor, block) {
  switch (block.constructor.type) {
    case 'paragraph':
      return require('./paragraph')(editor, block)
    case 'image':
      return require('./image')(editor, block)
  }
}
