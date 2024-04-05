import {BrowserWindow } from 'electron';
import {ICommonReslult} from '../src/apiwrapper';

function MakeOneWayCall(payload:object):void{
    (window as any).electronAPI.oneWayCall(payload);
}
async function MakeTwoWayCall(payload:object){
    return (window as any).electronAPI.twoWayCall(payload);
}

export interface IProfileItem{
    prop1:string;
}

export interface IOtherItem{
    prop2:boolean;
}


class ApiWrapperClass{
    SetTitle(newTitle:string){
        MakeOneWayCall({method:'SetTitle',title:newTitle});
    }

    GetProfile():Promise<ICommonReslult<IProfileItem[]>>{
        let result = MakeTwoWayCall({method:'GetProfile'});
        return result;
    }

    Test():Promise<ICommonReslult<IOtherItem[]>>{
        let result = MakeTwoWayCall({method:'GetProfile'});
        return result;
    }
}

export const ApiWrapper = new ApiWrapperClass();

// async function test(){
//     let response = await ApiWrapper.GetProfile();
//     response.result[0].
//     let r1 = await ApiWrapper.Test();
//     r1.result[0].
// }


export interface ISetTitle{
    method:'SetTitle';
    title:string;
}

export interface IGetProfileResponse{
    serviceList:string[];
}

export interface IGetProfile{
    method:'GetProfile';
}


export type TApiOneWayCall = ISetTitle;
export type TApiTwoWayCall = IGetProfile;




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
    }
    
} 

function GetProfileImpl(){
    try{
        const pf = require('./stub/profile.json');
        let result:ICommonReslult<IProfileItem[]> = {isOk:true,result:pf as IProfileItem[]};
        return result;
    
    } catch(err:any){
        let result:ICommonReslult<IProfileItem[]> = {isOk:false,error:err.message};
        return result;
    }
}