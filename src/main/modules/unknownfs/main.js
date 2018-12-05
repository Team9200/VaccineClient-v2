import { openSync, closeSync, unlinkSync } from 'fs';
import { v1 } from 'uuid';
import { watch } from 'chokidar';
import path from 'path';

import { emptySpace, set, usedSpace } from './modules/bit-vector';
import { create, set as _set, parse } from './modules/normalHeader';
import { update } from './modules/rootHeader';
import { fileCopy, extract as _extract } from './modules/body';
import { getFileSize, headerBitMapSize, bodyBitMapSize, headerSize } from './modules/file';

global.storageName = path.join(__dirname, '../../../../test.storage');//"test.storage";

global.RHB = 256;			// Root Header Bytes
global.BPB = 1/8;			// Body per bitmap Bytes		 
global.NHB = 256; 			// Normal Header Bytes
global.BDB = 1024*1024;		// Body Bytes;
global.HPB = 1/32;			// header per bitmap Bytes


function recive(unknownFileName){

	return new Promise(async function(resolve){
		console.log(storageName);
		var storage = await openSync(storageName,"r+");
		var storageSize= await getFileSize(storageName);

		var collector = v1();
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
		
		await closeSync(unknownFile)
		await closeSync(storage);
		await unlinkSync(unknownFileName);		

		console.log("recive Success.");

		//////////////////////////////////////////////////////////////////////////////////////////////
		resolve(1);

	});

}
async function extract(){
	console.log(__dirname);

	var storage = await openSync(storageName,"r+");
	var storageSize= await getFileSize(storageName);
	var unknownFile = await openSync(path.join(__dirname, "output/unknown"),"w+");

	var usedHeader = await usedSpace(storage, storageSize);												// 사용중인 헤더들

	if(usedHeader.length == 0)

		throw new Error('Dose not have a file'); //err

	var headerStart = RHB + headerBitMapSize(storageSize) + bodyBitMapSize(storageSize);			// 헤더 시작주소
	var header = await parse(storage, storageSize, headerStart, usedHeader[Math.floor(Math.random()*usedHeader.length)]);		// 추출할 헤더.

	console.log("extracting...");

	await _extract(storage,unknownFile ,header.size, header.start);			// 추출.
	console.log(1);
	await closeSync(storage);
	await closeSync(unknownFile);

	console.log("extract Success.");

}
export function start(){
	const storagePath = path.join(__dirname, 'storage');
	const watcher = watch(storagePath, {persistent: true});

	watcher
		.on('add', function(path) 
			{ 
				console.log('add',path);

				var file =path.split("\\").slice(-1)[0];
				console.log("file name: ", path.split("\\").slice(-1)[0]);
				
				if(file == "give"){

					extract();
					unlinkSync(path);
				}

				else
					recive(path);
				})

		.on('change', function() 
			{ 
				console.log('change');
			})
		.on('unlink', function() 
			{
				console.log('delete.');
			})
		.on('error', function(error) 
			{ 
			console.log('chokidar watch error occurred ' + error);
			})
		.on('ready', function() 
			{ 
				console.log('Initial scan complete. Ready for changes.');
			})

		console.log("Directory Monitoring of storage has started");


}
// start();
// export const start = start;
export function hello() {
	console.log('import!');
}