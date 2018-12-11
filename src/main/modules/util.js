import fs from 'fs';
const chunkSize = 16384;

const deleteFolderRecursive = function(dirPath) {
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
  
const base64Encode = function(data) {
    return new Buffer.from(data);
   }; 
  
const sliceEncodedData = (encoded_data, offset) => {
    return encoded_data.slice(offset, offset+chunkSize);
  };

export {
    deleteFolderRecursive,
    base64Encode,
    sliceEncodedData
}