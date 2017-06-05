const html = require('bel')
const load = require('on-load')

module.exports = image

function image (editor, block) {
  if (!block.attributes.src) return html`<div>${input(editor, block)}</div>`

  return html`<div>
    ${main(editor, block)}
    ${caption(editor, block)}
  </div>`
}

function main (editor, block) {
  const element = html`<img
    onclick=${onclick}
    onkeydown=${onkeydown}
    src=${block.attributes.src}
  />`
  return handleFocus(editor, block, element, 'main')

  function onkeydown (event) {
    if (event.key === 'Enter') {
      const Paragraph = editor.blockTypes.get('paragraph')
      const newBlock = new Paragraph({ text: '' })
      editor.ui.once('ready', element => element.focus())
      editor.blockList.insertAfter(newBlock, block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Backspace') {
      editor.ui.emit('focus', editor.focus.previous)
      editor.blockList.remove(block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      editor.ui.emit('focus', editor.focus.previous)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      editor.ui.emit('focus', editor.focus.next)
      editor.ui.emit('update')
      event.preventDefault()
    }
    event.stopPropagation()
  }

  function onclick (event) {
    editor.selection.clear()
    editor.ui.emit('update')
    event.stopPropagation()
  }
}

function caption (editor, block) {
  const element = html`<input
    type="text"
    onclick=${onclick}
    onkeydown=${onkeydown}
    oninput=${oninput}
    placeholder="Caption"
    value=${block.attributes.caption}
  />`
  return handleFocus(editor, block, element, 'caption')

  function onkeydown (event) {
    const start = event.target.selectionStart
    const end = event.target.selectionEnd
    const length = event.target.value.length

    if (event.key === 'Enter') {
      const Paragraph = editor.blockTypes.get('paragraph')
      const newBlock = new Paragraph({ text: '' })
      editor.ui.once('ready', element => element.focus())
      editor.blockList.insertAfter(newBlock, block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (start === 0 && end === 0 &&
        (event.key === 'ArrowUp' || event.key === 'ArrowLeft')) {
      editor.ui.emit('focus', editor.focus.previous)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (start === length && end === length &&
               (event.key === 'ArrowDown' || event.key === 'ArrowRight')) {
      editor.ui.emit('focus', editor.focus.next)
      editor.ui.emit('update')
      event.preventDefault()
    }
    event.stopPropagation()
  }

  function oninput (event) {
    block.attributes.caption = event.target.value
    editor.ui.emit('update')
  }

  function onclick (event) {
    editor.selection.clear()
    editor.ui.emit('update')
    event.stopPropagation()
  }
}

function input (editor, block) {
  const element = html`<input
    type="file"
    onkeydown=${onkeydown}
    onchange=${onchange}
    onclick=${onclick}
  />`
  return handleFocus(editor, block, element, 'input')

  function onkeydown (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      const Paragraph = editor.blockTypes.get('paragraph')
      const newBlock = new Paragraph({ text: '' })
      editor.ui.once('ready', element => element.focus())
      editor.blockList.insertAfter(newBlock, block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Backspace') {
      editor.ui.emit('focus', editor.focus.previous)
      editor.blockList.remove(block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      editor.ui.emit('focus', editor.focus.previous)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      editor.ui.emit('focus', editor.focus.next)
      editor.ui.emit('update')
      event.preventDefault()
    }
    event.stopPropagation()
  }

  function onchange (event) {
    const file = event.target.files[0]
    if (file) {
      block.attributes.src = window.URL.createObjectURL(file)
      editor.ui.once('ready', element => element.focus())
      editor.ui.emit('update')
    }
  }

  function onclick (event) {
    editor.selection.clear()
    editor.ui.emit('update')
    event.stopPropagation()
  }
}

function handleFocus (editor, block, element, id) {
  let onrequestfocus
  element.setAttribute('tabindex', 0)
  element.onfocus = onfocus
  element.onblur = onblur
  return load(element, onload, onunload, id)

  function onload (element) {
    onrequestfocus = function (focused) {
      if (focused === element) element.focus()
    }
    window.requestAnimationFrame(() => editor.focus.addTarget(element))
    editor.ui.on('focus', onrequestfocus)
    editor.ui.emit('ready', element)
  }

  function onunload (element) {
    editor.focus.removeTarget(element)
    editor.ui.removeListener('focus', onfocus)
  }

  function onfocus (event) {
    if (editor.focus.target !== event.target) {
      editor.focus.target = event.target
      editor.ui.emit('focus', editor.focus.target)
    }
  }

  function onblur () {
    if (typeof editor.focus.target !== 'undefined') {
      editor.ui.emit('blur', editor.focus.target)
      delete editor.focus.target
    }
  }
}
