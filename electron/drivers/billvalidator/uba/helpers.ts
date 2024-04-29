export function arrayToHexDecimal(array:number[]){
    let outStr = "";
    array.forEach(itm => {
      let newNumber = itm.toString(16);
      outStr += (outStr?" ":"") + newNumber;
    });
    return outStr;
  }


  export function arrayToString(array:number[]){
    let outStr = "";
    array.forEach(itm => {
      let newNumber = itm.toString();
      outStr += (outStr?" ":"") + newNumber;
    });
    return outStr;
  }

  const CRC_POLY = 0x08408;  

 function getCRC16(buffer:any) {
    var CRC, i, j;
    var sizeData = buffer.length;

    CRC = 0;

    for (i = 0; i < sizeData; i++) {
      CRC ^= buffer[i];

      for (j = 0; j < 8; j++) {

        if (CRC & 0x0001) {
          CRC >>= 1;
          CRC ^= CRC_POLY;
        } else CRC >>= 1;
      }
    }

    var buf = new Buffer(2);
    buf.writeUInt16BE(CRC, 0);

    CRC = buf;

    return Array.prototype.reverse.call(CRC);
  }

  export function CheckCRC16(dataWithCRC:any):boolean{
    let len = dataWithCRC.length;
    let receivedCRC = dataWithCRC.slice(len - 2, len);
    let dataWithoutCRC = dataWithCRC.slice(0, len-2);
    let calculatedCRC = getCRC16(dataWithoutCRC);
    let result = receivedCRC[0] === calculatedCRC[0] && receivedCRC[1] === calculatedCRC[1];
    return result;
  }