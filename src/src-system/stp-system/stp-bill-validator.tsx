import React from 'react';
import { connect } from 'react-redux';
import { StepBase } from '../scn-engine/step-base';

class StepBillValidatorClass extends StepBase<any, any> {
    
}

function mapStateToProps(state: any, ownProps: any) {
    return { ...state.StepProps.NavGalleryData };
}

export const StpBillValidator = connect(mapStateToProps, {})(StepBillValidatorClass);