import { readSync, writeSync } from 'fs';
import buffreverse from 'buffer-reverse/inplace';
import sha256File from 'sha256-file';
import { buff2Hexa, byteSet } from './file';


function parseHeader(storage , storageSize, start, offset){				// Get file handle, storageSize, start address / return headerinfo object

	return new Promise(function(resolve, reject){
	
		var buffer = new Buffer(NHB);
		var header = new Object();
		readSync(storage, buffer, 0, buffer.length, start+(NHB*offset));

		header.cuuid = buffer.slice(0,36).toString();
		header.start = buff2Hexa(buffreverse(buffer.slice(48,64)));
		header.size = buff2Hexa(buffreverse(buffer.slice(64,80)));
		header.date = buffer.slice(80,93).toString();
		header.sha256 = buffer.slice(96,128).toString('hex');

		resolve(header);


	});

}

function createHeaderBuffer(collector, filename, filesize, startOffset, date){			// Get 분석여부, File Name, Start offset / return header buffer

	return new Promise(function(resolve, reject){
	
		var cuuid = Buffer.concat([Buffer.from(collector)],48);
		var start= Buffer.concat([buffreverse(Buffer.from(byteSet(startOffset.toString(16)),'hex'))],16);						// 16 Byte
						
		var fileSize = Buffer.concat([buffreverse(Buffer.from(byteSet(filesize.toString(16)),'hex'))],16);						// 16 Byte
		var time = 	Buffer.concat([Buffer.from(date.toString())],16);				// 8 Byte	
		var hash = Buffer.concat([Buffer.from(sha256File(filename).toString(16),"hex")],32);     // 32 Byte sha256

		var buffer = Buffer.concat([cuuid,start,fileSize,time, hash],128);	// buffer concat
		resolve(buffer);	

	});

}

function writeHeader(fd, buffer ,offset, start){

	return new Promise(function(resolve, reject){
			
			try{
			
					writeSync(fd, buffer, 0, buffer.length, start + 256*offset);

			}
			catch(err){

					reject("writeHeader	writeSync err : ",err);

			}

			resolve(1);

	});

}

export const parse = parseHeader;
export const create = createHeaderBuffer;
export const set = writeHeader;