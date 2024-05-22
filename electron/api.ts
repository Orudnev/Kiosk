import { BrowserWindow } from 'electron';
import { ICommonReslult } from '../src/apiwrapper';
import * as path from 'path';
import fs = require('fs');
//import SerialPort = require('serialport');
import { IBillValidator, ICreateDevice, IDeviceDriverFabricItem, IMessage, ISubscribeOnOff, TApiOneWayCall, TApiTwoWayCall, TBillValidator, TBillValidatorEvent, TBvCommand, TDeviceCommand, TDeviceType, TDriverNames } from '../src/apiTypes';
//@ts-ignore
import { UbaDriver } from './drivers/billvalidator/uba/billvalidator';
import { AllBillValidators } from './drivers/billvalidator';
//import { SerialPort } from 'serialport';

export interface IProfileItem {
    prop1: string;
}


export function HandleOneWayCall(event: any, payload: TApiOneWayCall) {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (!win) {
        return;
    }
    switch (payload.method) {
        case 'SetTitle':
            win.setTitle(payload.title);

    }
}

export async function HandleTwoWayCall(event: any, payload: TApiTwoWayCall) {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (!win) {
        return;
    }
    switch (payload.method) {
        case 'GetProfile':
            return GetProfileImpl();
        case 'GetFileResource':
            return GetFileResourceImpl(payload.filePath);
        case 'GetSerialPortList':
            return GetSerialPortList();
        case 'CreateDevice':
            return Hardware.CreateDevice(payload.deviceType, payload.driverName, payload.args);
        case 'Execute':
            return await Hardware.Execute(payload.deviceType,payload.command)        
        case 'SubscribeOnOff':
            let pls = (payload as ISubscribeOnOff);
            Hardware.SubscribeOnOff(payload.deviceType, pls.eventName, pls.onoff);
            break;
    }
}

function GetSerialPortList() {
    const Serial = require('serialport') as any;
    return Serial.SerialPort.list();
}

function GetProfileImpl() {
    try {
        const pf = require('./stub/profile.json');
        let result: ICommonReslult<IProfileItem[]> = { isOk: true, result: pf as IProfileItem[] };
        return result;

    } catch (err: any) {
        let result = { isOk: false, error: err.message };
        return result;
    }
}

function GetFileResourceImpl(filePath: string) {
    const fileFolder = 'D:/IumiCash4333/Projects/CashinApp/Data/Files';
    const fullPath = path.join(fileFolder, filePath);
    const b64 = fs.readFileSync(fullPath).toString('base64');
    return b64;
}

// function CreateDevice(deviceType:TDeviceType,driverName:TDriverNames,args:any) {
//     Hardware.CreateDevice(deviceType,driverName,args);
//     return "";
// }

function getMainWindow() {
    let allWin = BrowserWindow.getAllWindows();
    return allWin[0];
}

class DummyBillValidator implements IBillValidator {
    driverName: TBillValidator = 'Undefined';
    LastEscrowedNominal = 0;
    LastStackedNominal = 0;
    On(evt: TBillValidatorEvent, handler: (params: any) => any) { };
    Off(evt: TBillValidatorEvent) { };
    SerialPortBuffer: number[] = [];
    Execute(command: TBvCommand){return new Promise((resolve)=>{resolve(true)})};
}

class HardwareClass {
    AllDevices: IDeviceDriverFabricItem[] = [...AllBillValidators];
    BillValidator: IBillValidator = new DummyBillValidator();
    BillPrinter: any = undefined;
    CreateDevice(deviceType: TDeviceType, driverName: TDriverNames, args: any) {
        let bvfItm = this.AllDevices.find(itm => itm.deviceType == deviceType && itm.driverName == driverName);
        if (!bvfItm) {
            throw new Error(`Unknown type "${deviceType}.${driverName}"`);
        }
        switch (deviceType) {
            case 'BillValidator':
                return new Promise((resolve,reject)=>{
                    try{
                        if (this.BillValidator.driverName !== 'Undefined') {
                            this.BillValidator.Execute('Release').then(result=>{
                                this.BillValidator = bvfItm?.getInstance(args);
                                resolve(true);
                                return;
                            });
                            return;
                        } 
                        this.BillValidator = bvfItm?.getInstance(args);
                        resolve(true);
                    } catch(error){
                        reject(error);
                    }    
                });
                //
                break;
            case 'BillPrinter':
                throw new Error('Not implemented');
        }
    }
    Execute(deviceType: TDeviceType, command:TDeviceCommand){
        switch (deviceType) {
            case 'BillValidator':
                let bvCmd = command as TBvCommand;
                return this.BillValidator.Execute(bvCmd);
            case 'BillPrinter':
                throw new Error('Not implemented');
        }
    }
    SubscribeOnOff(deviceType: TDeviceType, eventName: string, onoff: boolean) {
        switch (deviceType) {
            case 'BillValidator':
                let evName = eventName as TBillValidatorEvent;
                let getPayload: any = undefined;
                if (onoff) {
                    switch (evName) {
                        case 'SerialPortDataReceived':
                            getPayload = (bvInstance: any) => {
                                let message: IMessage = { sender: 'BillValidator', messageID: 'SerialPortDataReceived', payload: [...bvInstance.SerialPortBuffer] };
                                return message;
                            };
                            break;
                        case 'Escrowed':
                        case 'Stacked':
                    }
                    this.BillValidator.On(evName, (bvInstance) => {
                        let pl = bvInstance;
                        if (getPayload) {
                            pl = getPayload(bvInstance);
                        }
                        let message: IMessage = { sender: 'BillValidator', messageID: 'SerialPortDataReceived', payload: pl };
                        getMainWindow().webContents.send('messageChannel', message);
                    });
                } else {
                    this.BillValidator.Off(evName);
                }
                break;
            case 'BillPrinter':
                throw new Error('Not implemented');
        }
    }
}

export const Hardware = new HardwareClass();



