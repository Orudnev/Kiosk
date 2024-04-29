import { arrayToString } from "./helpers";

export interface ICommand {
    type:'Reset'|'Disable'|'Enable'|'Poll'|'Stack'|'Reject'|'Ack';
    hasResponse:boolean;
    content:number[];
}

export interface IStatus {
    //VendValid - запрос подтверждения приема купюры (нужно ответить сообщением "Ack")    
    type:'undefined'|'Enabled'|'Disabled'|'Accepting'|'Escrow'|'Stacking'|'VendValid'|'Rejecting'|'Stacked';
    value:number;
}

export const cmdReset:ICommand = {
    type:'Reset',
    hasResponse:false,
    content:[252,5,64,43,21]
} 

export const cmdDisable:ICommand = {
    type:'Disable',
    hasResponse:false,
    content:[252,6,195,255,124,217]
} 

export const cmdEnable:ICommand = {
    type:'Enable',
    hasResponse:false,
    content:[252,6,195,0,4,214]
} 

export const cmdPoll:ICommand = {
    type:'Poll',
    hasResponse:true,
    content:[252,5,17,39,86]
} 

export const cmdStack:ICommand = {
    type:'Stack',
    hasResponse:true,
    content:[252,5,65,162,4]
} 

export const stUndefined:IStatus = {
    type:'undefined',
    value: -1    
}

export const cmdAck:ICommand = {
    type:'Ack',
    hasResponse:true,
    content:[252,5,80,170,5]
} 

export const stEnabled:IStatus = {
    type:'Enabled',
    value: 17
}

export const stDisabled:IStatus = {
    type:'Disabled',
    value: 26
}

export const stAccepting:IStatus = {
    type:'Accepting',
    value: 18
}

export const stEscrow:IStatus = {
    type:'Escrow',
    value: 19
}

export const stStacking:IStatus = {
    type:'Stacking',
    value: 20
}

export const stVendValid:IStatus = {
    type:'VendValid',
    value: 21
}

export const stStacked:IStatus = {
    type:'Stacked',
    value: 22
}


export const stRejecting:IStatus = {
    type:'Rejecting',
    value: 23
}

export function GetBanknoteNominal(data:any){
    const banknoteCodes =       [0x62,0x63,0x64,0x65,0x66,0x67 ,0x68 ];
    const banknoteNominals =    [200 ,500 ,1000,2000,5000,10000,20000]
    let index = banknoteCodes.findIndex(itm=>itm === data[3]);
    if(index === -1){
        throw new Error(`Error: Wrong banknote code. Received data:${arrayToString(data)}`);
    }
    return banknoteNominals[index];
}

