import React, { ReactNode } from 'react';
import { PageHeader } from '../../src-custom/components/page-header';
import { AppGlobal } from '../../app';
import { GetIconClass, TLang } from '../../common-types';
import { TScenarioUid, TScenarioItemUid } from '../../src-custom/scn-custom';
import { ButtonBase } from '../../src-custom/components/button-base';
import { TLButton,GetLocRes } from '../../localization';

export interface IStepBaseProps {
    scnUid: TScenarioUid;
    scnItemUid: TScenarioItemUid;
    stepTimeout?: number;
    messageId?: string; //2do заменить string на enum
    buttons?: string;
    btnFunc?: (jsxComponentContext: any) => string;
    defaultButtons?: string;
    messageFunc?: (JSXContext: any) => string;
    messageText?: string;
    dataSource?: any;
}

type TRenderDisabledButtonMode = 'hide' | 'disable';

export class StepBase extends React.Component<IStepBaseProps, any> {
    disableTimeout = false;
    renderDisabledButtonsMode: TRenderDisabledButtonMode = 'disable';
    constructor(props: IStepBaseProps) {
        super(props);
        this.state = {
            value: "",
            navigationStarted: false,
            showWaitIndicator: false
        };
        this.handleAnyClick = this.handleAnyClick.bind(this);
        this.handleTimerTick = this.handleTimerTick.bind(this);
    }

    componentDidMount() {
        if (!this.disableTimeout) {
            this.startTimeout();
        }
    }


    handleAnyClick() {

    }

    handleTimerTick() {
        //Log.Info(`StepBase: Таймаут. Элемент сценария:${this.scenarioItem?.scenarioId}.${this.scenarioItem?.id}`);
    }

    handleChangeLang(lang: TLang) {
    }


    startTimeout() {
        if (!this.disableTimeout) {
            //var sec = AppGlobal.getState().AppSettings.regularStepTimeout;
            //this.timerId = setTimeout(this.handleTimerTick, sec * 1000);
        }
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

        const addButton = (btnId: TLButton) => {
            if (!btns.includes(btnId)) {
                //это не кнопка навигации (не btnBack,btnHome,btnNextg)
                return;
            }
            let styleInfo = GetIconClass(btnId);
            let navBtn =
                <ButtonBase 
                    key={btnId}
                    onClick={()=>{return ""}}
                    btnId={btnId} btnStyleType='nav-button'
                    getChildren={(pressed)=>{
                        let imgClass = styleInfo?.imageClass;
                        if(pressed && styleInfo?.imageSelectedClass){
                            imgClass = styleInfo?.imageSelectedClass;
                        }
                        return(
                            <>
                             {styleInfo?.iconAfterLabel
                                 ?(<div />)
                                 :(<img className={imgClass } />)
                             }
                             <div className='nav-button_label'>
                                  {GetLocRes(btnId)}
                             </div>
                             {   styleInfo?.iconAfterLabel
                                 ?(<img className={imgClass} />)
                                 :(<div/>)
                             }
                            </>
                        );
                    }} />
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
            <div id="pgBody" className="pg-content">
            </div>
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
            <div id="page" className="page-grid-layout">
                <div id="pgHeader" className="pg-header">
                    {this.renderHeader()}
                    <div className="pg-header__title">{!this.state.showWaitIndicator && this.renderMessage()}</div>
                </div>
                <div id="pgBody" className="pg-content">
                    {!this.state.showWaitIndicator && this.renderBody()}
                    {this.state.showWaitIndicator && <div style={{ textAlign: "center", padding: "200px 0" }}>
                        {/* {AnmWaitIcon} */}
                    </div>}
                </div>
                <div id="pgFooter" className="pg-footer">
                    <div id="statusBar" className="pg-footer__statusbar">
                        {!this.state.showWaitIndicator && this.renderButtons()}
                    </div>
                </div>
            </div>
        );
    }


}