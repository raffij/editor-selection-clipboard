const html = require('bel')
const Nanocomponent = require('nanocomponent')
const Core = require('quill/core')
const Inline = require('quill/blots/inline').default
const clone = require('clone')
const nanoraf = require('nanoraf')

const Delta = require('quill-delta')

class Selection extends Inline {
  static create () {
    return super.create()
  }

  static formats () {
    return true
  }
}
Selection.blotName = 'selection'
Selection.tagName = 'SPAN'
Selection.className = 'selection'

Core.debug('error')
Core.register({
  'formats/bold': require('quill/formats/bold').default,
  'formats/italic': require('quill/formats/italic').default,
  'formats/link': require('quill/formats/link').default,
  'formats/strike': require('quill/formats/strike').default,
  'formats/underline': require('quill/formats/underline').default,
  'formats/selection': Selection
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
        'underline',
        'selection'
      ]
    })
    this.instance = instance
    disableEnter(instance)

    instance.root.dataset.tabbable = true
    instance.root.addEventListener('keydown', onkeydown, false)
    instance.root.addEventListener('copy', stopPropagation, false)
    instance.root.addEventListener('paste', stopPropagation, false)
    instance.root.addEventListener('cut', stopPropagation, false)
    instance.root.addEventListener('click', onclick, false)
    instance.root.addEventListener('mousedown', function (event) {
      instance.root.classList.remove('selection-hidden')
      event.stopPropagation()
    }, false)
    instance.root.addEventListener('selectstart', stopPropagation, false)

    this.onfocus = function (target) {
      if (target === instance.root) instance.focus()
    }
    this.onblur = function (target) {
      if (target === instance.root) instance.blur()
    }
    this.onfocusnext = function (target) {
      if (target === instance.root) instance.setSelection(0, 0)
    }
    this.onfocusprevious = function (target) {
      if (target === instance.root) {
        instance.setSelection(instance.getLength(), 0)
      }
    }
    editor.ui.on('focus', this.onfocus)
    editor.ui.on('blur', this.onblur)
    editor.ui.on('focusprevious', this.onfocusprevious)
    editor.ui.on('focusnext', this.onfocusnext)

    instance.on('text-change', function () {
      block.attributes.delta = instance.getContents()
      block.attributes.text = instance.getText()
      editor.ui.emit('update')
    })

    instance.on('selection-change', function (range, prevRange) {
      window.setTimeout(() => {
        if (prevRange && prevRange.length) {
          instance.formatText(prevRange.index, prevRange.length, 'selection', false)
        }
        if (range && range.length) {
          instance.formatText(range.index, range.length, 'selection', true)
          // console.log(stripSelection(instance.getContents()))
        }
      }, 100)
    })

    instance.root.addEventListener('selectstart', function () {
      instance.focus()
      let prevSelection = instance.getSelection()

      document.addEventListener('mousemove', onmousemove)
      document.addEventListener('mouseup', onmouseup)

      function onmousemove () {
        // if (prevSelection) instance.formatText(prevSelection.index, prevSelection.length, 'selection', false)
        // instance.focus()
        const selection = instance.getSelection()
        console.log(selection)
        // instance.formatText(selection.index, selection.length, 'selection', true)
        prevSelection = selection
      }

      function onmouseup () {
        document.removeEventListener('mousemove', onmousemove)
        document.removeEventListener('mouseup', onmouseup)
        prevSelection = instance.getSelection()
      }
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
        if (prevBlock && typeof prevBlock.attributes.delta !== 'undefined' &&
            typeof block.attributes.delta !== 'undefined') {
          const index = prevBlock.quill.instance.getLength() - 1
          const format = prevBlock.quill.instance.getFormat(1, 1)
          prevBlock.quill.instance.setContents(
            prevBlock.quill.instance.getContents(0, index)
              .concat(instance.getContents()))
          prevBlock.quill.instance.formatLine(1, 1, format)
          prevBlock.quill.instance.setSelection(index, 0)
          editor.history.capture()
          editor.blockList.remove(block)
          editor.ui.emit('update')
          event.preventDefault()
        } else {
          editor.focus.previous()
          editor.history.capture()
          editor.blockList.remove(block)
          editor.ui.emit('update')
          event.preventDefault()
        }
      } else if (start === length && end === length && event.key === 'Delete') {
        const nextBlock = editor.blockList.select(block, 1)
        if (nextBlock && typeof nextBlock.attributes.delta !== 'undefined' &&
            typeof block.attributes.delta !== 'undefined') {
          const index = instance.getLength() - 1
          instance.setContents(instance.getContents(0, index)
            .concat(nextBlock.quill.instance.getContents()))
          instance.setSelection(index, 0)
          editor.history.capture()
          editor.blockList.remove(nextBlock)
          editor.ui.emit('update')
          event.preventDefault()
        } else {
          editor.history.capture()
          editor.blockList.remove(nextBlock)
          editor.ui.emit('update')
          event.preventDefault()
        }
      } else if (event.key === 'Tab') {
        if (event.shiftKey) editor.focus.previous()
        else editor.focus.next()
        event.preventDefault()
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        if (start === 0 && end === 0 && event.shiftKey) {
          editor.focus.unset()
          editor.selection.add(editor.blockList.select(block, -1))
          editor.ui.emit('update')
          event.preventDefault()
        } else if (start === 0 && end === 0) {
          editor.focus.previous()
          event.preventDefault()
        } else if (start === 0 && event.shiftKey) {
          editor.focus.unset()
          editor.selection.add(block)
          editor.selection.expand(-1)
          editor.ui.emit('update')
          event.preventDefault()
        }
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        if (start === length && end === length && event.shiftKey) {
          editor.focus.unset()
          editor.selection.add(editor.blockList.select(block, 1))
          editor.ui.emit('update')
          event.preventDefault()
        } else if (start === length && end === length) {
          editor.focus.next()
          event.preventDefault()
        } else if (end === length && event.shiftKey) {
          editor.focus.unset()
          editor.selection.add(block)
          editor.selection.expand(1)
          editor.ui.emit('update')
          event.preventDefault()
        }
      }
      event.stopPropagation()
    }

    function onclick (event) {
      editor.selection.clear()
      editor.ui.emit('update')
      event.stopPropagation()
    }
  }

  _unload () {
    const { editor } = this.props
    editor.ui.removeListener('focus', this.onfocus)
    editor.ui.removeListener('blur', this.onblur)
    editor.ui.removeListener('focusprevious', this.onfocusprevious)
    editor.ui.removeListener('focusnext', this.onfocusnext)
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

function stopPropagation (event) {
  event.stopPropagation()
}

function stripSelection (delta) {
  return normalizeDelta(new Delta(delta.map(function (op) {
    if (op.attributes && op.attributes.selection && op.attributes.selection === true) delete op.attributes.selection
    if (op.attributes && !Object.keys(op.attributes).length) delete op.attributes
    return op
  })))
}

function normalizeDelta (delta) {
  return delta.reduce(function (delta, op) {
    if (op.insert === 1) {
      let attributes = clone(op.attributes);
      delete attributes['image'];
      return delta.insert({ image: op.attributes.image }, attributes);
    }
    if (op.attributes != null && (op.attributes.list === true || op.attributes.bullet === true)) {
      op = clone(op);
      if (op.attributes.list) {
        op.attributes.list = 'ordered';
      } else {
        op.attributes.list = 'bullet';
        delete op.attributes.bullet;
      }
    }
    if (typeof op.insert === 'string') {
      let text = op.insert.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      return delta.insert(text, op.attributes);
    }
    return delta.push(op);
  }, new Delta());
}
