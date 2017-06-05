const Block = require('../block')

class Paragraph extends Block {
  toHTML () {
    return `<p>${this.attributes.text}</p>`
  }

  toString () {
    return this.attributes.text
  }
}
Paragraph.type = 'paragraph'
Paragraph.defaultAttributes = {
  text: '',
  delta: undefined
}

module.exports = Paragraph
