import {applyMiddleware, Reducer,combineReducers,createStore,Store} from 'redux';
import thunk from 'redux-thunk';
import AppSettings, { IAppSettings } from './app'; 
import StepProps, { ISPReducerState } from './step-props';
import {composeWithDevTools} from 'redux-devtools-extension';

const rootReducer = combineReducers({
        AppSettings,
        StepProps
    }
);

export interface IState{
    AppSettings:IAppSettings,
    StepProps:ISPReducerState
}

const middleware = [thunk];
export const store = createStore(rootReducer,undefined,composeWithDevTools(applyMiddleware(...middleware)));