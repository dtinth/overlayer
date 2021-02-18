const { ipcRenderer } = require('electron')

ipcRenderer.on('display', (event, arg) => {
  const count = window.handleOverlaysReceived(arg.overlays)
  ipcRenderer.send('overlayCount', count)
})

setTimeout(() => ipcRenderer.send('overlayCount', state.size), 2000)
