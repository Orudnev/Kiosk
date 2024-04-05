import React from 'react';
import { StepBase } from '../../src-system/scn-engine/step-base';
import { ScnItemBase } from '../../src-system/scn-engine/scn-base';
import { ApiWrapper } from '../../apiwrapper';

export const ScnSelectService: any[] = [
    (<StepBase buttons='btnBack,btnHome,btnNext'
        scnItem={new ScnItemBase({
            scnUid: 'main',
            scnItemUid: 'main',
            inlineHandlers: [
                {
                    name: 'Init', handler: async (step) => {
                        let result = await ApiWrapper.GetProfile();
                        let s = 1;
                    }
                }
            ]
        })}
    />)
];