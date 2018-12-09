import {
  app,
  BrowserWindow,
  // ipcMain: ipc
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
import express from 'express';

import { start } from './modules/unknownfs/main';
import { createStorage } from './modules/unknownfs/createStorage';
import { headerJson } from './modules/unknownfs/headerParse';

import http from 'http';

require('date-utils');

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
let sendfileWindow
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

function createSendfileWindow(url, pid) {
  sendfileWindow = new BrowserWindow({
    height: 300,
    useContentSize: true,
    width: 500,
    resizable: false,
    show: true
  })
  
  sendfileWindow.setMenu(null);
  console.log('send File path', path.join(__dirname, '../renderer/sendfile.html'));
  sendfileWindow.loadURL(path.join(__dirname, '../renderer/sendfile.html'));

  // sendfileWindow.webContents.on('did-finish-load', () => {
  //   sendfileWindow.webContents.send('getCPid', url, pid);
  // });

  sendfileWindow.on('closed', () => {
    sendfileWindow = null
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

// get Vaccine Path
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


// Collector Node
// scan


ipcMain.on('scanStart', (event, message) => {
  console.log('ipcMain:scanStart', message);
  try{ fs.mkdirSync('./tmpUnknown'); }catch(e){ if ( e.code != 'EEXIST' ) throw e; };
  const tmpUnknownDir = path.join(__dirname, '../../tmpUnknown');
  let scanPath = message.path;
  const options = {
    mode: 'text',
    scriptPath: path.join(vaccinePath, '\\engine'),
    args: [scanPath]
  };
  PythonShell.run('linvlib.py', options, function (err, results) {
    if (err) console.log(err);
    const scanResultStr = results.toString().replace(/'/gi, '"').replace(/u\"/gi, '"');
    const scanResultJSON = JSON.parse(scanResultStr);

    //scan lo
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
      console.log(fs.copyFileSync);
    });

    zipFolder(tmpUnknownDir, path.join(__dirname, '../../tmpMalware.zip'), (err) => { 
      if(err) console.log(err); deleteFolderRecursive(tmpUnknownDir);
    });

    event.sender.send('scanResult', scanResultStr, (err) => {console.log(err)});
  });
});

const trackerIP = '192.168.24.185';

ipcMain.on('transferRequestToTracker', (event, message) => {
  console.log('call tracker');
  const trakerURL = 'http://' + trackerIP + ':29200/sendToStorage?senderPeerId=' + publicKey;

  // http.get(trakerURL, (response) => {
  //   response.on('data', (storageInfo) => {
  //     console.log(JSON.parse(storageInfo).SignalingServerURL);
  //     setTimeout(() => {
  //       createSendfileWindow('ws://' + JSON.parse(storageInfo).SignalingServerURL, publicKey);
  //       // event.sender.send('getCPid', 'ws://' + JSON.parse(storageInfo).SignalingServerURL, publicKey);
  //     }, 5000)
  //   });
  // });

  setTimeout(() => {
    createSendfileWindow(trackerIP, publicKey);
    // event.sender.send('getCPid', 'ws://' + JSON.parse(storageInfo).SignalingServerURL, publicKey);
  }, 1000)
  
});

ipcMain.on('refresh', (event, message) => {
  mainWindow.reload();
})

const chunkSize = 16384;
var sliced_data = '';
var pieceNum = 0;
ipcMain.on('fileRequest', function(event, msg) {
    console.log('fileREQ In');
    fs.readFile(path.join(__dirname, '../../tmpMalware.zip'), function(err, data) {
        console.log(path.join(__dirname, '../../tmpMalware.zip'));
        console.log(data);
        var encoded_data = base64Encode(data);
        event.sender.send('fileRequest-meta', 'meta', 'Malware.zip', Buffer.from(data).length, Math.ceil((Buffer.from(data).length/chunkSize)));
        for(var i=0, j=0; i<encoded_data.length; i+=chunkSize, j++) {
            sliced_data = sliceEncodedData(encoded_data, i);
            event.sender.send('fileRequest-reply', pieceNum, sliced_data);
            pieceNum = pieceNum + 1;
        }
        pieceNum = 0;
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

const storageSize = 1;
const mining = true;

const expressApp = express();
const expressPort = 39200;

ipcMain.on('storageWatch', function(event, message) {
  try{ fs.mkdirSync('./storage'); }catch(e){ if ( e.code != 'EEXIST' ) throw e; };
  try{ fs.mkdirSync('./output'); }catch(e){ if ( e.code != 'EEXIST' ) throw e; };
  setInterval(function() {
    const trakerURL = 'http://' + trackerIP + ':29200/report?peerId=' + publicKeyS + '&nodeType=storage&storageSize=' + storageSize + '&remainingStorageSize=' + 100000 + '&mining=' + mining;
    http.get(trakerURL, (response) => {
      response.on('data', (chunk) => {
        console.log(chunk.toString());
      });
    });
  }, 20000);

  expressApp.listen(expressPort, () => {
    console.log('express server start');
  });

  expressApp.get('/sendRequest', (request, response) => {
    const roomName = request.query.roomName;
    console.log(roomName);
    event.sender.send('collectorPid', roomName);
    response.send('test send');
  });

  start();
  
});


ipcMain.on('receiveFile', function(event, message) {
  console.log(message);
  if (message.type == 'meta') { 
    console.log('meta received', "message type", typeof(message));
    malwareMeta = message;
  }
  else {
    receivedData = receivedData.concat(message.binary.data);

    if(receivedData.length == malwareMeta.size) {
      console.log("test", receivedData);
      resultData = new Buffer.from(receivedData);
      fs.writeFileSync('./malware.zip', resultData);
      // event.sender.send('receivedFile-reply', 'test');
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


/////////////////////////
////// etc func /////////
/////////////////////////

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

function base64Encode(data) {
  return new Buffer.from(data);
 }; 

function sliceEncodedData(encoded_data, offset) {
  return encoded_data.slice(offset, offset+chunkSize);
};