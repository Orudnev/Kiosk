import { Reducer} from 'redux';
import { INavGalleryItemDTO, INavGalleryShowItemsCriteria } from '../components/NavGallery/NavGallery';
import { IOperationResult } from '../../common-types';


export interface INavGalleryData{
    items:INavGalleryItemDTO[];
    lastSelectedItem:INavGalleryItemDTO|undefined;
    lastCriteria:INavGalleryShowItemsCriteria;
}

export interface IFee{
    banknotesFaceVal:number[];
    paymentSum:number;
    fee_fix: number;
    fee_percent: number;
    comission: number;
}

export interface INavGallerySelectedItemDTO {
    id?: string;
    description?: string;
}

export type TReportType = "cheque"|"ticket";

export interface ISPReducerState{
    NavGalleryData:INavGalleryData;
    validateRequisiteName:''|'phone'|'email';
    validateRequisiteValue:any;
    PaymentGuid:string;
    EncashmentGuid:string;
    Fee:IFee;
    PaymentResult:IOperationResult;
    selectedServiceGroupe:INavGallerySelectedItemDTO,
    ValidatedIdentifier:string,
    ReportType:TReportType,
    ReportObject:any,
    ServiceUser:any
}

export interface IDefineServiceTreeItems{
    type:'Act_SP_DefineServiceTreeItems';
    items:INavGalleryItemDTO[];
}

export interface IUpdateNavGalleryShowItemsCriteria{
    type:'Act_SP_UpdateNavGalleryShowItemsCriteria';
    newCriteria:INavGalleryShowItemsCriteria;
}


export type TSPActions =  IDefineServiceTreeItems | IUpdateNavGalleryShowItemsCriteria;

export const EmptyFee = {
    banknotesFaceVal:[],
    paymentSum:0,
    fee_fix:0,
    fee_percent:0,
    comission:0
};

export const spDefaultState:ISPReducerState = {
    EncashmentGuid:"",
    Fee:EmptyFee,
    NavGalleryData:{items:[],lastCriteria:{type:'RootItemsOnly',value:''},lastSelectedItem:undefined},
    PaymentGuid:"",
    PaymentResult:{},
    ReportType:"cheque",
    ReportObject:{},
    selectedServiceGroupe:{
        id: "",
        description: ""
    },
    validateRequisiteName:"",
    validateRequisiteValue:"",    
    ValidatedIdentifier: "",
    ServiceUser: undefined
}


const reducer:Reducer<ISPReducerState, TSPActions> = (state = spDefaultState, action) =>{
    let newState = {...state};
    switch(action.type){
        case 'Act_SP_DefineServiceTreeItems':
            newState.NavGalleryData.items = action.items;
            return newState;
        case 'Act_SP_UpdateNavGalleryShowItemsCriteria':
            newState.NavGalleryData.lastCriteria = action.newCriteria;
            return newState;
    }
    return state;
}

export default reducer;