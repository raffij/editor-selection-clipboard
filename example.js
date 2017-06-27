const SirTrevor = require('./')
const Paragraph = require('./lib/paragraph')
const Image = require('./lib/image')

const editor = new SirTrevor()
window.editor = editor
editor.blockTypes.add(Paragraph)
editor.blockTypes.add(Image)
document.body.appendChild(editor.ui.element)

editor.blockList.push(new Paragraph({ text: 'BEM has been our go-to solution for writing CSS for a number of years now. We’ve had some good and some not-so-good experiences with it, but overall it’s proven to be a very solid approach to writing CSS for the kinds of projects we have.' }))
editor.blockList.push(new Paragraph({ text: 'A year-or-so ago I came across Tachyons and I got really curious about it; I’d only heard good things and wanted to try it out for myself. There was a collective frown from my colleagues here - the consensus being that atomic CSS was a thing of the past that should be avoided at all costs. I ended up using anyway for one aspect of our side project Bloop and I was absolutely delighted with it.' }))
editor.blockList.push(new Image({ source: 'https://madebymany-v2-prod.s3.amazonaws.com/uploads/blog/featured_image/1183/large_react_native_series_2.png', caption: '' }))
editor.blockList.push(new Image())
editor.ui.emit('update')
