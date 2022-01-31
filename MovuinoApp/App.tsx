import React, {useEffect, useState, FunctionComponent, Fragment, createContext} from 'react';

import {BleManager, Device, BleError} from 'react-native-ble-plx';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';

import {NavigationContainer, DefaultTheme, createNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';



import { StatusBar, SafeAreaView } from 'react-native';


import AppContext from './Context';

import BleDiscoveringScreen from './DiscoveringScreen';
import ConnectionScreen from './ConnectionScreen'
import HomeScreen from './HomeScreen'
import ConnectionErrorScreen from './ConnectionErrorScreen';



import {DISCOVERING_PAGE, CONNECTIN_PAGE, HOME_PAGE, CONNECTION_ERROR_PAGE} from './constants'


type RootStackParamList = {
  Discovering: undefined;
  Connecting: { device: Device | null };
  Home: undefined,
  ConnectionError: undefined
};

const NavStack = createNativeStackNavigator<RootStackParamList>();
const bleManager = new BleManager();

const navigationRef = createNavigationContainerRef()



const App = (props: any) => {
  const [devicesDiscovered, setDevicesDiscovered] = useState<Device[]>([]);
  const [deviceConnected, setDeviceConnected] = useState<Device | null>(null)
  const [deviceSelected, setDeviceSelected] = useState<Device | null>(null)

  const onBluetoothIsOff = () => {
    console.log('bluetooth off ');
  };

  const onDeviceSelected = (device: Device) => {
    console.log("device Selected", device.name)
    setDeviceSelected(device);
  }

  const onDeviceConnected = (device: Device) => {
    setDeviceConnected(device)
  }

  return (
    <Fragment>
      
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StatusBar barStyle="dark-content"/>
      <AppContext.Provider value={{deviceConnected: deviceConnected, deviceSelected: deviceSelected, bleManager, setDeviceSelected: onDeviceSelected, setDeviceConnected: onDeviceConnected}}>
    <NavigationContainer ref={navigationRef}
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#fff',
        },
      }}>
        <NavStack.Navigator screenOptions={{headerShown: false}}>
          <NavStack.Screen name={DISCOVERING_PAGE} component={BleDiscoveringScreen}/>
          <NavStack.Screen name={CONNECTIN_PAGE} component={ConnectionScreen}/>
          <NavStack.Screen name={HOME_PAGE}>
          {() => (
            <HomeScreen></HomeScreen>
          )}
          </NavStack.Screen>
          <NavStack.Screen name={CONNECTION_ERROR_PAGE} component={ConnectionErrorScreen}/>
        </NavStack.Navigator>
    </NavigationContainer>
    </AppContext.Provider>
    </SafeAreaView>
    </Fragment>
  );
};


export default App;
