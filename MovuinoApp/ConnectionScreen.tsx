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
import React, { FunctionComponent, useContext, useEffect, useState, useRef, useLayoutEffect } from "react";
import Icon from "react-native-vector-icons/AntDesign";
import { background } from "native-base/lib/typescript/theme/styled-system";

import AppContext from "./Context";
import { BleError, Characteristic } from "react-native-ble-plx";
import ScreenHeader from "./ScreenHeader";

import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";

import { DISCOVERING_PAGE, CONNECTIN_PAGE, HOME_PAGE, CONNECTION_ERROR_PAGE } from "./constants";

const CONNECTION_TIMEOUT_DELAY = 5000;

type RootStackParamList = {
	Discovering: undefined;
	Connecting: undefined;
	Home: undefined;
	ConnectionError: undefined;
};

type ConnectionScreenProps = NativeStackScreenProps<RootStackParamList, "Connecting">;

const ConnectionScreen: FunctionComponent<ConnectionScreenProps> = ({ navigation, route }) => {
	const { deviceSelected, setDeviceConnected } = useContext(AppContext);
	const [isConnected, setIsConnected] = useState(false);

	const onConnectionCancel = () => {
		console.log("cancel");
		if (deviceSelected === null) return;
		deviceSelected.cancelConnection().catch((error) => {
			if (error instanceof BleError && error.message === "Operation was cancelled") {
			} else throw error;
		});
		navigation.navigate(DISCOVERING_PAGE);
	};

	const onConnectionError = (info?: string | undefined) => {
		// deviceSelected?.cancelConnection();
		navigation.navigate(CONNECTION_ERROR_PAGE as never, {} as never);
		console.log(info);
	};

	const onConnected = () => {
		console.log("onConnected");
        if (deviceSelected)
            setDeviceConnected(deviceSelected);
        navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          })
	};

	const connect = async () => {
		console.log("connect");
		if (deviceSelected === null) return onConnectionError();
		try {
			const device = await deviceSelected.connect();
			const isConnected = await device.isConnected();
			setIsConnected(true);
			setTimeout(onConnected, 300); // delay home screen opening to show the success animation
		} catch (e) {
			if (e instanceof BleError && e.message === "Operation was cancelled") {
			} // Thrown if cancel button is pressed
			else if (e instanceof Error) {
				console.error(e);
				return onConnectionError(e.message);
			} // other errors
			else return onConnectionError();
		}
	};

	useEffect(() => {
		connect();
	}, []);
	return (
		<View style={styles.container}>
			<ScreenHeader onBack={onConnectionCancel} showSettings={false}/>
			<View style={styles.textWrapper}>
				<Text style={styles.title}>Connecting to</Text>
				<Text style={styles.deviceName}>{deviceSelected ? deviceSelected.name : ""}</Text>
				<TouchableOpacity style={styles.cancel} onPress={onConnectionCancel} activeOpacity={0.3}>
					<Text style={styles.cancelText}>Cancel</Text>
				</TouchableOpacity>
			</View>
			<View style={{ flex: 1, alignItems: "center" }}>
				{isConnected && <Image source={require("./assets/images/success_bubble.png")}></Image>}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	textWrapper: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontFamily: "Nunito",
		fontSize: 24,
		fontWeight: "700",
	},
	deviceName: {
		fontFamily: "Nunito",
		fontSize: 24,
		color: "rgb(3, 3, 3)",
	},
	cancel: {
		marginTop: 20,
		borderColor: "rgb(3, 3, 3)",
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	cancelText: {
		fontFamily: "Nunito",
		fontSize: 14,
	},
});

export default ConnectionScreen;
