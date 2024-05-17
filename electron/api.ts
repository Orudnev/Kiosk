import { BrowserWindow } from 'electron';
import { ICommonReslult } from '../src/apiwrapper';
import * as path from 'path';
import fs = require('fs');
//import SerialPort = require('serialport');
import { IBillValidator, IDeviceDriverFabricItem, TApiOneWayCall, TApiTwoWayCall, TBillValidator, TBillValidatorEvent, TDeviceType, TDriverNames } from '../src/apiTypes';
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
            return CreateDevice(payload.deviceType,payload.driverName,payload.args);
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

function CreateDevice(deviceType:TDeviceType,driverName:TDriverNames,args:any) {
    Hardware.CreateDevice(deviceType,driverName,args);
    return "";
}

function getMainWindow(){
    let allWin = BrowserWindow.getAllWindows();
    return allWin[0];
}

class DummyBillValidator implements IBillValidator {
    driverName: TBillValidator = 'Undefined';
    LastEscrowedNominal = 0;
    LastStackedNominal = 0;
    Release = () => new Promise<string>((resolve) => resolve(''));
    On(evt: TBillValidatorEvent, handler: (params: any) => any) { };
    SerialPortBuffer: number[]=[];
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
                if (this.BillValidator.driverName !== 'Undefined') {
                    this.BillValidator.Release();
                }
                this.BillValidator = bvfItm.getInstance(args);
                this.BillValidator.On('SerialPortDataReceived',(bvInstance)=>{
                    getMainWindow().webContents.send('SerialPortDataReceived',[...bvInstance.SerialPortBuffer]);    
                });
                break;
            case 'BillPrinter':
                throw new Error('Not implemented');
        }
    }
}

export const Hardware = new HardwareClass();



