import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { StepBase } from '../scn-engine/step-base';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { ApiWrapper } from '../../apiwrapper';
import { BillValidatorTypesList, TDriverNames } from '../../apiTypes';


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
        ApiWrapper.GetSerialPortList().then(portList=>{
            let result  = portList.map((p:any)=>p.path);
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


class StepBillValidatorClass extends StepBase<any, any> {
    fields = {
        driverName:'UBA',
        serialPort:'COM11'    
    }
    componentWillUnmount(): void {
        //ApiWrapper.SubscribeToBVEvent('SerialPortDataReceived',undefined);
        //ApiWrapper.HW_SubscibeOnOff('BillValidator','SerialPortDataReceived',false);
        ApiWrapper.BV_Execute('Release').then(result=>{
            console.log(result);
        })
        .catch((err)=>{
            console.log(err);
        });
    }

    renderBody(): JSX.Element {
        return (
            <div>
                <SelectFromList caption='Bill validator type:'
                    cssClass='bill-validator-type'
                    getList={new Promise(resolve=>{resolve([...BillValidatorTypesList])})}
                    selectedValue={this.fields.driverName} onSelectedValueChanged={(newValue) => { 
                        this.fields.driverName = newValue;
                    }}
                />
                <SelectSerialPortList selectedPortName='COM11' onSelectedPortChanged={(newValue) => { 
                    this.fields.serialPort = newValue;
                }} />
                <FormControl sx={{ m: 1 }} className='bill-validator-connect-button'>
                    <Button variant="outlined"
                        onClick={()=>{
                            ApiWrapper.HW_CreateDevice('BillValidator',this.fields.driverName as TDriverNames,this.fields.serialPort)
                            .then((res)=>{
                                let s = res;
                                setTimeout(()=>{
                                    ApiWrapper.BV_Execute('Test').then((result)=>{
                                        console.log(result);
                                    });    
                                },1000);
                            })
                            //ApiWrapper.BV_SubscribeOnOff('SerialPortDataReceived',true);
                            // ApiWrapper.SubscribeToBVEvent('SerialPortDataReceived',(data)=>{
                            //     console.log(data);
                            // });
                        }}
                    >
                        Connect
                    </Button>
                </FormControl>
            </div>
        );
    }
}

function mapStateToProps(state: any, ownProps: any) {
    return { ...state.StepProps.NavGalleryData };
}

export const StpBillValidator = connect(mapStateToProps, {})(StepBillValidatorClass);