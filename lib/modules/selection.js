const Selection = require('../selection')

module.exports = selection

function selection (editor) {
  return new Selection(editor.blockList)
}
