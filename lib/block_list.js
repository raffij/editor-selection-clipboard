class BlockList extends Array {
  insertAfter (newBlock, refBlock) {
    return this.splice(this.indexOf(refBlock) + 1, 0, newBlock)
  }

  remove (block) {
    return this.splice(this.indexOf(block), 1)
  }

  select (refBlock, offset) {
    return this[this.indexOf(refBlock) + offset]
  }

  toHTML () {
    return this.reduce(function (prev, block) {
      prev += block.toHTML()
      return prev
    }, '')
  }

  toJSON () {
    return this.map(block => block.toJSON())
  }

  toString () {
    return this.reduce(function (prev, block) {
      prev += block.toString() + '\r\n'
      return prev
    }, '')
  }
}

module.exports = BlockList