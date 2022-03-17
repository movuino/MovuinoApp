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
			<View style={{justifyContent: 'center', alignItems: "center"}}>
			<Image source={require("./assets/images/error_bubble.png")}></Image>
			<Text style={styles.oops}>Oops !</Text>
			<Text style={styles.text}>Something wrong happend while trying to connect</Text>
			</View>
			
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	oops: {
		fontFamily: "Nunito",
		fontSize: 28,
		textAlign: "center",
		marginTop: '10%'
	},
	text: {
		fontFamily: "Nunito",
		fontSize: 24,
		textAlign: "center",
		marginTop: '5%'
	}
});

export default ConnectionErrorScreen;
