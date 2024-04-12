import React from 'react';
import { StepBase } from '../scn-engine/step-base'; 
import { ScnItemBase } from '../scn-engine/scn-base';

export const ScnConfig: any[] = [
    (<StepBase scnItem={new ScnItemBase({
        scnUid:'config',
        scnItemUid:'main'

    })}  />)
];