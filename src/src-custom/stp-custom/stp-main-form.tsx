import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { IStepBaseProps, StepBase } from '../../src-system/scn-engine/step-base';
import { INavGallery, INavGalleryShowItemsCriteria, NavGallery, TNGridDataSource } from '../components/NavGallery/NavGallery';
import { INavGalleryItemDTO } from '../components/NavGallery/NavGallery';
import { AppGlobal } from '../../app';
import { store } from '../reducers';
import { INavGalleryData } from '../reducers/step-props';
import { TLButton } from '../../localization';

export interface IStpMainFormProps {
    dataSource: () => INavGalleryItemDTO[];
    showItemsCriteria: () => INavGalleryShowItemsCriteria;
    handleItemSelected:(item:INavGalleryItemDTO,hasChildren:boolean)=>void;
}

class StepMainFormClass extends StepBase<IStpMainFormProps, any> {
    ngref: any;
    constructor(props: IStepBaseProps<IStpMainFormProps>) {
        super(props);
        this.ngref = createRef();
        this.SetNavGalleryDataSource = this.SetNavGalleryDataSource.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount(): void {
       super.componentDidMount(); 
       document.addEventListener('keydown', this.handleKeyDown, true);
    }

    componentWillUnmount(): void {
        document.removeEventListener('keydown',this.handleKeyDown);
    }

    handleKeyDown(e:any){
        this.props.handleKeyDown?.(this,e); 
    }

    SetNavGalleryDataSource(dataSource: INavGalleryItemDTO[]) {
        (this.ngref.current as INavGallery).SetDataSource(dataSource, { type: 'RootItemsOnly', value: '' });
    }

    onAnyBtnClick(btnId: TLButton): void {
        if(btnId === 'btnHome'){
            store.dispatch({type:'Act_SP_UpdateNavGalleryShowItemsCriteria',newCriteria:{type:'RootItemsOnly', value:''}});
            store.dispatch({type:'Act_SP_DefineServiceTreeItems',items:[...store.getState().StepProps.NavGalleryData.items]});
        }
    }

    renderButtonsInDisableMode() {
        if (this.props.extraProps) {
            let lastCriteria = this.props.extraProps.showItemsCriteria();
            if (lastCriteria.type !== 'RootItemsOnly') {
                return super.renderButtonsInDisableMode();
            }
        }
        return [<></>];
    }


    renderBody(): JSX.Element {
        let items = this.props.extraProps?.dataSource();
        return (
            <div className='pageLayout-body-withnavgallery'>
                <NavGallery ref={this.ngref} dataSource={items}
                    getThemeId={(currCriteria) => {
                        return currCriteria.type === 'RootItemsOnly' ? "root-items" : "default";
                    }}
                    onItemSelected={(item,hasChildren)=>{
                        this.props.extraProps?.handleItemSelected(item,hasChildren);
                    }}
                    onShownItemsChanged={(newCriteria)=>{
                        store.dispatch({type:'Act_SP_UpdateNavGalleryShowItemsCriteria',newCriteria});
                    }}
                />
            </div>
        );
    }

}


function mapStateToProps(state: any, ownProps: any) {
    return { ...state.StepProps.NavGalleryData };
}

export const StpMainForm = connect<any,any,IStepBaseProps<IStpMainFormProps>>(mapStateToProps, {})(StepMainFormClass);