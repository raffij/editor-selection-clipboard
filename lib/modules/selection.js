const nanoraf = require('nanoraf')

module.exports = selection

function selection (editor) {
  class Selection extends WeakSet {
    get head () {
      for (let i = 0; i <= editor.blockList.length - 1; i++) {
        if (this.has(editor.blockList[i])) return i
      }
    }

    get size () {
      let size = 0
      for (let block of editor.blockList) {
        if (this.has(block)) size++
      }
      return size
    }

    get tail () {
      for (let i = editor.blockList.length - 1; i >= 0; i--) {
        if (this.has(editor.blockList[i])) return i
      }
    }

    add (block, setSource = true) {
      const index = editor.blockList.indexOf(block)
      if (index !== -1) {
        if (setSource) this.source = index
        const value = super.add(block)
        return value
      }
      return this
    }

    clear (clearSource = true) {
      editor.blockList.forEach(block => this.delete(block))
      if (clearSource) delete this.source
    }

    enclose (blockA, blockB) {
      const a = editor.blockList.indexOf(blockA)
      const b = editor.blockList.indexOf(blockB)
      if (a !== -1 && b !== -1) {
        let min = Math.min(a, b)
        let max = Math.max(a, b)
        this.clear(false)
        while (min <= max) {
          const block = editor.blockList[min]
          if (block) this.add(block, false)
          min++
        }
      }
    }

    expand (offset) {
      const dest = getDestination.call(this, offset)
      const block = editor.blockList[dest]
      if (block) this.enclose(editor.blockList[this.source], block)
    }

    expandToAll () {
      editor.blockList.forEach(block => this.add(block))
    }

    expandToStart () {
      this.expand(0 - this.head)
    }

    expandToEnd () {
      this.expand((editor.blockList.length - 1) - this.tail)
    }

    move (offset) {
      const dest = getDestination.call(this, offset)
      const block = editor.blockList[dest]
      if (block) {
        this.clear()
        this.add(block)
      }
    }

    moveToStart () {
      this.move(0 - this.source)
    }

    moveToEnd () {
      this.move((editor.blockList.length - 1) - this.source)
    }

    toggle (block) {
      if (this.has(block)) this.delete(block)
      else this.add(block)
    }
  }

  let onmousemoveraf
  editor.ui.state.marquee = {
    bottom: undefined,
    height: undefined,
    left: undefined,
    right: undefined,
    active: false,
    startX: undefined,
    startY: undefined,
    top: undefined,
    width: undefined
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', onkeydown, false)
    document.addEventListener('mousedown', onmousedown, false)
  }

  return new Selection()

  function onkeydown (event) {
    const selection = editor.selection.size
    if (selection && event.key === 'ArrowUp') {
      if (event.shiftKey && event.altKey) editor.selection.expandToStart()
      else if (event.shiftKey) editor.selection.expand(-1)
      else if (event.altKey) editor.selection.moveToStart()
      else editor.selection.move(-1)
      editor.ui.emit('update')
      event.preventDefault()
      // TODO: scroll to head of selected
    } else if (selection && event.key === 'ArrowDown') {
      if (event.shiftKey && event.altKey) editor.selection.expandToEnd()
      else if (event.shiftKey) editor.selection.expand(1)
      else if (event.altKey) editor.selection.moveToEnd()
      else editor.selection.move(1)
      editor.ui.emit('update')
      event.preventDefault()
      // TODO: scroll to tail of selected
    } else if (event.key === 'a' && event.metaKey) {
      editor.selection.expandToAll()
      editor.ui.emit('update')
      event.preventDefault()
    }
  }

  function onmousedown (event) {
    const { marquee } = editor.ui.state
    editor.focus.unset()
    if (!event.shiftKey && !event.metaKey) {
      editor.selection.clear()
      editor.ui.emit('update')
    }
    marquee.startX = event.clientX + window.scrollX
    marquee.startY = event.clientY + window.scrollY
    onmousemoveraf = nanoraf(onmousemove)
    document.addEventListener('mousemove', onmousemoveraf, false)
    document.addEventListener('mouseup', onmouseup, false)
    event.preventDefault()
  }

  function onmousemove (event) {
    const { marquee } = editor.ui.state
    const x = event.clientX + window.scrollX
    const y = event.clientY + window.scrollY
    marquee.active = true
    if (marquee.startX < x) {
      marquee.left = marquee.startX
      marquee.right = x
      marquee.width = x - marquee.startX
    } else {
      marquee.left = x
      marquee.right = marquee.startX
      marquee.width = marquee.startX - x
    }
    if (marquee.startY < y) {
      marquee.top = marquee.startY
      marquee.bottom = y
      marquee.height = y - marquee.startY
    } else {
      marquee.top = y
      marquee.bottom = marquee.startY
      marquee.height = marquee.startY - y
    }
    editor.ui.emit('update')
  }

  function onmouseup (event) {
    const { marquee } = editor.ui.state
    marquee.active = false
    delete marquee.bottom
    delete marquee.height
    delete marquee.left
    delete marquee.right
    delete marquee.startX
    delete marquee.startY
    delete marquee.top
    delete marquee.width
    editor.ui.emit('update')
    document.removeEventListener('mousemove', onmousemoveraf)
    document.removeEventListener('mouseup', onmouseup)
  }
}

function getDestination (offset) {
  if (this.head < this.source) return this.head + offset
  return this.tail + offset
}
