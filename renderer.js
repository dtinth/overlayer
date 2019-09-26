
const { ipcRenderer, remote } = require('electron')
ipcRenderer.on('display', (event, arg) => {
  let element = document.getElementById(arg.overlayId)
  if (!element) {
    element = document.createElement('overlayer-item')
    document.getElementById('overlayer-main').appendChild(element)
  }
  element.innerHTML = arg.html
})

setTimeout(() => {
  document.querySelector('#overlayer-ready').remove()
}, 1000);