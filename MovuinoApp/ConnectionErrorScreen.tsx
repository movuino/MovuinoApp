import React, { useEffect, useState, FunctionComponent, useRef, useLayoutEffect } from "react";
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

import ScreenHeader from "./ScreenHeader";

import { DISCOVERING_PAGE } from "./constants";
import { RootStackParamList } from "./types";

type ConnectionErrorScreenProps = NativeStackScreenProps<RootStackParamList, "Connecting">;

const ConnectionErrorScreen: FunctionComponent<ConnectionErrorScreenProps> = (props) => {
	return (
		<View style={styles.container}>
			<ScreenHeader
				onBack={() => {
					props.navigation.navigate(DISCOVERING_PAGE);
				}}
			></ScreenHeader>
			<Image source={require("./assets/images/error_bubble.png")}></Image>
			<Text>Error</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default ConnectionErrorScreen;
