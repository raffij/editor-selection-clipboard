class BlockTypes extends Set {
  get (type) {
    for (let Ctor of this.values()) {
      if (Ctor.type === type) return Ctor
    }
  }
}

module.exports = BlockTypes
