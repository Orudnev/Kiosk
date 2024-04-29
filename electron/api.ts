import {BrowserWindow } from 'electron';
import {ICommonReslult} from '../src/apiwrapper';
import * as path from 'path';
import fs = require('fs');
//import SerialPort = require('serialport');
import {TApiOneWayCall,TApiTwoWayCall} from '../src/apiTypes';
//@ts-ignore
import {UbaDriver} from './drivers/billvalidator/uba/billvalidator';
//import { SerialPort } from 'serialport';

export interface IProfileItem{
    prop1:string;
}


export function HandleOneWayCall(event: any, payload: TApiOneWayCall){
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (!win){
        return;
    }
    switch (payload.method){
        case 'SetTitle':
            win.setTitle(payload.title);        
    }
}

export async function HandleTwoWayCall(event: any, payload: TApiTwoWayCall){
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (!win){
        return;
    }
    switch (payload.method){
        case 'GetProfile':
            return GetProfileImpl();
        case 'GetFileResource':
            return GetFileResourceImpl(payload.filePath);
        case 'GetHardware':
            return GetHardware()
    }    
} 

function GetProfileImpl(){
    try{
        const pf = require('./stub/profile.json');
        let result:ICommonReslult<IProfileItem[]> = {isOk:true,result:pf as IProfileItem[]};
        return result;
    
    } catch(err:any){
        let result = {isOk:false,error:err.message};
        return result;
    }
}

function GetFileResourceImpl(filePath:string){
    const fileFolder = 'D:/IumiCash4333/Projects/CashinApp/Data/Files';
    const fullPath = path.join(fileFolder, filePath);
    const b64 = fs.readFileSync(fullPath).toString('base64');
    return b64;
}
function GetHardware(){
    const billValidator = new UbaDriver({
        path:"COM11",
        baudRate: 9600, 
        databits: 8,
        stopbit: 1,  
        parity: 'even'},true);
    let s = 1;
    (global as any).bv = billValidator;
    billValidator.on('onEscrowed',(bv:UbaDriver)=>{
        let s = bv;
    });     
    let s1 = 1;
    return "";
}




