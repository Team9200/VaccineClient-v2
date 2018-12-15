import { openSync, writeSync } from 'fs';
import { getFileSize, headerBitMapSize, bodyBitMapSize } from './modules/file';
import { parse } from './modules/normalHeader';
import { usedSpace } from './modules/bit-vector';
import path from 'path';
import { OperationalError } from 'bluebird-lst';

global.storageName = path.join(__dirname, '../../../../test.storage'); //"test.storage";

global.RHB = 256;			// Root Header Bytes
global.BPB = 1/8;			// Body per bitmap Bytes		 
global.NHB = 256; 			// Normal Header Bytes
global.BDB = 1024*1024;		// Body Bytes;
global.HPB = 1/32;			// header per bitmap Bytes


export async function headerJson(){
	var storage = await openSync(storageName,"r+");
	var storageSize= await getFileSize(storageName);
	var headerStart = RHB + headerBitMapSize(storageSize) + bodyBitMapSize(storageSize);

	var usedHeader = await usedSpace(storage,storageSize);

	console.log('USED HEADER', usedHeader);

	var result = new Array();

	usedHeader.forEach(async function(freeSpace,index){
		var header = await parse(storage , storageSize, headerStart, freeSpace);
		result[index] = header
	});

	var f= await openSync('header.json',"w+");
	console.log('RESULT', result);
	writeSync(f, JSON.stringify(result));

	result;
}


// headerJson();