class BlockList extends Array {
  get valid () {
    return this.every(block => block.valid)
  }

  get errors () {
    return this.reduce(function (prev, block) {
      if (!block.valid) prev.push(block.errors)
      return prev
    }, [])
  }

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

BlockList.create = function create (Ctors, data) {
  const blockList = new BlockList()
  return data.reduce(function (prev, block) {
    const Ctor = Ctors.get(block.type)
    if (Ctor) prev.push(new Ctor(block.attributes))
    return prev
  }, blockList)
}

module.exports = BlockList
