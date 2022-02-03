import { BleManager, Device, Service } from "react-native-ble-plx";
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
} from "react-native";

import { SensorsStackParamList } from "./types";
import ServiceCard from "./ServiceCard";
import Icon from "react-native-vector-icons/AntDesign";
import FeatherIcon from "react-native-vector-icons/Feather";

import LinearGradient from "react-native-linear-gradient";
import MaskedView from "@react-native-community/masked-view";
import AppContext from "./Context";

import SensorSelectionScreen from "./SensorSelectionScreen";
import SensorScreen3Axis from "./SensorScreen3Axis"
import GyroScreen from "./GyroScreen"

const ACCEL_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const GYRO_SERVICE_UUID = "4fafc202-1fb5-459e-8fcc-c5c9c331914b";
const MAGNETO_SERVICE_UUID = "4fafc203-1fb5-459e-8fcc-c5c9c331914b";

const NavStack = createNativeStackNavigator<SensorsStackParamList>();

type SensorHomeProps = {};

const SensorHome: FunctionComponent<SensorHomeProps> = (props) => {
	return (
		<NavStack.Navigator screenOptions={{ headerShown: false }}>
			<NavStack.Screen name='SensorHome' component={SensorSelectionScreen} />
            <NavStack.Screen name='SensorScreen3Axis' component={SensorScreen3Axis} />
		</NavStack.Navigator>
	);
};

export default SensorHome;
