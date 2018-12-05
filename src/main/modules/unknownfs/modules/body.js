import { readSync, writeSync } from 'fs';
import { headerBitMapSize, bodyBitMapSize, headerSize, byteSet, buff2Hexa } from './file';
import buffreverse from 'buffer-reverse/inplace';

export function fileCopy(srcfd, dstfd, offset, srcSize, dstSize){

	return new Promise(function(resolve, reject){

		var count = Math.ceil(srcSize/ (BDB-32));								// loof count == used block 
		var start = RHB + headerBitMapSize(dstSize) + bodyBitMapSize(dstSize) + headerSize(dstSize);

		for(var index = 0; index < count ;index++){

			(function(index, count){

				setTimeout(function(){

					try{

						if(index == count-1) resolve("done");

						var sbuf = new Buffer(BDB-32);
						var head = 0;
						var tail = 0;

						if(index != 0){

							var head = start + (BDB*offset[index-1]);

						}
						if(index != count-1) {

							var tail = start + (BDB*offset[index+1]);

						}

						var tmp = Buffer.concat([Buffer.concat([buffreverse(Buffer.from(byteSet(head.toString(16)),'hex'))],16),Buffer.concat([buffreverse(Buffer.from(byteSet(tail.toString(16)),'hex'))],16)],32);
					    readSync(srcfd, sbuf, 0, sbuf.length, sbuf.length * index);
					   
					    var result = Buffer.concat([tmp,sbuf],BDB);
					    writeSync(dstfd ,result ,0, result.length, start + (BDB*offset[index]));



					}
					catch(err){

						reject("fileCopy function error : ",index,err);
					}

				}, 60);

			})(index,count);

		}
	});

}
export function fileExtract(storage, unknownFile , unknownFileSize, unknownFileStart){


	return new Promise(function(resolve, reject){

		var count = Math.ceil(unknownFileSize/(BDB-32));
		var last = unknownFileSize - ((BDB-32)*(count-1));
		var next = unknownFileStart;

		for(var index = 0; index < count ;index++){

			(function(index, count){

				setTimeout(function(){

					if(index == count -1){

						var buffer = new Buffer(last);
						readSync(storage, buffer, 0, buffer.length, next+32);
						writeSync(unknownFile, buffer, 0, buffer.length, index*(BDB-32));
						resolve(1);

						
					}
					else{

						var buffer = new Buffer(BDB-32);
						var buff = new Buffer(32);
						readSync(storage, buffer, 0, buffer.length, next+32);
						readSync(storage, buff, 0, buff.length, next);
						writeSync(unknownFile, buffer, 0, buffer.length, index*(BDB-32));
	
						next = buff2Hexa(buffreverse(buff.slice(16,32)));


					}					

				}, 60);

			})(index,count);

		}


	});


}

// export const fileCopy = fileCopy;
export const extract = fileExtract;
