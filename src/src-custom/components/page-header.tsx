import React from 'react';

export function PageHeader(props:any) {
    let renderTimer = () => {
        if (props.showTimer) {
            return (<div className="header-timer">{props.showTimer()}</div>);
        }
    };
    return (
        <div id="headerComponent" className="pg-header__component" >
            <div className="pg-header__logo"></div>
        </div>
    );
}   