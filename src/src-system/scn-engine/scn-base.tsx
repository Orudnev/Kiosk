import React, { ReactNode } from 'react';
import { TScenarioItemUid, TScenarioUid } from '../../src-custom/scn-custom';
import AllStepItems from '../../src-custom/scn-custom';
import { StepBase } from './step-base';
import { AppGlobal } from '../../app';
export type TStepEventName = 'Init'|'DidMount'|'NavigateButtonClick'|'KeyDown';

export interface IInlineHandler{
    name:TStepEventName;
    handler:(stepInstance:any)=>any;    
}

export interface IScnItemBaseProps{
    scnUid: TScenarioUid;
    scnItemUid: TScenarioItemUid;

    inlineHandlers?:IInlineHandler[];
}

export class ScnItemBase{
    step:any = undefined;
    props:IScnItemBaseProps;
    constructor(pr:IScnItemBaseProps){
        this.props = pr;
    }

    getCurrScnItems():ScnItemBase[]{
        let scnItems:ScnItemBase[] = AllStepItems.filter(itm=>{
            const step = (itm as unknown) as StepBase<any,any>;
            return (step.props.scnItem.props.scnUid === this.props.scnUid);
        }).map( itms =>{
            const step = (itms as unknown) as StepBase<any,any>;
            return step.props.scnItem;
        })
        return scnItems;
    }

    goBack(){
        let currScnItems = this.getCurrScnItems();
        let currItemIndex = currScnItems.findIndex(itm=>itm.props.scnItemUid === this.props.scnItemUid);
        if(currItemIndex > -1){
            let prevItemIndex = currItemIndex - 1;
            if(prevItemIndex > -1){
                let prevItem = currScnItems[prevItemIndex];
                let url = `${prevItem.props.scnUid}_${prevItem.props.scnItemUid}`;
                AppGlobal.navigate(url);
            }
        }
    }

    launchInlineHandler(hndlrName:TStepEventName,args:any){
        if(!this.props.inlineHandlers){
            if(hndlrName === 'NavigateButtonClick'){
                //дефолтный обработчик нажания на кнопку навигации
                let btnId = args;
                if(btnId === 'btnBack'){
                    this.goBack();
                }
            }
            return;
        }
        let hitem = this.props.inlineHandlers.find(itm=>itm.name === hndlrName);
        if(hitem){
            if(args){
                return hitem.handler.call(this,args);
            } else {
                return hitem.handler.call(this,undefined);
            }            
        }
    }

    handleStepEvent(eventName:TStepEventName,args?:any){
        switch(eventName){
            case 'Init':
                this.init({...args});
                break;
            case 'DidMount':
                this.didMount({...args});
                break;
            case 'KeyDown':
                this.launchInlineHandler('KeyDown',args);
                break;
            case 'NavigateButtonClick':
                this.launchInlineHandler('NavigateButtonClick',args);
                break;
            default:
        }
    }

    init(stepInstance:any){
        this.step = stepInstance;
        this.launchInlineHandler('Init',stepInstance);
    }

    didMount(stepInstance:any){
        this.launchInlineHandler('DidMount',stepInstance);
    }
} 