
function MakeOneWayCall(payload:object):void{
    (window as any).electronAPI.oneWayCall(payload);
}
async function MakeTwoWayCall(payload:object){
    return (window as any).electronAPI.twoWayCall(payload);
}

export interface IProfileItem{
    id: number,
    name: string,
    description: string,
    key: string,
    scenario: string,
    "parentId": number,
    "isActive": true,
    regexMask: string,
    serviceId: number,
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

    GetProfile():Promise<ICommonReslult<IProfileItem[]>>{
        let result = MakeTwoWayCall({method:'GetProfile'});
        return result;
    }

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
  