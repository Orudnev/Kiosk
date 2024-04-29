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
export interface IGetFileResource{
    method:'GetFileResource';
    filePath:string;
}

export interface IHardware{
    method:'GetHardware';
}


export type TApiOneWayCall = ISetTitle;
export type TApiTwoWayCall = IGetProfile|IGetFileResource|IHardware;