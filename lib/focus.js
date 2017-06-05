class Focus {
  constructor () {
    this.target = undefined
    this.targets = []
  }

  get next () {
    return this.targets[this.targets.indexOf(this.target) + 1]
  }

  get previous () {
    return this.targets[this.targets.indexOf(this.target) - 1]
  }

  addTarget (target) {
    return this.targets.push(target)
  }

  removeTarget (target) {
    return this.targets.splice(this.targets.indexOf(target), 1)
  }
}

module.exports = Focus
