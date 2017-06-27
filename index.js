const Editor = require('./lib/editor')

class SirTrevor extends Editor {
  constructor () {
    super()
    this.register(require('./lib/modules/ui'))
    this.register(require('./lib/modules/clipboard'))
    this.register(require('./lib/modules/focus'))
    this.register(require('./lib/modules/history'))
    this.register(require('./lib/modules/selection'))
  }

  get selected () {
    return this.blockList.filter(block => this.selection.has(block))
  }

  removeSelected () {
    this.history.capture()
    this.selected.forEach(block => this.blockList.remove(block))
  }
}

module.exports = SirTrevor
