class Editor {
  constructor () {
    this.register(require('./lib/modules/block_list'))
    this.register(require('./lib/modules/block_types'))
    this.register(require('./lib/modules/history'))
    this.register(require('./lib/modules/ui'))
  }

  register (module) {
    const value = module(this)
    if (value) this[module.name] = value
  }
}

module.exports = Editor
