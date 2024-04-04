import {applyMiddleware, Reducer,combineReducers,createStore,Store} from 'redux';
import thunk from 'redux-thunk';
import AppSettings, { IAppSettings } from './app'; 
import {composeWithDevTools} from 'redux-devtools-extension';

const rootReducer = combineReducers({
        AppSettings
    }
);

export interface IState{
    AppSettings:IAppSettings
}

const middleware = [thunk];
export const store = createStore(rootReducer,undefined,composeWithDevTools(applyMiddleware(...middleware)));