import {AppGlobal} from './app';
export type TLButton = 'btnNext' | 'btnBack' | 'btnHome' | 'btnYes' | 'btnNo';
export type TLMessage = 'blabla';

export type TLUid = TLButton | TLMessage;

export interface TLRCommon{
    uid:TLUid;
    default:string;
    ru?:string;
    en?:string;
}

const allRes:TLRCommon[] = [
    {uid:'btnBack',default:'Back',ru:'Далее'},
    {uid:'btnHome',default:'Home Page',ru:'Гл.форма'},
    {uid:'btnNext',default:'Next',ru:'Далее'},
] 


export function GetLocRes(uid:TLUid){
    let result = allRes.find(itm=>itm.uid === uid);
    if(!result){
        return "";
    }
    let currLang = AppGlobal.State().AppSettings.currentLanguage;
    if(result && (result.hasOwnProperty(currLang))){
        return (result as any)[currLang];
    }
    return result["default"];    
}
