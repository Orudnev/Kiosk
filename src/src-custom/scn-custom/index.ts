import { ReactNode } from "react";
import { StepBase } from "../../src-system/scn-engine/step-base"; 
import { ScnSelectService } from "./scn-select-service"; 
import { ScnConfig } from "../../src-system/scn-system/config"; 


export type TScenarioUid =
    ''|'main'|'config'|'TermChekWithLoop'|'TermCheckWithoutLoop'|'iumiRegularSrv'|'iumiWalletSrv'|'encashmentSrv'| 'billValidatorEnableDisable'; 

export type TScenarioItemUid =  
    ''|'main'|'selectItemFromNavGallery'|'enterNumberParameter'|'enterStringParameter'|'payment'
    |'enterPhoneNumber'|'enterIIN'|'enterDate'|'enterTC'|'enterPhoneNumberChange'|'enterPolicyNumber'
    |'enterTransactionNumber'|'enterConfirmPhoneNumber'|'enterDriverLicence'|'configJson'|'testDynamicForm'|'outOfService'
    |'validateKioskReady'|'paymentResult'|'waitOperationCompleting'|'checkPrinter'|'authentication'|'login'|'checkHardware'
    |'printerNotReady'| 'existPendingEncashment'|'billValidator';
    

function GetAllStepItems():ReactNode[]{
    let rv=[
        ...ScnSelectService,
        ...ScnConfig
    ];
    return rv; 
}

const AllStepItems = GetAllStepItems();
export default AllStepItems; 