import React, { useState, Fragment } from "react";

import { BleManager, Device, LogLevel } from "react-native-ble-plx";

import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackHeaderProps } from "@react-navigation/native-stack";

import { StatusBar, SafeAreaView , View, Text} from "react-native";

import AppContext from "./Context";

import BleDiscoveringScreen from "./DiscoveringScreen";
import ConnectionScreen from "./ConnectionScreen";
// import HomeScreen from "./HomeScreen";
import ConnectionErrorScreen from "./ConnectionErrorScreen";
import SensorSelectionScreen from "./SensorSelectionScreen";
import SensorScreen3Axis from "./SensorScreen3Axis"
import HeartRateScreen from "./HeartRateScreen";
import ScreenHeader from "./ScreenHeader";

import { DISCOVERING_PAGE, CONNECTIN_PAGE, HOME_PAGE, CONNECTION_ERROR_PAGE } from "./constants";
import { RootStackParamList } from "./types";

const NavStack = createNativeStackNavigator<RootStackParamList>();
const bleManager = new BleManager();
bleManager.setLogLevel(LogLevel.Verbose)

const navigationRef = createNavigationContainerRef();

const test = () => {
	return <View>
		<Text>Test</Text>
	</View>
}

const App = (props: any) => {
	const [deviceConnected, setDeviceConnected] = useState<Device | null>(null);
	const [deviceSelected, setDeviceSelected] = useState<Device | null>(null);

	const onDeviceSelected = (device: Device) => {
		console.log("device Selected", device.name);
		setDeviceSelected(device);
	};

	const onDeviceConnected = (device: Device) => {
		setDeviceConnected(device);
	};

	const makeHeader = (props: NativeStackHeaderProps) => {

		if (props.options.title === "Sensors")
			return <ScreenHeader title={props.options.title} onBack={() => deviceConnected?.cancelConnection()}></ScreenHeader>
		
		if (props.route.name === DISCOVERING_PAGE)
			return <View/>
		
		if (props.route.name === CONNECTION_ERROR_PAGE)
			return <ScreenHeader title={props.options.title} onBack={() => props.navigation.navigate(DISCOVERING_PAGE)}></ScreenHeader>
	
		return <ScreenHeader title={props.options.title} onBack={props.navigation.goBack}></ScreenHeader>
	}

	return (
			<SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
				<StatusBar barStyle='dark-content' />
				<AppContext.Provider
					value={{
						deviceConnected: deviceConnected,
						deviceSelected: deviceSelected,
						bleManager,
						setDeviceSelected: onDeviceSelected,
						setDeviceConnected: onDeviceConnected,
					}}
				>
					<NavigationContainer
						ref={navigationRef}
						theme={{
							...DefaultTheme,
							colors: {
								...DefaultTheme.colors,
								background: "#fff",
							},
						}}
					>
						<NavStack.Navigator screenOptions={{ headerShown: true, header: makeHeader}} initialRouteName='Discovering'>
							<NavStack.Screen name='Discovering' component={BleDiscoveringScreen}/>
							<NavStack.Screen name="Test" component={test} />
							<NavStack.Screen name='Connecting' component={ConnectionScreen} />
							<NavStack.Screen name='ConnectionError' component={ConnectionErrorScreen} />
							<NavStack.Screen name='Home' component={SensorSelectionScreen} options={{title: "Sensors"}}/>
							<NavStack.Screen name='SensorScreen3Axis' component={SensorScreen3Axis} />
							<NavStack.Screen name='HeartRateScreen' component={HeartRateScreen} options={{title: "Heart Rate"}}/>
						</NavStack.Navigator>
					</NavigationContainer>
				</AppContext.Provider>
			</SafeAreaView>
	);
};

export default App;
