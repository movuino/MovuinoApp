import React, {createContext} from 'react';
import {BleManager, Device} from 'react-native-ble-plx';
import App from './App';
import {RootStackParamList} from './types'
import {NavigationContainerRef} from '@react-navigation/native';

interface AppContextInterface {
    bleManager: BleManager | null;
    deviceConnected: Device | null,
    deviceSelected: Device | null,
    stackNavigation: NavigationContainerRef<ReactNavigation.RootParamList> | null;
    setDeviceSelected: (device: Device) => void;
    setDeviceConnected: (device: Device) => void;
  }

const AppContext = createContext<AppContextInterface>({bleManager: null, deviceConnected: null, deviceSelected: null, setDeviceSelected: (device) => {}, setDeviceConnected: (device) => {}, stackNavigation: null});

export default AppContext;