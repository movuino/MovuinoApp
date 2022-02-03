import { BleError, Characteristic} from "react-native-ble-plx";
import BluetoothStateManager from "react-native-bluetooth-state-manager";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState, FunctionComponent, useRef, useLayoutEffect, useContext } from "react";
import {
	View,
	Button,
	StyleSheet,
	TouchableHighlight,
	Image,
	Text,
	ColorValue,
	StyleProp,
	ViewStyle,
	TouchableOpacity,
	GestureResponderEvent,
	ScrollView,
	ActivityIndicator,
    Dimensions
} from "react-native";

import { SensorsStackParamList } from "./types";
import ServiceCard from "./ServiceCard";
import Icon from "react-native-vector-icons/AntDesign";
import FeatherIcon from "react-native-vector-icons/Feather";

import LinearGradient from "react-native-linear-gradient";
import MaskedView from "@react-native-community/masked-view";
import AppContext from "./Context";
import ScreenHeader from "./ScreenHeader";
import {Buffer} from 'buffer';
import * as shape from 'd3-shape'

import { LineChart, StackedAreaChart } from 'react-native-svg-charts'

type ChartCardProps = {
    data: number[];
    lineColor: string;
}

const ChartCard:FunctionComponent<ChartCardProps> = (props) => {
    return (
    <LineChart
    data={props.data}
    width={Dimensions.get("window").width} // from react-native
    style={{height: 120, marginHorizontal: 20}}
    svg={{ stroke: props.lineColor, strokeWidth: 2 }}
    curve={shape.curveBasisOpen}
    contentInset={{ top: 20, left: 10, right: 10, bottom: 20 }}
  />

    )
}


export default ChartCard;