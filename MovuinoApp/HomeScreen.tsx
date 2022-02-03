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
} from "react-native";

import { BleManager, Device } from "react-native-ble-plx";
import BluetoothStateManager from "react-native-bluetooth-state-manager";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/AntDesign";
import SensorHome from "./SensorsHome";
import AppContext from "./Context";

const Tab = createBottomTabNavigator();

type HomeScreenProps = {};

const test1 = () => <View key={123}></View>;

const HomeScreen: FunctionComponent<HomeScreenProps> = (props) => {
    const {deviceConnected} = useContext(AppContext);
	return (
		<View style={styles.container}>
            <SensorHome></SensorHome>
			{/* <Tab.Navigator screenOptions={{ tabBarShowLabel: false, headerShown: false, tabBa }}>
				<Tab.Screen name='Sensors' component={SensorHome} options={{
						tabBarIcon: (props) => <Icon name='dotchart' size={24} color={props.focused ? "#4A78FF" : "#DDD"}></Icon>,
					}}/>
				<Tab.Screen
					name='Something'
					component={test1}
					options={{
						tabBarIcon: (props) => <Icon name='dotchart' size={24} color={props.focused ? "#4A78FF" : "#DDD"}></Icon>,
					}}
				/>
			</Tab.Navigator> */}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default HomeScreen;
