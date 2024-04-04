import './app.css';
import { useNavigate, matchRoutes, useLocation } from 'react-router-dom';
import { NavigateFunction, Route, Routes } from 'react-router';
import { store, IState } from './src-custom/reducers';
import { useEffect, useState } from 'react';
import { UseSelector, useSelector } from 'react-redux/es/hooks/useSelector';
import AllScenarioItems from './src-custom/scn-custom';
import { StepBase } from './src-system/scn-engine/step-base';
// class AppGlobalClass {
//   private navfunc:NavigateFunction|undefined = undefined;
//   signalR:any;
//   //signalRGate:SRGateClass|undefined=undefined;
//   prevAction:any=null;
//   dispatchFunc:any = undefined;
//   hwConnectorPort:string = "";
//   constructor(){
//     this.getState = this.getState.bind(this);
//     this.navigate = this.navigate.bind(this);
//   }

//   init(){
//     this.navfunc = useNavigate();
//   }


//   dispatch(action:any){
//     store.dispatch(action);
//   }

//   navigate(url:string){
//     if(this.navfunc){
//       this.navfunc(url);
//     }
//   }

//   getState():any {
//     return store.getState();
//   }
// }

function routes() {
  // const routes =  scenarioEngine.getAllRoutes();
  // const result = routes.map((route,index)=>{
  //   if(route.main){
  //     let elm = route.main();
  //     let rpath = route.path + (route.hasNested?"/*":"");
  //     return (<Route key={"route"+index} element={elm} path={rpath} />);
  //   }
  // }
  // );
  // return result;
}

// export interface IAppGlobal {
//   navigate:(url:string)=>void;
//   getState:()=>unknown;
// }

function _getState(): IState {
  return store.getState() as IState;
}

export const AppGlobal = {
  AppInstance: {},
  navigate: (newurl: string) => {
    store.dispatch({ type: "ActNavigate", url: newurl })
  },
  State: _getState
}

//@ts-ignore
window.appg = AppGlobal;

function Navigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const appset = useSelector((state: any) => {
    return state.AppSettings;
  });
  useEffect(() => {
    if (appset.url !== location.pathname && appset.url != "/") {
      navigate(appset.url);
    }
  }, [appset]);
  console.log(AppGlobal.State().AppSettings.url, location.pathname);
  return (<div />);
}

function App() {
  useEffect(() => { 
    AppGlobal.navigate("/main_main"); 
    //@ts-ignore
    //window.electronAPI.setTitle("бырбырбыр");
  }, []);
  return (
    <div>
      <Navigator />
      <Routes>
        {AllScenarioItems.map((itm: any, index) => {
          let props = itm.props;
          let url = `/${props.scnUid}_${props.scnItemUid}`;
          return (<Route key={"route" + index} element={itm} path={url} />)
        })}
      </Routes>
    </div>
  );
}

{/* <Route key={"rootelm"} element={<div onClick={()=>{
  AppGlobal.navigate("/blabla");
}}>root</div>} path={"/"} />
<Route key={"blabla"} element={<div onClick={()=>AppGlobal.navigate("/")}>blabla</div>} path={"/blabla"} /> */}



export default App;
