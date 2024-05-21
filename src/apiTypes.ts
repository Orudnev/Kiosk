export interface ISetTitle{
    method:'SetTitle';
    title:string;
}

export interface ICreateDevice{
    method:'CreateDevice';
    deviceType:TDeviceType;
    driverName:TDriverNames;
    args:any;
}

export type TBvCommand = 'StartReceiveMoney'|'StopReceiveMoney'|'Release'|'Test';

export type TDeviceCommand = TBvCommand;

export interface IExecute{
    method:'Execute';
    deviceType:TDeviceType;
    command:TDeviceCommand;    
}


export interface ISubscribeOnOff{
    method:'SubscribeOnOff';
    deviceType:TDeviceType;
    eventName:string;
    onoff:boolean;
}


export interface IGetProfileResponse{
    serviceList:string[];
}

export interface IGetProfile{
    method:'GetProfile';
}
export interface IGetFileResource{
    method:'GetFileResource';
    filePath:string;
}

export interface IGetSerialPortList{
    method:'GetSerialPortList';
}




export enum EDeviceType {
    BillValidator = 'BillValidator',
    BillPrinter =  'BillPrinter'
};

export type TBaudRate = 2400|4800|9600|14400|19200|38400|57600|115200;

//Префикс 'ISp' I - Interface,  S - Settings, p - Property   

export interface ISpSerialPortName{
    name:'SerialPortName';
    value: string;
}

export interface ISpSerialPortBaudRate{
    name:'SerialPortBaudRate';
    value: TBaudRate;
}

export const BillValidatorTypesList = ['Undefined','UBA','ICTL83'] as const;
export type TBillValidator = typeof BillValidatorTypesList[number];

export const BillPrinterTypesList = ['VKP80'] as const;
export type TBillPrinter = typeof BillPrinterTypesList[number];

export const DeviceTypesList = ['BillValidator','BillPrinter'] as const;
export type TDeviceType = typeof DeviceTypesList[number];

export type TSerialPortOptions = ISpSerialPortName|ISpSerialPortBaudRate;

export interface ISpBillValidator{
    type:TBillValidator
    serialPortOptions: TSerialPortOptions[];
}

export interface IAppSettings {
    BillValidator:ISpBillValidator;
}

export type TApiOneWayCall = ISetTitle;
export type TApiTwoWayCall = IGetProfile|IGetFileResource|IGetSerialPortList|ICreateDevice|ISubscribeOnOff|IExecute;


export type TBillValidatorEvent = 'SerialPortDataReceived'|'Escrowed'|'Stacked';
export interface IBillValidator{
    driverName:TBillValidator;
    LastEscrowedNominal:number;
    LastStackedNominal:number;
    SerialPortBuffer:number[];
    On:(evt:TBillValidatorEvent, handler:(params:any)=>any)=>void;
    Off:(evt:TBillValidatorEvent)=>void;
    Execute:(command:TBvCommand) => Promise<any>;
}

export type TDriverNames = TBillValidator|TBillPrinter;
export interface IDeviceDriverFabricItem {
    deviceType:TDeviceType;
    driverName: TDriverNames;
    getInstance: (args:any) => any;
}

export interface IMessage{
    sender:TDeviceType;
    messageID:TBillValidatorEvent;
    payload:any;
}

