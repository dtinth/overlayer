const electron = require('electron')
const configuration = require('./configuration')
const { app, BrowserWindow, globalShortcut } = require('electron')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

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
}

function createWindow() {
  const win = new BrowserWindow({
    frame: false,
    transparent: true,
    titleBarStyle: 'customButtonsOnHover',
    minimizable: false,
    maximizable: false,
    hasShadow: false,
    webPreferences: {
      preload: `${__dirname}/renderer.js`,
    },
    ...electron.screen.getPrimaryDisplay().bounds,
  })
  win.setIgnoreMouseEvents(true)
  win.setAlwaysOnTop(true, 'screen-saver')
  Object.assign(global, { window: win })
  win.loadFile('renderer.html')
  win.webContents.on('devtools-opened', () => {
    win.setIgnoreMouseEvents(false)
  })
  return win
}

app.on('ready', main)
