const Block = require('../block')

class Image extends Block {
  toHTML () {
    return `<img src="${this.attributes.src}">`
  }

  toString () {
    return this.attributes.src
  }
}
Image.type = 'image'
Image.defaultAttributes = {
  src: '',
  caption: ''
}

module.exports = Image
