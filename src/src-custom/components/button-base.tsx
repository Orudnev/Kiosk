import React, { ReactElement,ReactNode,useState } from 'react';

export type TRenderContent<T> = (pars:T)=>ReactElement;

export interface IButtonBaseProps{
    btnId:string;
    btnStyleType:string;
    //classStr:string;
    //classPressed?:string;
    onClick:()=>void;
    //renderContentArgs:unknown[];
    //renderContent?:(...args:unknown[])=>ReactElement;
    getChildren?:(pressed:boolean)=>ReactNode;
    children?:ReactNode;
    //key?:string;
    //style?:any;
}




export const ButtonBase = (props:IButtonBaseProps) => {
    const [btnPressed,setBtnPressed] = useState(false);
    const cstr = props.btnStyleType + (btnPressed?" "+props.btnStyleType+"__pressed":"");
    return (
        <div className={cstr} 
            onMouseDown = {(e)=>{
                e.preventDefault();
                setBtnPressed(true);
            }} 
            onTouchStart = {(e)=>{
                e.preventDefault();
                setBtnPressed(true);
            }} 
            onMouseUp = {(e)=>{
                e.preventDefault();
                if(btnPressed){
                    setBtnPressed(false);
                    props.onClick();
                }
            }} 
            onTouchEnd = {(e)=>{    
                //обработчик для события от тачскрина
                e.preventDefault();
                if(btnPressed){
                    setBtnPressed(false);
                    props.onClick();
                }
            }} 
            >
            {props.getChildren?props.getChildren(btnPressed):props.children?props.children:<div /> }
            {/* {props.renderContent && props.renderContent(...props.renderContentArgs)} */}
        </div>        
    );
}