import { PipeParser } from "./pipeParser";
import { EventEmitter } from "events";
import { CheckCRC16, arrayToHexDecimal, arrayToString } from "./helpers";
import * as dto from "./dto";
import { IBillValidator, IBvStatusItem, IMessage, TBillValidator, TBillValidatorEvent, TBvCommand, TBvStatus, TDriverNames } from "../../../../src/apiTypes";
import { Hardware } from "../../../api";
const Serial = require('serialport') as any;



const WatchingIntervalMs = 200;

export class UbaDriver extends EventEmitter implements IBillValidator {
    driverName: TBillValidator = 'UBA';
    serialPort: any;
    pipeParser: any;
    status: IBvStatusItem;
    watchingTimer: any;
    LastEscrowedNominal: number;
    LastStackedNominal: number;
    SerialPortBuffer: number[] = [];
    isDebug: boolean;
    constructor(options: any, debug = false) {
        super();
        options.autoOpen = false;
        this.serialPort = new Serial.SerialPort(options);
        this.onSerialPortOpen = this.onSerialPortOpen.bind(this);
        this.pipeParser = this.serialPort.pipe(new PipeParser() as any);
        this.status = {type:'Undefined',value:-1};
        this.watchingTimer = null;
        this.LastEscrowedNominal = 0;
        this.LastStackedNominal = 0;
        this.isDebug = debug;
    }

    Open(callback:any){
        return this.serialPort.open(callback);
    }

    async onSerialPortOpen() {
        this.sendCommand(dto.cmdReset);
        this.sendCommand(dto.cmdDisable);
    }


    GetStatus(){
        return this.status.type;
    };

    async ExecuteBatch(commands: dto.ICommand[]) {
        const results: any[] = [];
        for (const command of commands) {
            try {
                const result = await this.sendCommand(command);
                results.push([...(result as any)]);
            } catch (error) {
                throw error;
            }
        }
        return results;
    }

    Execute(command: TBvCommand) {
        switch (command) {
            case 'Release':
                return this.Release();
            case 'Test':
                return new Promise((resolve) => {
                    // this.cmdEnable().then(result=>{
                    //     let s =1;
                    // });
                    this.ExecuteBatch([dto.cmdEnable, dto.cmdPoll, dto.cmdDisable, dto.cmdPoll])
                        .then(result => {
                            if(result.length === 4){                                
                                let rv = (dto.GetStatusType(result[1][2]) === 'Enabled') && (dto.GetStatusType(result[3][2]) === 'Disabled');
                                resolve(rv);
                                return; 
                            }
                            resolve(true);
                        })
                        .catch(err => {
                            resolve(false);
                        })
                })
            case 'StartReceiveMoney':
                return this.sendCommand(dto.cmdEnable);
            case 'StopReceiveMoney':
                return this.sendCommand(dto.cmdDisable);
            default:
                throw new Error(`command ${command} not implemented`);
        }
    }

    Release(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                this.serialPort.close(() => {
                    this.removeAllListeners();
                    resolve("ok");
                })
            } catch (error) {
                reject(error);
            }
        });
    }

    On(evt: TBillValidatorEvent, handler: (params: any) => any) {
        this.on(evt, handler);
    }
    Off(evt: TBillValidatorEvent) {
        this, this.removeAllListeners(evt);
    }

    fireEvent(evtName: TBillValidatorEvent,payloadData:any) {
        //this.emit(evtName, this);
        let message:IMessage = {sender:'BillValidator',messageID:evtName,payload:payloadData};
        Hardware.SendMessage(message);
    }


    onDeviceStatusChanged(data: any) {
        let isStatusChanged = data.some((itm:any,idx:number) => {
            if(isStatusChanged){
                return true;
            }
            if(idx > this.SerialPortBuffer.length -1){
                isStatusChanged = true;
                return true; 
            }
            return itm !== this.SerialPortBuffer[idx]
        });
        if(!isStatusChanged){
            return; 
        }
        let receivedStatus = data[2];
        let newStatus = dto.allStatuses.find(itm=>itm.value === receivedStatus);
        if (!newStatus){
            newStatus = {type:'Undefined',value:-1};
        }
        this.status = newStatus;
        this.fireEvent('StatusChanged',this.status.type);
        switch(newStatus?.type){
            case 'Escrow':
                this.LastEscrowedNominal = dto.GetBanknoteNominal(data);
                this.debug(`Escrowed. banknote accepted:${this.LastEscrowedNominal}`);
                this.fireEvent('Escrowed',this.LastEscrowedNominal);
                setTimeout(() => {
                    this.sendCommand(dto.cmdStack);    
                }, WatchingIntervalMs);                
                break;
            case 'VendValid':
                setTimeout(() => {
                    this.sendCommand(dto.cmdAck);    
                }, WatchingIntervalMs);                
                break;
            case 'Stacked':
                this.LastStackedNominal = this.LastEscrowedNominal;
                this.LastEscrowedNominal = 0;
                this.debug(`Stacked. banknote stacked:${this.LastEscrowedNominal}`);
                this.fireEvent('Stacked',this.LastStackedNominal);
                break;
            default:
                this.debug(newStatus?.type);
        }        

        this.SerialPortBuffer = [...data];
    }

    async cmdReset() {
        return this.sendCommand(dto.cmdReset);
    }


    async cmdEnable() {
        return this.sendCommand(dto.cmdEnable);
    }

    async cmdDisable() {
        return this.sendCommand(dto.cmdDisable);
    }

    async cmdPoll() {
        return this.sendCommand(dto.cmdPoll);
    }

    async cmdAck() {
        await this.sendCommand(dto.cmdAck);
    }

    async cmdStack() {
        await this.sendCommand(dto.cmdStack);
    }

    sendCommand(command: dto.ICommand) {
        clearTimeout(this.watchingTimer);
        return new Promise((resolve, reject) => {
            this.serialPort.write(command.content, (err: any) => {
                this.watchingTimer = setTimeout(async () => {
                    let res = await this.cmdPoll();
                    this.debug(`${(new Date()).toJSON().substring(11)} Request:${command.type} Response:${arrayToString([...(res as any)])}`);
                    resolve(res);
                }, WatchingIntervalMs);
                if (err) {
                    this.debug(`Error on write to serial port:${err}`);
                    resolve([]);
                } else {
                    if (command.hasResponse) {
                        this.waitSerialPortData()
                            .then((data: any) => {
                                this.debug(`${(new Date()).toJSON().substring(11)} Request:${command.type} Response:${arrayToString(data)}`);
                                this.onDeviceStatusChanged(data);
                                resolve(data);
                            })
                            .catch(err => {
                                resolve([]);
                            })
                    } else {
                        //this.debug(`${(new Date()).toJSON().substring(11)} Request:${command.type}`);
                    }
                }
            });
        });
    }

    waitSerialPortData(timeoutMs = 1000) {
        return new Promise((resolve, reject) => {
            let timer: any = null;
            const dataReceivedHandler = async (data: any) => {
                if (!CheckCRC16(data)) {
                    reject(`Error: wrong CRC. Received data:${arrayToString(data)}`);
                }
                clearTimeout(timer);
                this.pipeParser.removeListener('data', dataReceivedHandler);
                resolve(data);
            };
            const timeoutHandler = () => {
                this.pipeParser.removeListener('data', dataReceivedHandler);
                resolve([]);
            };
            this.pipeParser.once('data', dataReceivedHandler);
            timer = setTimeout(timeoutHandler, timeoutMs);
        });
    }

    debug(...params: any) {
        if (this.isDebug) {
            console.log(params);
        }
    }

}

