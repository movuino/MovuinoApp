import {View, Button, StyleSheet, TouchableHighlight, Image, Text, ColorValue, StyleProp, ViewStyle, TouchableOpacity, GestureResponderEvent} from 'react-native'
import React, {FunctionComponent, useContext, useEffect, useState} from 'react'
import Icon from 'react-native-vector-icons/AntDesign';
import { background } from 'native-base/lib/typescript/theme/styled-system';

import AppContext from './Context';
import { BleError, Characteristic } from 'react-native-ble-plx';

type ScreenHeaderProps = {
    style?: StyleProp<ViewStyle>;
    onBack?: (event: GestureResponderEvent) => void;
}

const ScreenHeader: FunctionComponent<ScreenHeaderProps> = props => {
    return (
        <View style={[props.style, {justifyContent: "center"}]}>
            <View style={{marginLeft: 10, width: 60, height: 40, alignItems: "center"}}>
                <TouchableOpacity onPress={props.onBack} activeOpacity={0.3}>
                    <Icon name='arrowleft' size={35}/>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ScreenHeader;