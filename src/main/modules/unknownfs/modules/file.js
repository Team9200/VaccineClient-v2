import { statSync } from 'fs';
import path from 'path';


global.storageName = path.join(__dirname, '../../../../../test.storage');//"C:/Users/true/Documents/projects/test/test.storage";

global.RHB = 256;			// Root Header Bytes
global.BPB = 1/8;			// Body per bitmap Bytes		 
global.NHB = 256; 			// Normal Header Bytes
global.BDB = 1024*1024;		// Body Bytes;
global.HPB = 1/32;			// header per bitmap Bytes

export function byteSet(hexStr){

	if(hexStr.length % 2 != 0){

		return "0"+hexStr;

	}
	return hexStr;

}

export function buff2Hexa(buffer){

	return parseInt("0x"+buffer.toString('hex'),16);

}

export function getFileSize(filename) {			// get File Name / return File Size

	return new Promise(function(resolve){

	    const stats = statSync(filename);
	    const fileSizeInBytes = stats.size;
	    resolve(fileSizeInBytes);

    })

}

export function blockNum(size){

	var root = RHB ;
	var bitmap = BPB; 
	var header = NHB;
	var body = BDB;
	var bn= 8*(size-root)/((bitmap*8)+(HPB*8)+(header*4*8)+(body*8));
	
	return Math.floor(bn);

}

export function bitMapSize(size){

	return Math.ceil(blockNum(size)/8);

}

export function bodyBitMapSize(size){

	return Math.ceil(blockNum(size)/8);

}
export function headerBitMapSize(size){

	return Math.ceil(blockNum(size)/32);

}


export function headerSize(size){

	return headerNum(size)*128;

}

export function headerNum(size){

	return Math.ceil(blockNum(size)/4);

}

// export const buff2Hexa = buff2Hexa;
// export const blockNum = blockNum;
// export const bodyBitMapSize = bodyBitMapSize;
// export const headerBitMapSize = headerBitMapSize;
// export const headerSize = headerSize;
// export const headerNum = headerNum;
// export const getFileSize = getFileSize;
// export const byteSet = byteSet;

