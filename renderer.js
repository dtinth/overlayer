const { ipcRenderer } = require('electron')

const data = (window.data = new Map())
ipcRenderer.on('display', (event, arg) => {
  console.log(arg)
  for ([overlayId, html] of Object.entries(arg.overlays)) {
    if (data.get(overlayId) === html) {
      continue
    }
    data.set(overlayId, html)
    let element = document.getElementById(overlayId)
    if (html === null) {
      if (element) element.remove()
      continue
    }
    if (!element) {
      element = document.createElement('overlayer-item')
      element.id = overlayId
      document.getElementById('overlayer-main').appendChild(element)
    }
    element.innerHTML = html
  }
})

setTimeout(() => {
  document.querySelector('#overlayer-ready').remove()
}, 1000)
