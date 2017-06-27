const html = require('bel')
const load = require('on-load')

module.exports = toolbar

function toolbar (editor, block) {
  let classList = 'toolbar'
  if (editor.ui.state.focused === block) classList += ' is-visible'

  return html`<div class=${classList}>
    <button class="toggle" onclick=${onclick} onmousedown=${onmousedown}>
      <img src="public/chevron-down.svg" />
    </button>
    ${menu(editor, block)}
  </div>`

  function onclick (event) {
    editor.ui.state.toolbar = block
    editor.ui.emit('update')
  }

  function onmousedown (event) {
    event.stopPropagation()
  }
}

function menu (editor, block) {
  if (editor.ui.state.toolbar !== block) return

  let ondocumentclick
  const element = html`<div class="menu">
    ${Array.from(editor.blockTypes).map(Ctor => button(editor, block, Ctor))}
  </div>`
  return load(element, onload, onunload, 'menu')

  function onload (element) {
    ondocumentclick = function (event) {
      if (event.target !== element) {
        delete editor.ui.state.toolbar
        editor.ui.emit('update')
      }
    }
    document.addEventListener('click', ondocumentclick, true)
  }

  function onunload () {
    document.removeEventListener('click', ondocumentclick, true)
  }
}

function button (editor, block, Ctor) {
  let classList = ''
  if (block.constructor.type === Ctor.type) classList += 'is-current'

  return html`<button class=${classList} onclick=${onclick}>
    <img src=${icon(Ctor)} />
  </button>`

  function onclick (event) {
    editor.history.capture()
    const newBlock = new Ctor(block.attributes)
    editor.blockList.insertAfter(newBlock, block)
    editor.blockList.remove(block)
    editor.ui.emit('update')
    event.preventDefault()
  }
}

function icon (Ctor) {
  switch (Ctor.type) {
    case 'paragraph':
      return 'public/type.svg'
    case 'image':
      return 'public/image.svg'
  }
}
