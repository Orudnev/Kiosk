const Serial = require('serialport') as any;
class UbaDriverClass{
    serialPort:any;
    constructor(){
        this.serialPort = new Serial.SerialPort({
            path:"COM11",
            baudRate:38400
        });

        this.serialPort.on("open",()=>{
            console.log("-- Connection opened --");
            this.serialPort.on("data",this.onDataReceived);
        })
    }

    onDataReceived(data:any){
        console.log(data);
    }
}
const DrvInstance = new UbaDriverClass();
export default DrvInstance;

// export const GetUbaDriver = ()=>{
//     let serial:SerialPort = new Serial.SerialPort({
//         path:"COM11",
//         baudRate:38400
//     });

//     return "aaaaa";
// };



