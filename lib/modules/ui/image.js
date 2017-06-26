const html = require('bel')

module.exports = image

function image (editor, block) {
  if (!block.attributes.source) return html`<div>${input(editor, block)}</div>`

  return html`<div>
    ${main(editor, block)}
    ${caption(editor, block)}
  </div>`
}

function main (editor, block) {
  return html`<img
    tabindex=0
    data-tabbable=true
    onkeydown=${onkeydown}
    src=${block.attributes.source}
  />`

  function onkeydown (event) {
    if (event.key === 'Enter') {
      const Paragraph = editor.blockTypes.get('paragraph')
      const newBlock = new Paragraph({ text: '' })
      editor.ui.once('ready', element => element.focus())
      editor.blockList.insertAfter(newBlock, block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Backspace') {
      editor.ui.emit('focusprevious')
      editor.blockList.remove(block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Tab') {
      if (event.shiftKey) editor.ui.emit('focusprevious')
      else editor.ui.emit('focusnext')
      event.preventDefault()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      editor.ui.emit('focusprevious')
      event.preventDefault()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      editor.ui.emit('focusnext')
      event.preventDefault()
    }
    event.stopPropagation()
  }
}

function caption (editor, block) {
  return html`<input
    data-tabbable=true
    type=text
    onkeydown=${onkeydown}
    oninput=${oninput}
    placeholder="Caption"
    value=${block.attributes.caption}
  />`

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
      if (event.shiftKey) editor.ui.emit('focusprevious')
      else editor.ui.emit('focusnext')
      event.preventDefault()
    } else if (start === 0 && end === 0 &&
        (event.key === 'ArrowUp' || event.key === 'ArrowLeft')) {
      editor.ui.emit('focusprevious')
      event.preventDefault()
    } else if (start === length && end === length &&
               (event.key === 'ArrowDown' || event.key === 'ArrowRight')) {
      editor.ui.emit('focusnext')
      event.preventDefault()
    }
    event.stopPropagation()
  }

  function oninput (event) {
    block.attributes.caption = event.target.value
    editor.ui.emit('update')
  }
}

function input (editor, block) {
  return html`<input
    data-tabbable=true
    type=file
    onkeydown=${onkeydown}
    onchange=${onchange}
  />`

  function onkeydown (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      const Paragraph = editor.blockTypes.get('paragraph')
      const newBlock = new Paragraph({ text: '' })
      editor.ui.once('ready', element => element.focus())
      editor.blockList.insertAfter(newBlock, block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Backspace') {
      editor.ui.emit('focusprevious')
      editor.blockList.remove(block)
      editor.ui.emit('update')
      event.preventDefault()
    } else if (event.key === 'Tab') {
      if (event.shiftKey) editor.ui.emit('focusprevious')
      else editor.ui.emit('focusnext')
      event.preventDefault()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      editor.ui.emit('focusprevious')
      event.preventDefault()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      editor.ui.emit('focusnext')
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
}
