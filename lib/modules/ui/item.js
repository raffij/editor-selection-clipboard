const html = require('bel')
const load = require('on-load')
const nanoraf = require('nanoraf')
const toolbar = require('./toolbar')

module.exports = item

function item (editor, block) {
  let classList = `item ${block.constructor.type}`
  if (editor.selection.has(block)) classList += ' is-selected'

  const element = html`<div id=${block.key} class=${classList}>
    ${toolbar(editor, block)}
    ${main(editor, block)}
  </div>`
  return load(element, onload, onunload, 'item')

  function onload (element) {
    element.addEventListener('focus', onfocus, true)
    element.addEventListener('blur', onblur, true)
  }

  function onunload (element) {
    element.removeEventListener('focus', onfocus, true)
    element.removeEventListener('blur', onblur, true)
  }

  function onfocus (event) {
    if (editor.ui.state.focused !== block) {
      editor.ui.state.focused = block
      editor.ui.emit('update')
    }
  }

  function onblur (event) {
    if (typeof editor.ui.state.focused !== 'undefined') {
      delete editor.ui.state.focused
      editor.ui.emit('update')
    }
  }
}

function main (editor, block) {
  let onmousemove

  const element = html`<div
    class="content">
      ${inner(editor, block)}
    </div>
  </div>`
  return load(element, onload, onunload, 'item')

  function onload (element) {
    onmousemove = nanoraf(function (event) {
      if (editor.ui.state.marquee.active) {
        const rect = element.getBoundingClientRect()
        if (overlaps(editor.ui.state.marquee, rect)) {
          editor.selection.add(block)
          editor.ui.emit('update')
        } else if (!event.shiftKey && !event.metaKey) {
          editor.selection.delete(block)
          editor.ui.emit('update')
        }
      }
    })
    document.addEventListener('mousemove', onmousemove, false)
  }

  function onunload (element) {
    document.removeEventListener('mousemove', onmousemove, false)
  }
}

function inner (editor, block) {
  switch (block.constructor.type) {
    case 'paragraph':
      return require('./paragraph')(editor, block)
    case 'image':
      return require('./image')(editor, block)
  }
}

function overlaps (a, b) {
  return a.right >= b.left && a.bottom >= b.top &&
         a.top <= b.bottom && a.left <= b.right
}
