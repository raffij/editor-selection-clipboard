const BlockList = require('../block_list')

const TYPE = 'application/vnd.sirtrevor+json'

module.exports = domEvents

function domEvents (editor) {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', keydown, false)
    document.addEventListener('copy', copy, false)
    document.addEventListener('cut', cut, false)
    document.addEventListener('paste', paste, false)
    document.addEventListener('click', click, false)
  }

  function keydown (event) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      editor.deleteSelected()
      editor.ui.emit('update')
      event.preventDefault()
    } else if ((event.key === 'z' || event.key === 'Z') && event.metaKey) {
      if (event.shiftKey) {
        if (editor.history.redos.length) {
          editor.history.redo()
          editor.ui.emit('update')
          event.preventDefault()
        }
      } else {
        if (editor.history.undos.length) {
          editor.history.undo()
          editor.ui.emit('update')
          event.preventDefault()
        }
      }
    } else if (event.key === 'ArrowUp') {
      if (event.shiftKey && event.altKey) editor.selection.expandToStart()
      else if (event.shiftKey) editor.selection.expand(-1)
      else if (event.altKey) editor.selection.moveToStart()
      else editor.selection.move(-1)
      editor.ui.emit('update')
      // TODO: scroll to head of selected
    } else if (event.key === 'ArrowDown') {
      if (event.shiftKey && event.altKey) editor.selection.expandToEnd()
      else if (event.shiftKey) editor.selection.expand(1)
      else if (event.altKey) editor.selection.moveToEnd()
      else editor.selection.move(1)
      editor.ui.emit('update')
      // TODO: scroll to tail of selected
    } else if (event.key === 'a' && event.metaKey) {
      editor.selection.expandToAll()
      editor.ui.emit('update')
      event.preventDefault()
    }
  }

  function copy (event) {
    const { selected } = editor
    event.clipboardData.setData(TYPE, JSON.stringify(selected))
    event.clipboardData.setData('text/html', selected.toHTML())
    event.clipboardData.setData('text/plain', selected.toString())
    event.preventDefault()
  }

  function cut (event) {
    const { selected } = editor
    event.clipboardData.setData(TYPE, JSON.stringify(selected))
    event.clipboardData.setData('text/html', selected.toHTML())
    event.clipboardData.setData('text/plain', selected.toString())
    editor.deleteSelected()
    editor.ui.emit('update')
    event.preventDefault()
  }

  function paste (event) {
    let data
    if (event.clipboardData.types.includes(TYPE)) {
      data = JSON.parse(event.clipboardData.getData(TYPE))
    } else if (event.clipboardData.types.includes('text/html')) {
      data = parseText(event.clipboardData.getData('text/html'))
    } else if (event.clipboardData.types.includes('text/plain')) {
      data = parseText(event.clipboardData.getData('text/plain'))
    }

    if (data) {
      const blockList = toBlockList(data)
      if (editor.selection.size) {
        const start = editor.blockList.indexOf(editor.selection.head)
        editor.deleteSelected()
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

  function click () {
    editor.selection.clear()
    editor.ui.emit('update')
  }

  function toBlockList (data) {
    const blockList = new BlockList()
    return data.reduce(function (prev, block) {
      const Ctor = editor.blockTypes.get(block.type)
      if (Ctor) prev.push(new Ctor(block.attributes))
      return prev
    }, blockList)
  }
}

function parseText (value) {
  return value
    .split(/\r?\n/g)
    .filter(text => !!text)
    .map(text => ({ type: 'text', attributes: { text } }))
}
