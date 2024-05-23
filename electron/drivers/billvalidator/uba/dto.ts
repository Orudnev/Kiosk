import { IBvStatusItem, TBvStatus } from "../../../../src/apiTypes";
import { arrayToString } from "./helpers";

export interface ICommand {
    type: 'Reset' | 'Disable' | 'Enable' | 'Poll' | 'Stack' | 'Reject' | 'Ack';
    hasResponse: boolean;
    content: number[];
}


export const cmdReset: ICommand = {
    type: 'Reset',
    hasResponse: false,
    content: [252, 5, 64, 43, 21]
}

export const cmdDisable: ICommand = {
    type: 'Disable',
    hasResponse: false,
    content: [252, 6, 195, 255, 124, 217]
}

export const cmdEnable: ICommand = {
    type: 'Enable',
    hasResponse: false,
    content: [252, 6, 195, 0, 4, 214]
}

export const cmdPoll: ICommand = {
    type: 'Poll',
    hasResponse: true,
    content: [252, 5, 17, 39, 86]
}

export const cmdStack: ICommand = {
    type: 'Stack',
    hasResponse: true,
    content: [252, 5, 65, 162, 4]
}


export const cmdAck: ICommand = {
    type: 'Ack',
    hasResponse: true,
    content: [252, 5, 80, 170, 5]
}


export const allStatuses: IBvStatusItem[] = [
    { type: 'Enabled', value: 17 },
    { type: 'Disabled', value: 26 },
    { type: 'Accepting', value: 18 },
    { type: 'Escrow', value: 19 },
    { type: 'Stacking', value: 20 },
    { type: 'VendValid', value: 21 },
    { type: 'Stacked', value: 22 },
    { type: 'Rejecting', value: 23 },
    { type: 'StackerFull', value: 67 },    
    { type: 'StackerPlugged', value: 27 },
    { type: 'StackerUnplugged', value: 68 },   
    { type: 'Cheated', value: 72 },   
    { type: 'Jammed', value: 69},   
    { type: 'Jammed', value: 70},   
    { type: 'Undefined', value: -1 }
];

export function GetStatusValue(tstatus:TBvStatus){
    let result = -1;
    let resultItm = allStatuses.find(itm => itm.type === tstatus);
    if(resultItm){
        result = resultItm.value;
    }
    return result;    
}

export function GetStatusType(value:number){
    let result:TBvStatus = 'Undefined';
    let resultItm = allStatuses.find(itm => itm.value === value);
    if(resultItm){
        result = resultItm.type;
    }
    return result;    
} 

export function GetBanknoteNominal(data: any) {
    const banknoteCodes = [0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68];
    const banknoteNominals = [200, 500, 1000, 2000, 5000, 10000, 20000]
    let index = banknoteCodes.findIndex(itm => itm === data[3]);
    if (index === -1) {
        throw new Error(`Error: Wrong banknote code. Received data:${arrayToString(data)}`);
    }
    return banknoteNominals[index];
}

