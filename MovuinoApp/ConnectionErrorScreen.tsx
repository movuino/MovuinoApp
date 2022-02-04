import React, { FunctionComponent } from "react";
import {
	View,
	StyleSheet,
	Image,
	Text,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

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
