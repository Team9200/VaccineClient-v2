const secp256k1 = require('secp256k1');
const bs58check = require('bs58check');
const sha256 = require('sha256');

/*******************************************************************************
  function : MakePayment
  explanaion : 지불할 돈(amount) 만큼 나의 UTXO를 조회해서 거래를 만드는 함수

  input : receiver,sender,amout
  output : 생성된 transaction의 Json 형태의 출력
********************************************************************************/

const MakePayment = (amount, utxolist ,receiver_publickey, sender_privatekey, sender_publickey, t_version, type, hash) =>{
    var t_sumValue = getTotalAmount(utxolist);
    // console.log("t_sumValue =>", t_sumValue);
    
    if(amount > t_sumValue)
      return false;
      
    
    // 변수 초기화
    var vinSum = 0;
    var newVin = [];
    var newVout = [];
    var newVinIndex = 0;
    var newVoutIndex = 0;
    // 나의 UTXO List의 길이만큼 반복
    for(var key in utxolist){
    
      // 누적 값을 더해서 새로운 input 생성
      vinSum = utxolist[key]["value"] + vinSum;
      newVin[newVinIndex] = new Object;
      newVin[newVinIndex]["txid"] = key;
      newVin[newVinIndex]["index"] = newVinIndex;
      newVin[newVinIndex]["sig"] = bs58check.encode(signTransaction(newVin[newVinIndex],  sender_privatekey));
      newVinIndex++;
      
      // 누적 값이 보낼 양과 같으면 잔돈 없음, 하나의 vout만 생성
      if(vinSum == amount){
        newVoutIndex = 1;
        newVout[0] = new Object;
        newVout[0]["value"] = amount;
        newVout[0]["index"] = 0;
        newVout[0]["publickey"] = bs58check.encode(receiver_publickey);
        break;
      }
  
      // 누적값이 보낼 양보다 크면 잔돈 있음, 2개의 vout 생성
      if(vinSum > amount){
        newVoutIndex = 2;
        newVout[0] = new Object;
        newVout[0]["value"] = amount;
        newVout[0]["index"] = 0;
        newVout[0]["publickey"] = bs58check.encode(receiver_publickey);
  
        newVout[1] = new Object;
        newVout[1]["value"] = vinSum - amount;
        newVout[1]["index"] = 1;
        newVout[1]["publickey"] = bs58check.encode(sender_publickey);
        break;
      }
  
    }// end for
  
      // 새로운 트랜잭션 생성
      var newtransaction = {
        version : t_version,
        timestamp : Date.now(),
        inputCnt : newVinIndex,
        vin : newVin,
        outputCnt: newVoutIndex,
        vout : newVout
      }
      
  
      // tx_id 생성
      newtransaction["txid"] = '04' + sha256(JSON.stringify(newtransaction));
  
    console.log ("newtransaction => ",newtransaction)
  
    // 새 트랜잭션에 추가
    // Blockchain.addNewTransaction(newtransaction);
    //program2.blockchain.addNewTransaction(newtransaction);
  
    if (type==1) {
      newtransaction['type'] = 1;
      newtransaction['hash'] = hash;
    }
    else{
        newtransaction['type'] = 0;
        newtransaction['hash'] = 0;
    }
  
    return newtransaction;
      
  }
  

const getTotalAmount = (utxolist) => {
  var sumValue = 0;
  for (var key in utxolist){
    sumValue = utxolist[key]["value"] + sumValue;
  }
  return sumValue;
};

const signTransaction = function(transaction, privatekey) {
    let msg = Buffer.from(transaction['txid'].slice(0,32));
    let sign = secp256k1.sign(msg, privatekey);
    return sign.signature;
  }

export {
    getTotalAmount,
    MakePayment,
    signTransaction
}
