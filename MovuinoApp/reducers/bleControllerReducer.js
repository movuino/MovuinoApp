import {BLE_CONTROLLER_CHANGE} from '../constants';

const initialState = {
  bleController: null,
};

const bleControllerReducer = (state = initialState, action) => {
  switch (action.type) {
    case BLE_CONTROLLER_CHANGE:
      return {
        ...state,
        bleController: action.payload,
      };
    default:
      return state;
  }
};
export default bleControllerReducer;
