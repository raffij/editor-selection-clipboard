const clone = require('clone')

const GETTER = Symbol()
const SETTER = Symbol()

class History {
  constructor (getter, setter) {
    this[GETTER] = getter
    this[SETTER] = setter
    this.redos = []
    this.undos = []
  }

  undo () {
    if (this.undos.length) {
      this.redos.push(clone(this[GETTER]()))
      this[SETTER](this.undos.pop())
    }
  }

  redo () {
    if (this.redos.length) {
      this.undos.push(clone(this[GETTER]()))
      this[SETTER](this.redos.pop())
    }
  }

  capture () {
    this.undos.push(clone(this[GETTER]()))
  }
}

module.exports = History
