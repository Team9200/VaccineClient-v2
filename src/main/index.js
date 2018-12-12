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
import express from 'express';

import { deleteFolderRecursive, base64Encode, sliceEncodedData } from './modules/util'
import { start } from './modules/unknownfs/main';
import { createStorage } from './modules/unknownfs/createStorage';
import { headerJson } from './modules/unknownfs/headerParse';

import http from 'http';

require('date-utils');

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

//get sk, pk
let secretKey;
let publicKey;

storage.has('account', function (err, hasKey) {
  if (err) throw err;
  if (hasKey) {
      storage.get('account', function (err, data) {
          if (err) throw err;
          console.log(data);
          secretKey = data.sk;
          publicKey = data.pk;
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

const trackerIP = '192.168.2.131';

ipcMain.on('transferRequestToTracker', (event, message) => {
  const trakerURL = 'http://' + trackerIP + ':29200/sendToStorage?senderPeerId=' + publicKey;
  http.get(trakerURL, (response) => {
    response.on('data', (storageInfo) => {
      console.log(JSON.parse(storageInfo).SignalingServerURL);
      setTimeout(() => {event.sender.send('getCPid', 'ws://' + JSON.parse(storageInfo).SignalingServerURL, publicKey);}, 3000)
    });
  });
 });


const chunkSize = 16384;
var sliced_data = '';
ipcMain.on('fileRequest', function(event, msg) {
    fs.readFile(path.join(__dirname, '../../tmpMalware.zip'), function(err, data) {
        let encoded_data = base64Encode(data);
        event.sender.send('fileRequest-meta', 'meta', 'Malware.zip', Buffer.from(data).length, Math.ceil((Buffer.from(data).length/chunkSize)));
        for(let i=0, j=0; i<encoded_data.length; i+=chunkSize, j++) {
            sliced_data = sliceEncodedData(encoded_data, i);
            event.sender.send('fileRequest-reply', j + 1, sliced_data);
        }
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Storage Node
// createStorage(1);
// start();
let malwareMeta;
let receivedData = new Array();
let tempData = new Array();
let resultData;

const storageSize = 1;
const mining = true;

ipcMain.on('storageInit', function(event, message) {
  //require dir
  try{ fs.mkdirSync('./storage'); }catch(e){ if ( e.code != 'EEXIST' ) throw e; };
  try{ fs.mkdirSync('./output'); }catch(e){ if ( e.code != 'EEXIST' ) throw e; };

  //heart beat
  setInterval(function() {
    const trakerURL = 'http://' + trackerIP + ':29200/report?peerId=' + publicKey + '&nodeType=storage&storageSize=' + storageSize + '&remainingStorageSize=' + 100000 + '&mining=' + mining;
    http.get(trakerURL, (response) => {
      response.on('data', (data) => {
        if(data.success == true) console.log('heart beat good');
      });
    });
  }, 5000);

  //Wait file receive/send requests
  const expressApp = express();
  const expressPort = 39200;

  expressApp.listen(expressPort, () => {
    console.log('file wait server start');
  });

  //Collector to Storage Unknown send
  expressApp.get('/unknownCtoS', (request, response) => {
    const collectorPid = request.query.collectorPid;
    event.sender.send('collectorPid', collectorPid);
  });
  
  //Storage to Analyer Unknown send
  expressApp.get('/unknownStoA', (request, response) => {
    console.log('getunknownStoA');
    const analyzerPid = request.query.peerId;
    
    event.sender.send('analyzerPid', analyzerPid);

    //extrect random unknown sample
    fs.writeFileSync('./storage/give', '');
  });

  expressApp.get('/malwareStoS', (request, response) => {
    console.log('get malware S to S');
    const storagePid = request.query.peerId;

    event.sender.send('storagePid', storagePid);
  })

  start();
});

//Receved Unknown Sample handle from Collector
ipcMain.on('receiveFile', function(event, message) {
  console.log(message);
  if (message.type == 'meta') {
    malwareMeta = message;
  }
  else {
    tempData[message.pieceNum-1] = JSON.stringify(message);
    if(tempData.length == malwareMeta.pieces) {
      for(var i = 0; i < tempData.length; i++) {
        console.log("tempData[i].pieceNum", JSON.parse(tempData[i]).pieceNum);
        receivedData = receivedData.concat(JSON.parse(tempData[i]).binary.data);
      }
      resultData = new Buffer.from(receivedData);
      fs.writeFileSync('./malware.zip', resultData);
      console.log('Receive Unknown File Well');
    }
  }
})

//Send Unknown Sample to Analyzer
ipcMain.on('unknownRequest', function(event, msg) {
  console.log('unknownREQ In');
  fs.readFile('./output/unknown', function(err, data) {
      // console.log(data);
      var encoded_data = base64Encode(data);
      event.sender.send('unknownRequest-meta', 'meta', 'unknown.zip', Buffer.from(data).length, Math.round((Buffer.from(data).length/chunkSize)));
      for(var i=0, j=0; i<encoded_data.length; i+=chunkSize, j++) {
          sliced_data = sliceEncodedData(encoded_data, i);
          event.sender.send('unknownRequest-reply', j, sliced_data);
          if(j+1 == Math.ceil((Buffer.from(data).length/chunkSize))) event.sender.send('end');
      }
  });
});


//Send Unknown Sample to Storage
ipcMain.on('malwareRequest', function(event, msg) {
  console.log('malware REQ In');
  fs.readFile('./output/unknown', function(err, data) {
    var encoded_data = base64Encode(data);
    event.sender.send('malwareRequest-meta', 'meta', 'Malware.zip', Buffer.from(data).length, Math.round((Buffer.from(data).length/chunkSize)));
    for(var i=0, j=0; i<encoded_data.length; i+=chunkSize, j++) {
        sliced_data = sliceEncodedData(encoded_data, i);
        event.sender.send('malwareRequest-reply', j, sliced_data);
        if(j+1 == Math.ceil((Buffer.from(data).length/chunkSize))) event.sender.send('end');
    }
  })
});

ipcMain.on('requestMalware-tracker', function(event, message) {
  //tracker URL
  //send GET message
  //get storage IP 
  //ipc communication sig serv and peerid
});

ipcMain.on('receiveMalware', function(event, message) {
  if (message.type == 'meta') {
    malwareMeta = message;
  }
  else {
    receivedData = receivedData.concat(message.binary.data);
    if(receivedData.length == malwareMeta.size) {
      resultData = new Buffer.from(receivedData);
      fs.writeFileSync('./SampleMalware.zip', resultData);
      receivedData = new Array();
      console.log('Receive Malware Well');	
    }
  }
})


ipcMain.on('getFSHeader', function(event, message) {
  headerJson();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// analyzer

ipcMain.on('requestUnknownFile-tracker', (event, message) => {
  // console.log(unknownSamplename);
  const trackerURL = 'http://' + trackerIP + ':29200/reqUnknownFileToStorage?peerId=' + publicKey;
  console.log(trackerURL);
  http.get(trackerURL, (response) => {
    response.on('data', (storageInfo) => {
      console.log('storageInfo', JSON.parse(storageInfo));
      event.sender.send('requestUnknownFile-storage', 'ws://' + JSON.parse(storageInfo).SignalingServerURL, publicKey);
    })
  });
});





ipcMain.on('receiveUnknownSample', function(event, message) {
  if (message.type == 'meta') {
    malwareMeta = message;
  }
  else {
    receivedData = receivedData.concat(message.binary.data);
    if(receivedData.length == malwareMeta.size) {
      resultData = new Buffer.from(receivedData);
      fs.writeFileSync('./sample.zip', resultData);
      receivedData = new Array();
      console.log('Receive Unknown sample Well');	
    }
  }
})

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


//
//  * Auto Updater
//  *
//  * Uncomment the following code below and install `electron-updater` to
//  * support auto updating. Code Signing with a valid certificate is required.
//  * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
//

//
// import { autoUpdater } from 'electron-updater'

// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall()
// })

// app.on('ready', () => {
//   if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
// })