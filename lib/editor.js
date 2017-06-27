class Editor {
  constructor () {
    this.register(require('./modules/block_list'))
    this.register(require('./modules/block_types'))
  }

  register (module) {
    const value = module(this)
    if (value) this[module.name] = value
  }
}

module.exports = Editor
