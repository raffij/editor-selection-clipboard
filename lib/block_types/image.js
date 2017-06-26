const Block = require('../block')

class Image extends Block {
  toHTML () {
    return `<img src="${this.attributes.source}">`
  }

  toString () {
    return this.attributes.source
  }
}
Image.type = 'image'
Image.defaultAttributes = {
  source: undefined,
  caption: ''
}
Image.schema = {
  source: {
    required: true,
    type: 'string'
  },
  caption: {
    type: 'string'
  }
}

module.exports = Image
