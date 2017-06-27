module.exports = focus

function focus (editor) {
  const focus = {
    get target () {
      return focus.targets.find(target => target === document.activeElement)
    },

    get targets () {
      return Array.from(editor.ui.element.querySelectorAll('[data-tabbable]'))
    },

    set (target) {
      if (focus.targets.includes(target)) editor.ui.emit('focus', target)
    },

    unset () {
      if (focus.target) editor.ui.emit('blur', focus.target)
    },

    next () {
      const target = focus.targets[focus.targets.indexOf(focus.target) + 1]
      if (target) editor.ui.emit('focusnext', target)
    },

    previous () {
      const target = focus.targets[focus.targets.indexOf(focus.target) - 1]
      if (target) editor.ui.emit('focusprevious', target)
    }
  }
  return focus
}
