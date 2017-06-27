const html = require('bel')
const load = require('on-load')

module.exports = image

function image (editor, block) {
  if (!block.attributes.source) return html`<div>${input(editor, block)}</div>`

  return html`<div>
    ${main(editor, block)}
    ${caption(editor, block)}
  </div>`
}

function main (editor, block) {
  return handleFocus(editor, block, html`<img
    tabindex=0
    data-tabbable=true
    onkeydown=${onkeydown}
    onclick=${onclick}
    onmousedown=${stopPropagation}
    src=${block.attributes.source}
  />`)

  function onkeydown (event) {
    if (event.key === 'Enter') {
      const Paragraph = editor.blockTypes.get('paragraph')
      const newBlock = new Paragraph({ text: '' })
      editor.ui.once('ready', element => element.focus())
      editor.blockList.insertAfter(newBlock, block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Backspace') {
      editor.focus.previous()
      editor.history.capture()
      editor.blockList.remove(block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Delete') {
      editor.focus.next()
      editor.history.capture()
      editor.blockList.remove(block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Tab') {
      if (event.shiftKey) editor.focus.previous()
      else editor.focus.next()
      event.preventDefault()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      editor.focus.previous()
      event.preventDefault()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      editor.focus.next()
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
  return handleFocus(editor, block, html`<input
    data-tabbable=true
    type=text
    onkeydown=${onkeydown}
    oninput=${oninput}
    onclick=${onclick}
    onmousedown=${stopPropagation}
    placeholder="Caption"
    value=${block.attributes.caption}
  />`)

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
    } else if (event.key === 'Tab') {
      if (event.shiftKey) editor.focus.previous()
      else editor.focus.next()
      event.preventDefault()
    } else if (start === 0 && end === 0 &&
        (event.key === 'ArrowUp' || event.key === 'ArrowLeft')) {
      editor.focus.previous()
      event.preventDefault()
    } else if (start === length && end === length &&
               (event.key === 'ArrowDown' || event.key === 'ArrowRight')) {
      editor.focus.next()
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
  return handleFocus(editor, block, html`<input
    data-tabbable=true
    type=file
    onkeydown=${onkeydown}
    onchange=${onchange}
    onclick=${onclick}
    onmousedown=${stopPropagation}
  />`)

  function onkeydown (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      const Paragraph = editor.blockTypes.get('paragraph')
      const newBlock = new Paragraph({ text: '' })
      editor.ui.once('ready', element => element.focus())
      editor.blockList.insertAfter(newBlock, block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Backspace') {
      editor.focus.previous()
      editor.history.capture()
      editor.blockList.remove(block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Delete') {
      editor.focus.next()
      editor.history.capture()
      editor.blockList.remove(block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Tab') {
      if (event.shiftKey) editor.focus.previous()
      else editor.focus.next()
      event.preventDefault()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      editor.focus.previous()
      event.preventDefault()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      editor.focus.next()
      event.preventDefault()
    }
    event.stopPropagation()
  }

  function onchange (event) {
    const file = event.target.files[0]
    if (file) {
      block.attributes.source = window.URL.createObjectURL(file)
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

function handleFocus (editor, block, element) {
  let onfocus, onblur
  return load(element, onload, onunload, 'focus')

  function onload (element) {
    onfocus = function (target) {
      if (target === element) element.focus()
    }
    onblur = function (target) {
      if (target === element) element.blur()
    }
    editor.ui.on('focus', onfocus)
    editor.ui.on('blur', onblur)
    editor.ui.on('focusprevious', onfocus)
    editor.ui.on('focusnext', onfocus)
  }

  function onunload (element) {
    editor.ui.removeListener('focus', onfocus)
    editor.ui.removeListener('blur', onblur)
    editor.ui.removeListener('focusprevious', onfocus)
    editor.ui.removeListener('focusnext', onfocus)
  }
}

function stopPropagation (event) {
  event.stopPropagation()
}
