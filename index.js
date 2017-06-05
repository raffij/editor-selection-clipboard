class Editor {
  constructor () {
    this.register(require('./lib/modules/block_list'))
    this.register(require('./lib/modules/block_types'))
    this.register(require('./lib/modules/dom_events'))
    this.register(require('./lib/modules/focus'))
    this.register(require('./lib/modules/history'))
    this.register(require('./lib/modules/selection'))
    this.register(require('./lib/modules/ui'))
  }

  get selected () {
    return this.blockList.filter(block => this.selection.has(block))
  }

  deleteSelected () {
    this.history.capture()
    this.selected.forEach(block => this.blockList.delete(block))
  }

  register (module) {
    const value = module(this)
    if (value) this[module.name] = value
  }
}

module.exports = Editor
