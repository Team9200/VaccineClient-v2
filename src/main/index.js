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
import WebSocket from 'ws';

import { deleteFolderRecursive, base64Encode, sliceEncodedData } from './modules/util'
import { start } from './modules/unknownfs/main';
import { createStorage } from './modules/unknownfs/createStorage';
import { headerJson } from './modules/unknownfs/headerParse';
import { signalingServer } from '../renderer/util/signalingServer';

import http from 'http';
import { sign } from 'electron-builder-lib/out/windowsCodeSign';

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
    height: 530,
    useContentSize: true,
    width: 700,
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
          console.log(vaccinePath);
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
    scriptPath: path.join(vaccinePath, '/engine'),
    args: [scanPath]
  };
  PythonShell.run('linvlib.py', options, function (err, results) {
    if (err) console.log(err);
    const scanResultStr = results.toString().replace(/'/gi, '"').replace(/u\"/gi, '"');
    const scanResultJSON = JSON.parse(scanResultStr);

    //scan log
    const logPath = path.join(vaccinePath, '/log.json');
    console.log(logPath);
    const dt = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

    const newLog = {
      type: 'scan',
      timestamp: dt,
      data: scanPath
    };

    fs.readFile(logPath, (err, data) => {
      if(err) console.log(err);
      console.log(data);
      let existingLogJson = JSON.parse(data);
      existingLogJson.push(newLog);
      fs.writeFileSync(logPath, JSON.stringify(existingLogJson));
    });
    console.log('Scan Result:', scanResultJSON);
    
    //make unknown.zip
    let stream;
    scanResultJSON.UnknownPaths.forEach((v, i) => {
      console.log(__dirname);
      console.log('src :', v);
      console.log('dst : ', path.join(__dirname, '../../tmpUnknown', v.split('\\').pop()));
      stream = fs.createReadStream(v).pipe(fs.createWriteStream(path.join(__dirname, '../../tmpUnknown', v.split('\\').pop())));
      console.log(fs.copyFileSync);
    });

    stream.on('finish', () => {
      zipFolder(tmpUnknownDir, path.join(__dirname, '../../tmpMalware.zip'), (err) => { 
      if(err) console.log(err); deleteFolderRecursive(tmpUnknownDir);
    });
  });
    

    event.sender.send('scanResult', scanResultStr, (err) => {console.log(err)});
  });
});

ipcMain.on('malwareMoveQurantine', (event, message) => {
  console.log('func malwareMove', typeof(message), message);
  const quarantinePath = path.join(vaccinePath, '/engine/tmp/');
  message.forEach((v, i) => {
    fs.renameSync(v, path.join(quarantinePath, path.basename(v)));
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
  //file send log
  // const logPath = path.join(vaccinePath, '/log.json');
  // const dt = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  // const newLog = {
  //   type: 'sendsample',
  //   timestamp: dt,
  //   data: unknownPaths
  // };

  // fs.readFile(logPath, (err, data) => {
  //   if(err) console.log(err);
  //   console.log(data);
  //   let existingLogJson = JSON.parse(data);
  //   existingLogJson.push(newLog);
  //   fs.writeFileSync(logPath, JSON.stringify(existingLogJson));
  // });

  //file to renderer
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
let checkValue = 0;

const storageSize = 1;
const mining = true;

ipcMain.once('runSignalingServer', function(event, message) {
  signalingServer();
});

ipcMain.once('storageInit', function(event, message) {
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

  // expressApp.get('/malwareStoS', (request, response) => {
  //   console.log('get malware S to S');
  //   const storagePid = request.query.peerId;

  //   fs.writeFileSync('./storage/give', '');
  //   event.sender.send('storagePid', storagePid);
  // })

  //findFile with fileHash
  expressApp.get('/findFile', (request, response) => {
    var fileHash = request.query.fileHash;
    var finderPeerId = request.query.finderPeerId;
    var check = 0;
    var filePath = path.join(__dirname, '../../header.json');
    console.log('Request findFile fileHash:' + fileHash);
    var fileList = fs.readFileSync(filePath, 'utf-8');
    var data = JSON.parse(fileList);
    data.some(function(res){
        console.log(res.sha256);
        if (res.sha256 == fileHash) {
            check = check + 1;
            console.log('success');

            fs.writeFileSync('./storage/give@' + fileHash, '');
            event.sender.send('storagePid', finderPeerId);
          
            response.send('success');
            return (res.sha256 == fileHash);
        }
    });
    if (check == 0) {
        console.log('fail');
        response.send('fail');
    }
  });

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
    checkValue = checkValue + 1;
    if(tempData.length == malwareMeta.pieces && checkValue >= malwareMeta.pieces) {
      for(var i = 0; i < tempData.length; i++) {
        console.log("tempData[i].pieceNum", JSON.parse(tempData[i]).pieceNum);
        receivedData = receivedData.concat(JSON.parse(tempData[i]).binary.data);
      }
      resultData = new Buffer.from(receivedData);
      fs.writeFileSync('./malware.zip', resultData);
      tempData = [];
      receivedData = [];
      checkValue = 0;
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
      event.sender.send('unknownRequest-meta', 'meta', 'unknown.zip', Buffer.from(data).length, Math.ceil((Buffer.from(data).length/chunkSize)));
      for(var i=0, j=0; i<encoded_data.length; i+=chunkSize, j++) {
          sliced_data = sliceEncodedData(encoded_data, i);
          event.sender.send('unknownRequest-reply', j+1, sliced_data);
          if(j+1 == Math.ceil((Buffer.from(data).length/chunkSize))) event.sender.send('end');
      }
  });
});


//Send Unknown Sample to Storage
ipcMain.on('malwareRequest', function(event, msg) {
  console.log('malware REQ In');
  fs.readFile('./output/unknown', function(err, data) {
    var encoded_data = base64Encode(data);
    event.sender.send('malwareRequest-meta', 'meta', 'Malware.zip', Buffer.from(data).length, Math.ceil((Buffer.from(data).length/chunkSize)));
    for(var i=0, j=0; i<encoded_data.length; i+=chunkSize, j++) {
        sliced_data = sliceEncodedData(encoded_data, i);
        event.sender.send('malwareRequest-reply', j, sliced_data);
        if(j+1 == Math.ceil((Buffer.from(data).length/chunkSize))) event.sender.send('end');
    }
  })
});

ipcMain.on('requestMalware-tracker', function(event, message) {
  console.log('req mal tracker');
  //tracker URL
  //send GET message
  //get storage IP 
  //ipc communication sig serv and peerid
  const trackerURL = 'http://' + trackerIP + ':29200/findFile?fileHash=' + message + '&finderPeerId=' + publicKey;
  console.log(trackerURL);
  http.get(trackerURL, (response) => {
    response.on('data', (res) => {
      console.log('isSuccess', JSON.parse(res));
      if (JSON.parse(res).success == true) {
        event.sender.send('requestMalware-storage', 'ws://' + JSON.parse(res).SignalingServerURL, publicKey);
      }
    })
  });
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

// let fileList;
ipcMain.on('getFSFileListREQ', function(event, message) {
  console.log("get FS FIle List REQ in");
  // fileList = await headerJson();
  // console.log('fileList', fileList.toString());
  // event.sender.send('getFSFileListRPY', JSON.stringify(fileList));
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
  console.log(message);
  if (message.type == 'meta') {
    malwareMeta = message;
  }
  else {
    tempData[message.pieceNum-1] = JSON.stringify(message);
    checkValue = checkValue + 1;
    if(tempData.length == malwareMeta.pieces && checkValue >= malwareMeta.pieces) {
      for(var i = 0; i < tempData.length; i++) {
        console.log("tempData[i].pieceNum", JSON.parse(tempData[i]).pieceNum);
        receivedData = receivedData.concat(JSON.parse(tempData[i]).binary.data);
      }
      resultData = new Buffer.from(receivedData);
      fs.writeFileSync('./sample.zip', resultData);
      tempData = [];
      receivedData = [];
      checkValue = 0;
      console.log('Receive Unknown File Well');
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
})

ipcMain.on('getMyKeySend', (event, message) => {
  console.log(publicKey, secretKey);
  event.sender.send('getMyKeyOn', publicKey, secretKey);
});


//////////////////////////////////////////////////////////////////////////////////////////
// Wallet
let myUTXO;
ipcMain.on('getMyBalance', (event, message) => {
  console.log('get my bal clicked');
  const trakerURL = 'http://' + trackerIP + ':29200/findMiningStorage';
  http.get(trakerURL, (response) => {
    response.on('data', (data) => {
      let miningNodeIP = JSON.parse(data.toString()).message.address
      console.log('Mining Node IP', miningNodeIP);
      const ws = new WebSocket('ws://' + miningNodeIP + ':59200');
      ws.onopen = (event) => {
        ws.send(JSON.stringify({
          type:'balance',
          pid: publicKey
        }));
      };
      ws.onmessage = (event) => {
        myUTXO = event.data;
        console.log(myUTXO);
      }
    });
  });
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