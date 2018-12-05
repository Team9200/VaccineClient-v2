import { openSync, closeSync } from 'fs';
import { v1 } from 'uuid';
import buffreverse from 'buffer-reverse/inplace';
import sha256File from 'sha256-file';
import md5File from 'md5-file';

import { emptySpace, set, usedSpace } from './modules/bit-vector';
import { create, set as _set, parse } from './modules/normalHeader';
import { update } from './modules/rootHeader';
import { fileCopy, extract as _extract } from './modules/body';
import { getFileSize, headerBitMapSize, bodyBitMapSize, headerSize } from './modules/file';

global.storageName = "C:/Users/NGA/Desktop/FileSystem/test.storage";

global.RHB = 256;			// Root Header Bytes
global.BPB = 1/8;			// Body per bitmap Bytes		 
global.NHB = 256; 			// Normal Header Bytes
global.BDB = 1024*1024;		// Body Bytes;
global.HPB = 1/32;			// header per bitmap Bytes


async function recive(){

	var storage = await openSync(storageName,"r+");
	var storageSize= await getFileSize(storageName);

	var collector = v1();
	var unknownFileName = "../ctf.zip";
	var unknownFile = openSync(unknownFileName,"r+");
	var unknownFileSize = await getFileSize(unknownFileName);
	var date = 1543123401002;
	var needSpace = Math.ceil(unknownFileSize/((1024*1024)-32));

	//////////////////////////////////////////////////////////////////////////////////////////////
	// bitMap Check..

	var headerSpace = await emptySpace(storage, storageSize, 1, "header");			// 	fd, storageSize, needSpace ,section 
	var bodySpace = await emptySpace(storage, storageSize, needSpace, "body");		// fd, storageSize, needSpace ,section 

	if(headerSpace.length == 0){

		throw new Error('Header bitMap not enough space '); //err

	}
	if(bodySpace.length == 0){

		throw new Error('Header bitMap not enough space '); //err

	}

	var bodyStart = RHB + headerBitMapSize(storageSize) + bodyBitMapSize(storageSize) + headerSize(storageSize) + (BDB*bodySpace[0]);
	var headerStart = RHB + headerBitMapSize(storageSize) + bodyBitMapSize(storageSize);
	//////////////////////////////////////////////////////////////////////////////////////////////
	// bitMap Set..

	await set(storage, storageSize, headerSpace[0], "header");					// fd, storageSize, freeSpace, section

	bodySpace.forEach(async function(freeSpace){									//fd, storageSize, freeSpace, section

		await set(storage, storageSize, freeSpace, "body");

	});

	//////////////////////////////////////////////////////////////////////////////////////////////
	// header set..

	var headerBuffer = await create(collector, unknownFileName, unknownFileSize, bodyStart, date);
	await _set(storage, headerBuffer, headerSpace[0], headerStart);		//storage, buffer ,offset, start

	//////////////////////////////////////////////////////////////////////////////////////////////
	// body set..

	await fileCopy(unknownFile, storage, bodySpace, unknownFileSize, storageSize);		// srcfd, dstfd, offset, srcSize, dstSize

	//////////////////////////////////////////////////////////////////////////////////////////////
	// root header update..

	await update(storage, unknownFileSize)



	//////////////////////////////////////////////////////////////////////////////////////////////
	await closeSync(storage);

	console.log("done");

	//////////////////////////////////////////////////////////////////////////////////////////////



}
async function extract(){

	var storage = await openSync(storageName,"r+");
	var storageSize= await getFileSize(storageName);

	var unknownFile = await openSync("unknown","w+");

	var usedHeader = await usedSpace(storage, storageSize);
	var headerStart = RHB + headerBitMapSize(storageSize) + bodyBitMapSize(storageSize);
	console.log(usedHeader[Math.floor(Math.random()*usedHeader.length)]);
	var header = await parse(storage, storageSize, headerStart, usedHeader[Math.floor(Math.random()*usedHeader.length)]);

	console.log(header);
	_extract(storage,unknownFile ,header.size, header.start);

}

//recive();
extract();

