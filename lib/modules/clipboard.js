const BlockList = require('../block_list')

const TYPE = 'application/vnd.sirtrevor+json'

module.exports = clipboard

function clipboard (editor) {
  if (typeof document !== 'undefined') {
    document.addEventListener('copy', oncopy, false)
    document.addEventListener('cut', oncut, false)
    document.addEventListener('paste', onpaste, false)
  }

  function oncopy (event) {
    const { selected } = editor
    event.clipboardData.setData(TYPE, JSON.stringify(selected))
    event.clipboardData.setData('text/html', selected.toHTML())
    event.clipboardData.setData('text/plain', selected.toString())
    event.preventDefault()
  }

  function oncut (event) {
    const { selected } = editor
    event.clipboardData.setData(TYPE, JSON.stringify(selected))
    event.clipboardData.setData('text/html', selected.toHTML())
    event.clipboardData.setData('text/plain', selected.toString())
    editor.removeSelected()
    editor.ui.emit('update')
    event.preventDefault()
  }

  function onpaste (event) {
    let data
    if (event.clipboardData.types.includes(TYPE)) {
      data = JSON.parse(event.clipboardData.getData(TYPE))
    } else if (event.clipboardData.types.includes('text/html')) {
      data = parseText(event.clipboardData.getData('text/html'))
    } else if (event.clipboardData.types.includes('text/plain')) {
      data = parseText(event.clipboardData.getData('text/plain'))
    }

    if (data) {
      const blockList = BlockList.create(editor.blockTypes, data)
      if (editor.selection.size) {
        const start = editor.blockList.indexOf(editor.selection.head)
        editor.removeSelected()
        editor.blockList.splice(start, 0, ...blockList)
      } else {
        editor.blockList.splice(editor.blockList.length, 0, ...blockList)
      }
      editor.selection.clear()
      editor.ui.emit('update')
    } else {
      console.info('Unsupported type')
    }
  }
}

function parseText (value) {
  return value
    .split(/\r?\n/g)
    .filter(text => !!text)
    .map(text => ({ type: 'text', attributes: { text } }))
}
