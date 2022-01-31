import {BLE_CONTROLLER_CHANGE} from '../constants';

export function changeBleController(controller) {
  return {
    type: BLE_CONTROLLER_CHANGE,
    payload: controller,
  };
}
