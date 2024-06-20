import React, { ReactNode } from 'react';
import { PageHeader } from '../../src-custom/components/page-header';
import { AppGlobal } from '../../app';
import { GetIconClass, TLang } from '../../common-types';
import { TScenarioUid, TScenarioItemUid } from '../../src-custom/scn-custom';
import { ButtonBase } from '../../src-custom/components/button-base';
import { TLButton, GetLocRes } from '../../localization';
import AllStepItems from '../../src-custom/scn-custom';

export interface IStepBaseProps<T> {
    scnUid: TScenarioUid;
    scnItemUid: TScenarioItemUid;
    stepTimeout?: number;
    messageId?: string; //2do заменить string на enum
    buttons?: string;
    btnFunc?: (jsxComponentContext: any) => string;
    messageFunc?: (JSXContext: any) => string;
    messageText?: string;
    extraProps?: T;
    handleInit?:(jsxComponentContext: any) => void;
    handleDidMount?:(jsxComponentContext: any) => void;
    handleAnyButtonClick?:(jsxComponentContext: any,btnId:TLButton) => void;
    handleKeyDown?:(jsxComponentContext: any,event:any) => void;
}



type TRenderDisabledButtonMode = 'hide' | 'disable';

export class StepBase<TExtraProps, TState> extends React.Component<IStepBaseProps<TExtraProps>, TState> {
    timerId: NodeJS.Timeout | undefined = undefined;
    disableTimeout = false;
    renderDisabledButtonsMode: TRenderDisabledButtonMode = 'disable';
    constructor(props: IStepBaseProps<TExtraProps>) {
        super(props);
        this._onAnyBtnClick = this._onAnyBtnClick.bind(this);
        this.onAnyBtnClick = this.onAnyBtnClick.bind(this);
        this.handleTimerTick = this.handleTimerTick.bind(this);
        this.props.handleInit?.(this);
    }

    componentDidMount() {
        if (!this.disableTimeout) {
            this.startTimeout();
        }
        this.props.handleDidMount?.(this);
    }

    onAnyBtnClick(btnId:TLButton) {
        if(this.props.handleAnyButtonClick){
            this.props.handleAnyButtonClick?.(this,btnId);
        } else {
            //Default behaviour
            switch(btnId){
                case 'btnBack':
                    this.scn_goBack();
                    break;
                case 'btnHome':
                    this.scn_goHome();
                    break;
                default:
            }
        }
    }

    handleTimerTick() {
        //Log.Info(`StepBase: Таймаут. Элемент сценария:${this.scenarioItem?.scenarioId}.${this.scenarioItem?.id}`);
    }

    handleChangeLang(lang: TLang) {
    }

    resetTimeout() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = undefined;
        }
        this.startTimeout();
    }

    startTimeout() {
        if (!this.disableTimeout) {
            //var sec = AppGlobal.getState().AppSettings.regularStepTimeout;
            //this.timerId = setTimeout(this.handleTimerTick, sec * 1000);
        }
    }

    _onAnyBtnClick(btnId:TLButton) {
        if (this.timerId) {
            this.resetTimeout();
        }
        this.onAnyBtnClick(btnId);
    }

    renderHeader(): JSX.Element {
        return (
            <PageHeader
                AppSettings={AppGlobal.State().AppSettings}
                handleChangeLang={(selItem: any) => {
                    this.handleChangeLang(selItem)
                }
                } />
        );
    }

    renderButtonsInDisableMode() {

        let result: JSX.Element[] = [];
        let btns = "";
        if (this.props.buttons) {
            btns = this.props.buttons;
        }
        if (this.props.btnFunc) {
            btns = this.props.btnFunc(this);
        }
        if (!btns) return result;
        let disabled = false;
        const addButton = (btnId: TLButton) => {
            let navBtn = <div />;
            let styleInfo = GetIconClass(btnId);
            if (btns.includes(btnId)) {
                navBtn =
                    <ButtonBase
                        key={btnId}
                        onClick={() => this._onAnyBtnClick(btnId)}
                        btnId={btnId} btnStyleType='nav-button'
                        getChildren={(pressed) => {
                            let imgClass = styleInfo?.imageClass;
                            if (pressed && styleInfo?.imageSelectedClass) {
                                imgClass = styleInfo?.imageSelectedClass;
                            }
                            return (
                                <>
                                    {styleInfo?.iconAfterLabel
                                        ? (<div />)
                                        : (<img className={imgClass} />)
                                    }
                                    <div className='nav-button_label'>
                                        {GetLocRes(btnId)}
                                    </div>
                                    {styleInfo?.iconAfterLabel
                                        ? (<img className={imgClass} />)
                                        : (<div />)
                                    }
                                </>
                            );
                        }} />
            } else {
                navBtn =
                    <ButtonBase
                        key={btnId}
                        onClick={()=>{""} }
                        btnId={btnId} btnStyleType='nav-button__disabled'
                        getChildren={(pressed) => {
                            let imgClass = styleInfo?.imageClass;
                            return (
                                <>
                                    {styleInfo?.iconAfterLabel
                                        ? (<div />)
                                        : (<img className={imgClass} />)
                                    }
                                    <div className='nav-button_label'>
                                        {GetLocRes(btnId)}
                                    </div>
                                    {styleInfo?.iconAfterLabel
                                        ? (<img className={imgClass} />)
                                        : (<div />)
                                    }
                                </>
                            );
                        }} />
            }

            result.push(navBtn);
        };
        addButton("btnBack");
        addButton("btnHome");
        addButton("btnNext");
        return result;
    }

    renderButtons(): JSX.Element | JSX.Element[] {
        return this.renderButtonsInDisableMode();
    }

    renderBody() {
        return (
            <div className='pg-content' />
        );
    }

    renderMessage(): any {
        if (this.props.messageId) {
            throw "not implemented";
            //return getMsg(this.props.messageId); //2do
        }
        if (this.props.messageFunc)
            return this.props.messageFunc(this);
        if (this.props.messageText)
            return this.props.messageText;
        return "";
    } 

    render() {
        return (
            <div id="page" className="page-grid-layout" >
                <div id="pgHeader" className="pg-header">
                    {this.renderHeader()}
                    <div className="pg-header__title">{this.renderMessage()}</div>
                </div>
                {this.renderBody()}
                <div id="pgFooter" className="pg-footer">
                    <div id="statusBar" className="pg-footer__statusbar">
                        {this.renderButtons()}
                    </div>
                </div>
            </div>
        );
    }

    scn_getCurrScnItems():StepBase<any,any>[]{
        let scnItems = AllStepItems.filter(itm=>{
            const step = (itm as unknown) as StepBase<any,any>;
            return (step.props.scnUid === this.props.scnUid);
        }).map(itm=>{
            const step = (itm as unknown) as StepBase<any,any>;
            return step;                
        });
        return scnItems;
    }

    scn_goBack(){
        let currScnItems = this.scn_getCurrScnItems();
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

    scn_goHome(){
        AppGlobal.navigate('main_main');
    }
}