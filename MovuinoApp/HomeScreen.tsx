import React, {useEffect, useState, FunctionComponent, useRef, useLayoutEffect} from 'react';
import {View, Button, StyleSheet, TouchableHighlight, Image, Text, ColorValue, StyleProp, ViewStyle, TouchableOpacity, GestureResponderEvent} from 'react-native'

import {BleManager, Device} from 'react-native-ble-plx';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';

import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';


type HomeScreenProps = {

}

const HomeScreen:FunctionComponent<HomeScreenProps> = (props) => {
    return (
        <View>

        </View>
    )
}

export default HomeScreen;