import { Reducer } from 'redux';
import { TLang } from '../../common-types';


export type TCommonParType = 'int' | 'bool' | 'string';

export interface ICommonParameterItem {
    name: string;
    value: string;
    caption: string;
    type: TCommonParType
}


export interface IAppSettings {
    url:string;
    currentLanguage:TLang;
    commonParameters:ICommonParameterItem[];
    regularStepTimeout: number;
    paymentStepTimeout: number;
    messageStepTimeout: number;
    maxBanknoteFaceValue: number;
    serviceMenuCode: string;
    nominals: string;
}
const initAppSettings: IAppSettings = {
    url:"/",
    currentLanguage:'en',
    commonParameters:[],
    regularStepTimeout: 30,
    paymentStepTimeout: 60,
    messageStepTimeout: 15,
    maxBanknoteFaceValue: 1000,
    serviceMenuCode: '789',
    nominals: "2,5,10,20,50,100",
};

export interface IAppNavigateAction{
    type:'ActNavigate';
    url:string;
}

export interface ISetCommonParameterAction{
    type:'SetCommonParameterAction';
    payload:string;
}


export type TAppAction = IAppNavigateAction|ISetCommonParameterAction;

const appReducer:Reducer<IAppSettings,TAppAction> = (state = initAppSettings, action:TAppAction) => {
    let typedAction = action as TAppAction;
    let newState = { ...state };
    switch (typedAction.type) {
        case 'ActNavigate': 
             newState.url = typedAction.url;
             console.log(newState.url);
             return newState;
    }
    return state;
};

export default appReducer;