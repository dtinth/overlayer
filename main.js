const electron = require('electron')
const configuration = require('./configuration')
const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Tray,
  Menu,
} = require('electron')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron
if (!app.requestSingleInstanceLock()) {
  app.quit()
}
app.whenReady().then(() => {
  const tray = new Tray(require('path').join(__dirname, 'build/tray.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', click: () => app.quit() },
  ])
  tray.setToolTip('Overlayer')
  tray.setContextMenu(contextMenu)
})

/** @type {BrowserWindow | undefined} */
let currentWindow

function main() {
  currentWindow = createWindow()

  const app = express()
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(cors())

  const auth = (req, res, next) => {
    if (req.params.key !== configuration.key) {
      res.status(401).json('Unauthorized')
      return
    }
    next()
  }
  app.use('/overlayer/:key/:overlayId', auth, (req, res, next) => {
    const overlays = {}
    const win = currentWindow
    overlays[req.params.overlayId] = String(req.body.html || req.query.html)
    win.webContents.send('display', { overlays })
    res.status(200).json('ok')
  })
  app.use('/overlayer/:key', auth, (req, res, next) => {
    const win = currentWindow
    const objectify = x => (typeof x !== 'object' || !x ? {} : x)
    const overlays = {
      ...(objectify(req.query.overlays) || {}),
      ...(objectify(req.body.overlays) || {}),
    }
    win.webContents.send('display', { overlays })
    res.status(200).json('ok')
  })
  app.listen(29292, '127.0.0.1', function(err) {
    if (err) {
      throw err
    }
    console.log('Listening on port', this.address().port)
  })
  electron.screen.on('display-metrics-changed', () => {
    const win = currentWindow
    win.setBounds(electron.screen.getPrimaryDisplay().bounds)
  })
  globalShortcut.register('Command+Ctrl+Shift+Alt+R', () => {
    const oldWindow = currentWindow
    currentWindow = createWindow()
    oldWindow.destroy()
  })
  ipcMain.on('overlayCount', (event, c) => {
    if (!currentWindow) return
    const visible = currentWindow.isVisible()
    if (c > 0 && !visible) {
      currentWindow.show()
      console.log('Show window')
    } else if (c === 0 && visible) {
      currentWindow.hide()
      console.log('Hide window')
    }
  })
}

function createWindow() {
  const win = new BrowserWindow({
    frame: false,
    transparent: true,
    titleBarStyle: 'customButtonsOnHover',
    minimizable: false,
    maximizable: false,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: `${__dirname}/renderer/preload.js`,
    },
    ...electron.screen.getPrimaryDisplay().bounds,
  })
  win.setIgnoreMouseEvents(true)
  win.setAlwaysOnTop(true, 'screen-saver')
  Object.assign(global, { window: win })
  win.loadFile('renderer/index.html')
  win.webContents.on('devtools-opened', () => {
    win.setIgnoreMouseEvents(false)
  })
  return win
}

app.on('ready', main)
