const html = require('bel')

module.exports = marquee

function marquee (editor) {
  const { marquee } = editor.ui.state
  let classList = 'marquee'
  if (marquee.active) classList += ' is-active'
  let style = ''
  if (marquee.height) style += ` height: ${marquee.height}px;`
  if (marquee.left) style += ` left: ${marquee.left}px;`
  if (marquee.top) style += ` top: ${marquee.top}px;`
  if (marquee.width) style += ` width: ${marquee.width}px;`
  return html`<div class=${classList} style=${style}>`
}
