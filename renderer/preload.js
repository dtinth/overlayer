const { ipcRenderer } = require('electron')

ipcRenderer.on('display', (event, arg) => {
  window.handleOverlaysReceived(arg.overlays)
})
