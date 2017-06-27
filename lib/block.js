const validator = require('is-my-json-valid')

class Block {
  constructor (attributes = {}) {
    this.key = key()
    this.attributes = Object.assign({}, this.constructor.defaultAttributes,
      attributes)
    this.validate = validator({
      type: 'object',
      properties: this.constructor.schema
    })
  }

  get valid () {
    return this.validate(this.attributes)
  }

  get errors () {
    this.validate(this.attributes)
    return this.validate.errors
  }

  toHTML () {
    throw new Error('Not implemented')
  }

  toJSON () {
    return {
      type: this.constructor.type,
      attributes: this.attributes
    }
  }

  toString () {
    throw new Error('Not implemented')
  }
}

module.exports = Block

function key () {
  return Math.random().toString(36).substr(2, 5)
}
