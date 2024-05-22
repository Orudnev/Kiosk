import { IBillValidator, IDeviceDriverFabricItem, TBillValidator, TDeviceType, TDriverNames } from "../../../src/apiTypes";
import { UbaDriver } from "./uba/billvalidator";

export const AllBillValidators:IDeviceDriverFabricItem[] = [
    {
        deviceType:'BillValidator',
        driverName:'UBA',
        getInstance:(portName: string) => {
            const billValidator = new UbaDriver({
                path: portName,
                baudRate: 9600,
                databits: 8,
                stopbit: 1,
                parity: 'even'
            }, true);
            return billValidator;
        }
    },
    {
        deviceType:'BillValidator',
        driverName:'ICTL83',
        getInstance:(portName: string) => {
            throw new Error('Not implemented');
        }
    }
];





