const ITEMS = Symbol()

class Selection extends WeakSet {
  constructor (items) {
    super()
    this[ITEMS] = items
  }

  get head () {
    for (let i = 0; i <= this[ITEMS].length - 1; i++) {
      if (this.has(this[ITEMS][i])) return i
    }
  }

  get size () {
    let size = 0
    for (let item of this[ITEMS]) {
      if (this.has(item)) size++
    }
    return size
  }

  get tail () {
    for (let i = this[ITEMS].length - 1; i >= 0; i--) {
      if (this.has(this[ITEMS][i])) return i
    }
  }

  add (item, setSource = true) {
    const index = this[ITEMS].indexOf(item)
    if (index !== -1) {
      if (setSource) this.source = index
      const value = super.add(item)
      return value
    }
    return this
  }

  clear (clearSource = true) {
    this[ITEMS].forEach(item => this.delete(item))
    if (clearSource) delete this.source
  }

  enclose (itemA, itemB) {
    const a = this[ITEMS].indexOf(itemA)
    const b = this[ITEMS].indexOf(itemB)
    if (a !== -1 && b !== -1) {
      let min = Math.min(a, b)
      let max = Math.max(a, b)
      this.clear(false)
      while (min <= max) {
        const item = this[ITEMS][min]
        if (item) this.add(item, false)
        min++
      }
    }
  }

  expand (offset) {
    const dest = getDestination.call(this, offset)
    const item = this[ITEMS][dest]
    if (item) this.enclose(this[ITEMS][this.source], item)
  }

  expandToAll () {
    this[ITEMS].forEach(item => this.add(item))
  }

  expandToStart () {
    this.expand(0 - this.head)
  }

  expandToEnd () {
    this.expand((this[ITEMS].length - 1) - this.tail)
  }

  move (offset) {
    const dest = getDestination.call(this, offset)
    const item = this[ITEMS][dest]
    if (item) {
      this.clear()
      this.add(item)
    }
  }

  moveToStart () {
    this.move(0 - this.source)
  }

  moveToEnd () {
    this.move((this[ITEMS].length - 1) - this.source)
  }

  toggle (item) {
    if (this.has(item)) this.delete(item)
    else this.add(item)
  }
}

module.exports = Selection

function getDestination (offset) {
  if (this.head < this.source) return this.head + offset
  return this.tail + offset
}
