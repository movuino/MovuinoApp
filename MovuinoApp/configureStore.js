import {createStore, combineReducers} from 'redux';
import bleController from './reducers/bleControllerReducer';

const rootReducer = combineReducers({bleController: bleController});
const configureStore = () => {
  return createStore(rootReducer);
};
export default configureStore;
