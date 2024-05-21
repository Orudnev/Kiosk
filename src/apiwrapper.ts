import { TApiOneWayCall, TApiTwoWayCall, TBillValidatorEvent, TBvCommand, TDeviceType, TDriverNames } from "./apiTypes";

function MakeOneWayCall(payload:TApiOneWayCall):void{
    (window as any).electronAPI.oneWayCall(payload);
}



async function MakeTwoWayCall(payload:TApiTwoWayCall){
    return (window as any).electronAPI.twoWayCall(payload);
}



export interface IProfileItemDTO {
    id: string;
    name?: string;
    description?: string;
    scenario: string;
    parentId?: string;
    image?: string;
    requisitesName: string;
    requisitesMask?: string;
}

export interface IOtherItem{
    prop2:boolean;
}


export interface ICommonReslult<TResult>{
    isOk:boolean;
    result?: TResult;
    error?: string;
}

class ApiWrapperClass{
    SetTitle(newTitle:string){
        MakeOneWayCall({method:'SetTitle',title:newTitle});
    }
    HW_CreateDevice(devType:TDeviceType,driverName:TDriverNames,arg:any){
        let result = MakeTwoWayCall({method:'CreateDevice',deviceType:devType,driverName:driverName,args:arg});
        return result;
    }

    BV_SubscribeOnOff(evName:TBillValidatorEvent, onOff:boolean){
        this.HW_SubscibeOnOff('BillValidator',evName,onOff);
    }

    BV_Execute(bvCommand:TBvCommand){
        let result = MakeTwoWayCall({method:'Execute',deviceType:'BillValidator', command:bvCommand});
        return result;
    }

    HW_SubscibeOnOff(devType:TDeviceType,evName:string,onOff:boolean){
        let result = MakeTwoWayCall({method:'SubscribeOnOff',deviceType:devType,eventName:evName,onoff:onOff});
        return result;
    }

    GetProfile():Promise<ICommonReslult<IProfileItemDTO[]>>{
        let result = MakeTwoWayCall({method:'GetProfile'});
        return result;
    }

    GetFileResource(fileName:string):Promise<string>{
        let result = MakeTwoWayCall({method:'GetFileResource',filePath:fileName});
        return result;
    }
 
    GetSerialPortList():Promise<any>{
        let result  = MakeTwoWayCall({method:'GetSerialPortList'});
        return result;
    }


    HW_StartMessageTranslation(){
        (window as any).electronAPI.onMainToRendererMessage(HanleMainToRendererMessage);        
    }
}

(window as any).electronAPI.onMainToRendererMessage(HanleMainToRendererMessage); 
function HanleMainToRendererMessage(payload:any){
    console.log(payload);
}

export const ApiWrapper = new ApiWrapperClass();

// // async function test(){
// //     let response = await ApiWrapper.GetProfile();
// //     response.result[0].
// //     let r1 = await ApiWrapper.Test();
// //     r1.result[0].
// // }


// export interface ISetTitle{
//     method:'SetTitle';
//     title:string;
// }

// export interface IGetProfileResponse{
//     serviceList:string[];
// }

// export interface IGetProfile{
//     method:'GetProfile';
// }


// export type TApiOneWayCall = ISetTitle;
// export type TApiTwoWayCall = IGetProfile;




// export function HandleOneWayCall(event: any, payload: TApiOneWayCall){
//     const webContents = event.sender;
//     const win = BrowserWindow.fromWebContents(webContents);
//     if (!win){
//         return;
//     }
//     switch (payload.method){
//         case 'SetTitle':
//             win.setTitle(payload.title);        
//     }
// }

// export async function HandleTwoWayCall(event: any, payload: TApiTwoWayCall){
//     const webContents = event.sender;
//     const win = BrowserWindow.fromWebContents(webContents);
//     if (!win){
//         return;
//     }
//     switch (payload.method){
//         case 'GetProfile':
//             return GetProfileImpl();
//     }
    
// }

// function GetProfileImpl(){
//     return {prop1:"blablabla"};
// }


// function handleSetTitle(event: any, title: string) {
//     const webContents = event.sender;
//     const win = BrowserWindow.fromWebContents(webContents);
//     win?.setTitle(title);
//   }
  