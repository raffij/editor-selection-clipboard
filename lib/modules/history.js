const clone = require('clone')
const BlockList = require('../block_list')

module.exports = history

function history (editor) {
  const redos = []
  const undos = []

  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', onkeydown, false)
  }

  return {
    undo () {
      if (undos.length) {
        redos.push(clone(editor.blockList.toJSON()))
        editor.blockList.splice(0, editor.blockList.length,
          ...BlockList.create(editor.blockTypes, undos.pop()))
      }
    },

    redo () {
      if (redos.length) {
        undos.push(clone(editor.blockList.toJSON()))
        editor.blockList.splice(0, editor.blockList.length,
          ...BlockList.create(editor.blockTypes, redos.pop()))
      }
    },

    capture () {
      undos.push(clone(editor.blockList.toJSON()))
    }
  }

  function onkeydown (event) {
    const selection = editor.selection.size
    if (selection && (event.key === 'Delete' || event.key === 'Backspace')) {
      editor.removeSelected()
      editor.ui.emit('update')
      event.preventDefault()
    } else if ((event.key === 'z' || event.key === 'Z') && event.metaKey) {
      if (event.shiftKey) {
        if (redos.length) {
          editor.history.redo()
          editor.ui.emit('update')
          event.preventDefault()
        }
      } else {
        if (undos.length) {
          editor.history.undo()
          editor.ui.emit('update')
          event.preventDefault()
        }
      }
    }
  }
}
