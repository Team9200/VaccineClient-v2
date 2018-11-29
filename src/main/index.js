import {
  app,
  BrowserWindow,
  ipcMain
} from 'electron';

import {
  PythonShell
} from 'python-shell';

import os from 'os';
import path from 'path';
import storage from 'electron-json-storage'; 
import fs from 'fs';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV  === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  
  mainWindow = new BrowserWindow({
    height: 590,
    useContentSize: true,
    width: 1000,
    resizable: false,
    nodeIntegration: false
    // frame: false
  })

  mainWindow.setMenu(null);

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('reload', (event, message) => {
  switch (message) {
    case 'ping':
      mainWindow.reload();
      break;
    default:
      break;
  }
});

ipcMain.on('scanStart', (event, message) => {
  console.log('ipcMain:scanStart', message);
  const scanPath = message.path;
  const vaccinePath = message.vaccinePath;
  const options = {
    mode: 'text',
    // pythonOptions: ['-u'],
    scriptPath: path.join(vaccinePath, '\\engine'),
    // scriptPath: path.join(vaccinePath, '/engine'),
    // scriptPath: path.join(__dirname, '../../vaccine/engine/'),
    args: [scanPath]
  };
  PythonShell.run('linvlib.py', options, function (err, results) {
    if (err) console.log(err);
    const scanResult = results.toString().replace(/'/gi, '"').replace(/u\"/gi, '"');
    console.log('Scan Result: ', scanResult);
    event.sender.send('scanResult', scanResult);
  });
});

ipcMain.on('openQuarantine', (event, message) => {
  console.log('ipcMain:openQuarantine');
  // TODO: Fix vaccine path
  const quarantinePath = path.join(__dirname, '../../vaccine/engine/tmp/');
  const quarantineFileList = new Array();

  fs.readdir(quarantinePath, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      console.log(file);
      quarantineFileList.push(file);
    });
    event.sender.send('quarantineFileList', quarantineFileList);
  })
});

ipcMain.on('getLog', function (event, message) { //로그창 띄우기
  const logPath = path.join(__dirname, '../../log.txt');
  console.log(logPath);
  fs.readFile(logPath, (err, data) => {
    if (err) throw err;
    const logData = data.toString('utf8');
    console.log(logData);
    event.sender.send('log', logData);
  })
});

ipcMain.on('setMode', (event, message) => {
  console.log('ipcMain:setMode', message);
  switch (message) {
    case 'collector':
      storage.set('mode', {mode: 'collector'});
      break;
    case 'analyzer':
      storage.set('mode', {mode: 'analyzer'});
      break;
    case 'storage':
      storage.set('mode', {mode: 'storage'});
      break;
    default:
      break;
  }
});


/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */