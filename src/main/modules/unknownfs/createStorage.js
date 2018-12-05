import { appendFileSync, openSync, writeSync, closeSync } from 'fs';
import { v1 } from 'uuid';
import { getFileSize } from './modules/file';
import { create } from './modules/rootHeader';

function writeNullFile(fd,size){	// GB 단위

	return new Promise(function(resolve, reject){

		var buf = new Buffer(1024*1024*1024)	// 1GB
 
		for(var index = 0; index < size; index++){

			(function(index, count){

				this.setTimeout(function(){

					try {

						appendFileSync(fd, buf);
				    	console.log((index+1) .toFixed(2)+ " GB Created");
				  
				    	if(index == size -1){

				  			resolve("File Create Success.");

				    	}

					} catch (err) {
					    /* Handle the error */
					    reject(err);

					}

				}, 5);

			})(index,size);

		}

	});
}


async function createStorage(size){

	if(size == 0 ||typeof size == 'undefined') {
	
		console.log("Must be greater than zero");
		return ;

	}
	
	try{

		var fd = openSync("test.storage", "w+");
		console.log("createStorage..");

	}
	catch(err){

		console.log("createStorage Fail : Open Fail");
	
	}
	
	var result = await writeNullFile(fd ,size);
	console.log(result);

	var size= await getFileSize("./test.storage");
	var cuuid= v1();
	var rootHeader = await create(cuuid,size);
	
	await writeSync(fd, rootHeader, 0, rootHeader.length, 0);
	console.log("done.");

	await closeSync(fd);

}


createStorage(process.argv[2]);