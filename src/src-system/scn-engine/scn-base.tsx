import React, { ReactNode } from 'react';
import { TScenarioItemUid, TScenarioUid } from '../../src-custom/scn-custom';

export type TStepEventName = 'Init'|'DidMount'|'NavigateButtonClick';

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

    launchInlineHandler(hndlrName:TStepEventName,args:any){
        if(!this.props.inlineHandlers){
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