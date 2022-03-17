import React, {createContext} from 'react';
import {BleManager, Device} from 'react-native-ble-plx';

interface AppContextInterface {
    bleManager: BleManager | null;
    deviceConnected: Device | null,
    deviceSelected: Device | null,
    setDeviceSelected: (device: Device) => void;
    setDeviceConnected: (device: Device) => void;
  }

const AppContext = createContext<AppContextInterface>({bleManager: null, deviceConnected: null, deviceSelected: null, setDeviceSelected: (device) => {}, setDeviceConnected: (device) => {}});

export default AppContext;