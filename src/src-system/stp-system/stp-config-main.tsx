import './stp-system.css';
import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { IStepBaseProps, StepBase } from '../scn-engine/step-base';
import { INavGallery,INavGalleryShowItemsCriteria, NavGallery, TNGridDataSource } from '../../src-custom/components/NavGallery/NavGallery';
import { INavGalleryItemDTO, } from '../../src-custom/components/NavGallery/NavGallery';
import { INavGalleryData } from '../../src-custom/reducers/step-props';
import { AppGlobal } from '../../app';
import { store } from '../../src-custom/reducers';

import { TLButton } from '../../localization';

export interface IStpCfgMainProps {
    dataSource: () => INavGalleryItemDTO[];
    showItemsCriteria?: () => INavGalleryShowItemsCriteria;
}

class StepCfgMainClass extends StepBase<IStpCfgMainProps, any> {
    ngref: any;
    constructor(props: IStepBaseProps<IStpCfgMainProps>) {
        super(props);
        this.ngref = createRef();
        this.SetNavGalleryDataSource = this.SetNavGalleryDataSource.bind(this);
    }


    SetNavGalleryDataSource(dataSource: INavGalleryItemDTO[]) {
        (this.ngref.current as INavGallery).SetDataSource(dataSource, { type: 'RootItemsOnly', value: '' });
    }

    renderButtonsInDisableMode() {
        if (this.props.extraProps) {
            let lastCriteria = this.props.extraProps.showItemsCriteria?.();
            if (lastCriteria?.type !== 'RootItemsOnly') {
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
                        return "default";
                    }}
                    onItemSelected={(item)=>{
                        AppGlobal.navigate(`${item.scenarioId}_${item.scenarioItemId}`)
                    }}
                    onShownItemsChanged={(newCriteria)=>{
                        //store.dispatch({type:'Act_SP_UpdateNavGalleryShowItemsCriteria',newCriteria});
                    }}
                />
            </div>
        );
    }

}


function mapStateToProps(state: any, ownProps: any) {
    return { ...state.StepProps.NavGalleryData };
}

export const StpCfgMain = connect<any,any,IStepBaseProps<IStpCfgMainProps>>(mapStateToProps, {})(StepCfgMainClass);