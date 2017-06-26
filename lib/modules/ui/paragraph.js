const html = require('bel')
const Nanocomponent = require('nanocomponent')
const Core = require('quill/core')

Core.debug('error')
Core.register({
  'formats/bold': require('quill/formats/bold').default,
  'formats/italic': require('quill/formats/italic').default,
  'formats/link': require('quill/formats/link').default,
  'formats/strike': require('quill/formats/strike').default,
  'formats/underline': require('quill/formats/underline').default
})

class Quill extends Nanocomponent {
  _render () {
    return html`<div></div>`
  }

  _update () {
    return false
  }

  _load () {
    const { editor, block } = this.props

    const instance = new Core(this._element, {
      formats: [
        'bold',
        'italic',
        'link',
        'strike',
        'underline'
      ]
    })
    this.instance = instance
    disableEnter(instance)

    instance.root.dataset.tabbable = true
    instance.root.addEventListener('keydown', onkeydown, false)
    instance.root.addEventListener('copy', oncopy, false)
    instance.root.addEventListener('paste', onpaste, false)
    instance.root.addEventListener('cut', oncut, false)

    instance.on('text-change', function () {
      block.attributes.delta = instance.getContents()
      block.attributes.text = instance.getText()
      editor.ui.emit('update')
    })

    if (block.attributes.delta) {
      instance.setContents(block.attributes.delta)
    } else {
      instance.setText(block.attributes.text)
    }

    editor.ui.emit('ready', instance.root)

    function onkeydown (event) {
      const selection = instance.getSelection()
      const start = selection.index
      const end = selection.index + selection.length
      const length = instance.getLength() - 1

      if (event.key === 'Enter') {
        const Ctor = editor.blockTypes.get('paragraph')
        const newBlock = new Ctor({
          text: instance.getText(end, length),
          delta: instance.getContents(end, length)
        })
        editor.ui.once('ready', element => element.focus())
        instance.setContents(instance.getContents(0, start))
        editor.blockList.insertAfter(newBlock, block)
        editor.ui.emit('update')
        event.preventDefault()
      } else if (start === 0 && end === 0 && event.key === 'Backspace') {
        const prevBlock = editor.blockList.select(block, -1)
        if (prevBlock && prevBlock.attributes.delta !== 'undefined' &&
            block.attributes.delta !== 'undefined') {
          const index = prevBlock.quill.instance.getLength() - 1
          const format = prevBlock.quill.instance.getFormat(1, 1)
          prevBlock.quill.instance.setContents(
            prevBlock.quill.instance.getContents(0, index)
              .concat(instance.getContents()))
          prevBlock.quill.instance.formatLine(1, 1, format)
          prevBlock.quill.instance.setSelection(index, 0)
          editor.blockList.remove(block)
          editor.ui.emit('update')
          event.preventDefault()
        } else {
          editor.ui.emit('focusprevious')
          editor.blockList.remove(block)
          editor.ui.emit('update')
          event.preventDefault()
        }
      } else if (start === length && end === length && event.key === 'Delete') {
        const nextBlock = editor.blockList.select(block, 1)
        if (nextBlock && nextBlock.attributes.delta !== 'undefined' &&
            block.attributes.delta !== 'undefined') {
          const index = instance.getLength() - 1
          instance.setContents(instance.getContents(0, index)
            .concat(nextBlock.quill.instance.getContents()))
          instance.setSelection(index, 0)
          editor.blockList.remove(nextBlock)
          editor.ui.emit('update')
          event.preventDefault()
        } else {
          editor.ui.emit('focusprevious')
          editor.blockList.remove(block)
          editor.ui.emit('update')
          event.preventDefault()
        }
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

    function oncopy (event) {
      event.stopPropagation()
    }

    function onpaste (event) {
      event.stopPropagation()
    }

    function oncut (event) {
      event.stopPropagation()
    }
  }
}

module.exports = paragraph

function paragraph (editor, block) {
  if (!(block.quill instanceof Quill)) block.quill = new Quill()
  return block.quill.render({ editor, block })
}

function disableEnter (quill) {
  const bindings = quill.keyboard.bindings[quill.keyboard.constructor.keys.ENTER]
  const binding = bindings.find(b => b.handler.name === 'handleEnter')
  if (binding) bindings.splice(bindings.indexOf(binding), 1)
}
