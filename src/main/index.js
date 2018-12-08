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
import zipFolder from 'zip-folder';
import WebSocket from 'ws';
import express from 'express';

import { start, hello } from './modules/unknownfs/main';
import { createStorage } from './modules/unknownfs/createStorage';
import { headerJson } from './modules/unknownfs/headerParse';

import http from 'http';

require('date-utils');
// //unknownfs.start();

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */

const secretKey = 'b50b695689efca07f704b0aaf3ed512220107a63aad36eca49e24dd02db99b3f'
const publicKey = '0308093cdf35b60def9e5cc664c675c67eae84720e99b14cd8264c59799a8ae8bc'

const secretKeyS = 'c8f6ec34dd93dfcc72c8dc22ca37a33bdcf24032fa016c42dcc7adcbc3299e9a'
const publicKeyS = '0353803934aefd9e46b004b7a3bee7cb59c0b7d12fdc035592035bd2ee499793b7'

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
    // frame: false
    backgroundColor: '#303030'
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

// Collector Node
// scan
let vaccinePath;
storage.has('vaccine', function (err, hasKey) {
  if (err) throw err;
  if (hasKey) {
      storage.get('vaccine', function (err, data) {
          if (err) throw err;
          vaccinePath = data.path;
      });
  }
});

ipcMain.on('scanStart', (event, message) => {
  console.log('ipcMain:scanStart', message);
  try{ fs.mkdirSync('./tmpUnknown'); }catch(e){ if ( e.code != 'EEXIST' ) throw e; };
  const tmpUnknownDir = path.join(__dirname, '../../tmpUnknown');
  const scanPath = message.path;
  // const vaccinePath = message.vaccinePath;
  const options = {
    mode: 'text',
    scriptPath: path.join(vaccinePath, '\\engine'),
    args: [scanPath]
  };
  PythonShell.run('linvlib.py', options, function (err, results) {
    if (err) console.log(err);
    const scanResultStr = results.toString().replace(/'/gi, '"').replace(/u\"/gi, '"');
    const scanResultJSON = JSON.parse(scanResultStr);

    //scan log
    const logPath = path.join(vaccinePath, '/log.json');
    const dt = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

    const newLog = '[SCAN]'+ dt + 'start - ' + scanPath;

    fs.readFile(logPath, (err, data) => {
      if(err) console.log(err);
      const existingLogJson = JSON.parse(data);
      existingLogJson.push(newLog);
      fs.writeFileSync(logPath, JSON.stringify(existingLogJson));
    });
    console.log('Scan Result:', scanResultJSON);
    
    //make unknown.zip
    scanResultJSON.UnknownPaths.forEach((v, i) => {
      console.log(__dirname);
      console.log('src :', v);
      console.log('dst : ', path.join(__dirname, '../../tmpUnknown', v.split('\\').pop()));
      fs.createReadStream(v).pipe(fs.createWriteStream(path.join(__dirname, '../../tmpUnknown', v.split('\\').pop())));
      console.log(fs.copyFileSync)//(v, './tmpUnknown');
    });

    zipFolder(tmpUnknownDir, path.join(__dirname, '../../tmpMalware.zip'), (err) => { 
      if(err) console.log(err); deleteFolderRecursive(tmpUnknownDir);
    });    
    
    event.sender.send('scanResult', scanResultStr, (err) => {console.log(err)});
  });
});

const trackerIP = '192.168.2.131'
ipcMain.on('transferRequestToTracker', (event, message) => {
  const trakerURL = 'http://' + trackerIP + ':29200/sendToStorage?senderPeerId=' + publicKey;
  http.get(trakerURL, (response) => {
    response.on('data', (chunk) => {
      console.log(chunk.toString());
    });
  });
});

// quarantine

ipcMain.on('getQuarantine', (event, message) => {
  console.log('ipcMain:openQuarantine');
  // TODO: Fix vaccine path
  const quarantinePath = path.join(vaccinePath, '/engine/tmp/');
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

// log
ipcMain.on('getLog', function (event, message) { //로그창 띄우기
  const logPath = path.join(vaccinePath, '/log.json');

  fs.readFile(logPath, (err, data) => {
    if (err) throw err;
    const logData = data.toString('utf8');
    event.sender.send('log', logData);
  })
});

// Storage Node
// createStorage(1);
// start();
let malwareMeta;
let receivedData = new Array();
let resultData;

// const ws = new WebSocket('http://192.168.2.2:29200');

ipcMain.on('storageWatch', function(event, message) {
  try{ fs.mkdirSync('./storage'); }catch(e){ if ( e.code != 'EEXIST' ) throw e; };
  try{ fs.mkdirSync('./output'); }catch(e){ if ( e.code != 'EEXIST' ) throw e; };
  // console.log(socket.connected);
  // setInterval(function() {
  //   ws.send(JSON.stringify({
  //     type: 'alive',
  //     peerId: 'peerId'
  //   }));
  // }, 3000)
  hello();
  start();
  
});

const expressApp = express();
const expressPort = 39200;

ipcMain.on('waitCollector', function(event, message) {
  expressApp.listen(expressPort, () => {
    console.log('express server start');
  });

  expressApp.get('/sendRequest', (request, response) => {
    var roomName = request.query.roomName;
    console.log('요청이 들어왔습니다');
    response.send('test send');
  });
});

ipcMain.on('receiveFile', function(event, message) {
  console.log(message);
  if (message.type == 'meta') { 
    console.log('meta received', "message type", typeof(message));
    malwareMeta = message;
  }
  else {
    receivedData = receivedData.concat(message.binary.data);

    if(receivedData.length == message.size) {
      console.log("test", receivedData);
      resultData = new Buffer.from(receivedData);
      fs.writeFileSync('./malware.zip', resultData);
      event.sender.send('receivedFile-reply', 'test');
      console.log('Receive Unknown File Well');	
    }
  }
})

ipcMain.on('getFSHeader', function(event, message) {
  headerJson();
});


// Default

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

ipcMain.on('setVaccinePath', (event, message) => {
  storage.set('vaccine', {path: message});
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


var deleteFolderRecursive = function(dirPath) {
  if( fs.existsSync(dirPath) ) {
    fs.readdirSync(dirPath).forEach(function(file,index){
      var curPath = dirPath + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        console.log(curPath);
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};