const html = require('bel')
const Nanocomponent = require('nanocomponent')
const Core = require('quill/core')

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

    const instance = new Core(this._element)
    this.instance = instance
    disableEnter(instance)

    this.onrequestfocus = function (target) {
      if (target === instance.root) instance.focus()
    }
    editor.focus.addTarget(instance.root)
    editor.ui.on('focus', this.onrequestfocus)

    instance.root.addEventListener('keydown', onkeydown, false)
    instance.root.addEventListener('click', onclick, false)
    instance.root.addEventListener('focus', onfocus, false)
    instance.root.addEventListener('blur', onblur, false)
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
        const Ctor = block.constructor
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
        if (prevBlock && prevBlock.constructor.type === block.constructor.type) {
          const index = prevBlock.quill.instance.getLength() - 1
          prevBlock.quill.instance.setContents(
            prevBlock.quill.instance.getContents(0, index)
              .concat(instance.getContents()))
          prevBlock.quill.instance.setSelection(index, 0)
          editor.blockList.remove(block)
          editor.ui.emit('update')
          event.preventDefault()
        } else {
          editor.ui.emit('focus', editor.focus.previous)
          editor.blockList.remove(block)
          editor.ui.emit('update')
          event.preventDefault()
        }
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

    function onclick (event) {
      editor.selection.clear()
      editor.ui.emit('update')
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

  _unload () {
    const { editor } = this.props
    editor.focus.removeTarget(this.instance.root)
    editor.ui.removeListener('focus', this.onrequestfocus)
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
