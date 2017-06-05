const History = require('../history')
const BlockList = require('../block_list')

module.exports = history

function history (editor) {
  return new History(getter, setter)

  function getter () {
    return editor.blockList.map(block => block.toJSON())
  }

  function setter (value) {
    editor.blockList.splice(0, editor.blockList.length, ...toBlockList(value))
  }

  function toBlockList (data) {
    const blockList = new BlockList()
    return data.reduce(function (prev, block) {
      const Ctor = editor.blockTypes.get(block.type)
      if (Ctor) prev.push(new Ctor(block.attributes))
      return prev
    }, blockList)
  }
}
