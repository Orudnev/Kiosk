import React, { useState, useEffect, MouseEventHandler } from 'react';
import { connect } from 'react-redux';
import { StepBase } from '../scn-engine/step-base';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { ApiWrapper } from '../../apiwrapper';
import { BillValidatorTypesList, IMessage, TDeviceCheckStatus, TDriverNames } from '../../apiTypes';



interface ISerialPortListProps {
    selectedPortName: string;
    onSelectedPortChanged: (newPortName: string) => void;
}

function dynamicSort(property: string) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a: any, b: any) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

interface ISelectFromListProps {
    caption: string;
    selectedValue: string;
    getList: Promise<string[]>;
    cssClass?: string;
    onSelectedValueChanged: (newPortName: string) => void;
}

function SelectFromList(props: ISelectFromListProps) {
    const emptyList: string[] = [];
    const [valueList, setValueList] = useState(emptyList);
    const [selectedValue, setSelectedValue] = useState(props.selectedValue);
    const handleChange = (event: SelectChangeEvent) => {
        setSelectedValue(event.target.value);
        props.onSelectedValueChanged(event.target.value);
    };
    const listItems = valueList.map((itm: any) => {
        return (
            <MenuItem key={`selitem_${itm}`} value={itm}>{itm}</MenuItem>
        );
    });
    useEffect(() => {
        props.getList.then((list: any) => {
            setValueList(list);
        });
    }, []);

    return (
        <FormControl sx={{ m: 1 }} className={props.cssClass}>
            <InputLabel id="demo-simple-select-helper-label">{props.caption}</InputLabel>
            <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={selectedValue}
                label={props.caption}
                onChange={handleChange}
            >
                {listItems}
            </Select>
        </FormControl>
    );
}

function SelectSerialPortList(props: ISerialPortListProps) {
    let getPortList = new Promise<string[]>((resolve, reject) => {
        ApiWrapper.GetSerialPortList().then(portList => {
            let result = portList.map((p: any) => p.path);
            resolve(result);
        })
    });

    return (
        <SelectFromList caption='Serial port:'
            cssClass='bill-validator-serial-port'
            getList={getPortList}
            selectedValue={props.selectedPortName} onSelectedValueChanged={props.onSelectedPortChanged}
        />);
}

function SelectSerialPortListOld(props: ISerialPortListProps) {
    const [serialPortList, setSerialPortList] = useState([]);
    const [serialPort, setSerialPort] = useState(props.selectedPortName);
    const serialPortCaption = "Serial port:";
    const handleChange = (event: SelectChangeEvent) => {
        setSerialPort(event.target.value);
        props.onSelectedPortChanged(event.target.value);
    };
    const portItems = serialPortList.sort(dynamicSort("path")).map((itm: any) => {
        return (
            <MenuItem key={`comport{itm.path}`} value={itm.path}>{itm.path}</MenuItem>
        );
    });

    useEffect(() => {
        ApiWrapper.GetSerialPortList().then((ports) => {
            setSerialPortList(ports);
        });
    }, []);

    return (
        <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-helper-label">{serialPortCaption}</InputLabel>
            <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={serialPort}
                label={serialPortCaption}
                onChange={handleChange}
            >
                {portItems}
            </Select>
        </FormControl>
    );
}

interface ICheckButtonProps {
    checkStatus: TDeviceCheckStatus;
    onClick: () => void;
}

function CheckButton(props: ICheckButtonProps) {
    let stateText = "";
    if (props.checkStatus === 'connected' || props.checkStatus === 'no-answer') {
        stateText = props.checkStatus;
    }
    return (
        <FormControl sx={{ m: 1 }} className='bill-validator-connect-button'>
            <Button
                variant="outlined"
                onClick={() => {
                    props.onClick();
                }}
            >
                <div className='caption'>Check connection</div>
                <div className={`state ${props.checkStatus === 'undefined' ? 'hidden' : 'state__' + props.checkStatus}`}>
                    {props.checkStatus === 'checking'
                        ? (<img />)
                        : (<></>)
                    }
                    {stateText}
                </div>
            </Button>
        </FormControl>
    );
}

interface ICmdButtonProps {
    onClick: () => void;
    caption: string;
}
function CmdButton(props: ICmdButtonProps) {
    return (
        <FormControl sx={{ m: 1 }} className='bill-validator-connect-button'>
            <Button
                variant="outlined"
                onClick={() => {
                    props.onClick();
                }}
            >
                <div className='caption'>{props.caption}</div>
            </Button>
        </FormControl>
    )
}

interface IIndicator {
    caption: string;
    value: string;
    className?: string;
}
function Indicator(props: IIndicator) {
    return (
        <div className={`indicator ${props?.className}`} >
            {props.value}
            <div className='caption'>
                {props.caption}
            </div>
        </div>
    )
}

interface IIndicatorWithResetButton extends IIndicator {
    onReset: () => any;
}
function IndicatorWithResetButton(props: IIndicatorWithResetButton) {
    return (
        <div className={`indicator-with-reset-button `} >
            <div className={`${props?.className}`}>
                {props.value}
            </div>
            <div className='caption'>
                {props.caption}
            </div>
            <button onClick={() => props.onReset()} className="MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary MuiButton-sizeMedium MuiButton-outlinedSizeMedium MuiButton-colorPrimary MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary MuiButton-sizeMedium MuiButton-outlinedSizeMedium MuiButton-colorPrimary css-1rwt2y5-MuiButtonBase-root-MuiButton-root" type="button">
                x
            </button>
        </div>
    )
}

class StepBillValidatorClass extends StepBase<any, any> {
    fields = {
        driverName: 'UBA',
        serialPort: 'COM11'
    }
    constructor(props: any) {
        super(props);
        this.state = {
            checkStatus: 'undefined',
            statusValue: 'Undefined',
            lastBanknote: ''
        }
        this.handleMessage = this.handleMessage.bind(this);
    }

    componentWillUnmount(): void {
        //ApiWrapper.SubscribeToBVEvent('SerialPortDataReceived',undefined);
        //ApiWrapper.HW_SubscibeOnOff('BillValidator','SerialPortDataReceived',false);
        ApiWrapper.UnsubscribeFromMessages(this.getHandlerMessageUid());

        ApiWrapper.BV_Execute('Release').then(result => {
            console.log(result);
        })
            .catch((err) => {
                console.log(err);
            });
    }

    getHandlerMessageUid() {
        let hndlrId = this.props.scnItem.props.scnUid + "_" + this.props.scnItem.props.scnItemUid;
        return hndlrId;
    }

    handleMessage(message: IMessage) {
        switch (message.messageID) {
            case 'StatusChanged':
                this.setState({ statusValue: message.payload })
                break;
            case 'Stacked':
                console.log(message);
                this.setState({ lastBanknote: message.payload });
                break;
        }
    }

    renderBody(): JSX.Element {
        return (
            <div>
                <SelectFromList caption='Bill validator type:'
                    cssClass='bill-validator-type'
                    getList={new Promise(resolve => { resolve([...BillValidatorTypesList]) })}
                    selectedValue={this.fields.driverName} onSelectedValueChanged={(newValue) => {
                        this.fields.driverName = newValue;
                    }}
                />
                <SelectSerialPortList selectedPortName='COM11' onSelectedPortChanged={(newValue) => {
                    this.fields.serialPort = newValue;
                }} />
                <CheckButton checkStatus={this.state.checkStatus} onClick={() => {
                    this.setState({ checkStatus: 'checking' });
                    ApiWrapper.HW_CreateDevice('BillValidator', this.fields.driverName as TDriverNames, this.fields.serialPort)
                        .then((res) => {
                            if (!res) {
                                this.setState({ checkStatus: 'no-answer' });
                                return;
                            }
                            ApiWrapper.SubscribeToMessages(this.getHandlerMessageUid(), this.handleMessage);
                            setTimeout(() => {
                                ApiWrapper.BV_Execute('Test').then((result) => {
                                    if (result) {
                                        this.setState({ checkStatus: 'connected' });
                                    }
                                    else {
                                        this.setState({ checkStatus: 'no-answer' });
                                    }
                                });
                            }, 1000);
                        })
                    //ApiWrapper.BV_SubscribeOnOff('StatusChanged',true);                    
                    //ApiWrapper.BV_SubscribeOnOff('SerialPortDataReceived',true);
                    // ApiWrapper.SubscribeToBVEvent('SerialPortDataReceived',(data)=>{
                    //     console.log(data);
                    // });
                }} />
                {this.state.checkStatus === 'connected'
                    ? (
                        <div>
                            <CmdButton caption='Start receive money' onClick={() => {
                                ApiWrapper.BV_Execute('StartReceiveMoney');
                            }} />
                            <CmdButton caption='Stop receive money' onClick={() => {
                                ApiWrapper.BV_Execute('StopReceiveMoney');
                            }} />
                            <div>
                                <Indicator caption='Status:' value={this.state.statusValue} className='bill-validator-status' />
                                <IndicatorWithResetButton caption='Last banknote:'
                                    value={this.state.lastBanknote}
                                    className='bill-validator-last-banknote'
                                    onReset={() => {
                                        this.setState({ lastBanknote: "" });
                                    }}
                                />
                            </div>
                        </div>
                    )
                    : (<div />)
                }
            </div>
        );
    }
}

function mapStateToProps(state: any, ownProps: any) {
    return { ...state.StepProps.NavGalleryData };
}

export const StpBillValidator = connect(mapStateToProps, {})(StepBillValidatorClass);