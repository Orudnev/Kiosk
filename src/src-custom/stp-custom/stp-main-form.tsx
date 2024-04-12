import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { IStepBaseProps, StepBase } from '../../src-system/scn-engine/step-base';
import { INavGallery, INavGalleryShowItemsCriteria, NavGallery, TNGridDataSource } from '../components/NavGallery/NavGallery';
import { INavGalleryItemDTO } from '../components/NavGallery/NavGallery';
import { AppGlobal } from '../../app';
import { store } from '../reducers';
import { INavGalleryData } from '../reducers/step-props';

export interface IStpMainFormProps {
    dataSource: () => INavGalleryItemDTO[];
    showItemsCriteria: () => INavGalleryShowItemsCriteria;
}

class Step extends StepBase<IStpMainFormProps, any> {
    ngref: any;
    constructor(props: IStepBaseProps<IStpMainFormProps>) {
        super(props);
        this.ngref = createRef();
        this.SetNavGalleryDataSource = this.SetNavGalleryDataSource.bind(this);
    }

    SetNavGalleryDataSource(dataSource: INavGalleryItemDTO[]) {
        (this.ngref.current as INavGallery).SetDataSource(dataSource, { type: 'RootItemsOnly', value: '' });
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
                />
            </div>
        );
    }
}

function mapStateToProps(state: any, ownProps: any) {
    return { ...state.StepProps.NavGalleryData };
}

export const StpMainForm = connect(mapStateToProps, {})(Step);