import React, {FunctionComponent} from "react";
import {
	View,
	StyleSheet,
	Image,
	Text,
	StyleProp,
	ViewStyle,
	TouchableOpacity,
} from "react-native";

type ServiceCardProps = {
	style?: StyleProp<ViewStyle>;
	uuid: string;
	title: string;
	height: number;
	image: "accel" | "gyro" | "magneto" | "heart" | "shield";
    onPress: () => void;
};

const ServiceCard: FunctionComponent<ServiceCardProps> = (props) => {
	const loadImage = () => {
		if (props.image === "accel") return require("./assets/images/boxe.png");
		else if (props.image === "gyro") return require("./assets/images/gyro.png");
		else if (props.image === "magneto") return require("./assets/images/compas.png");
		else if (props.image === "heart") return require("./assets/images/heart-with-pulse.png");
		else return require("./assets/images/shield.png");
	};

	return (
		<TouchableOpacity
			activeOpacity={0.5}
			onPress={props.onPress}
		>
			<View style={[props.style, styles.container, { height: props.height }]}>
				<View
					style={[
						{ height: props.height * 0.8, width: props.height * 0.8, marginHorizontal: props.height * 0.1 },
						styles.leftSquare,
					]}
				>
					<Image source={loadImage()} style={{ flex: 1, resizeMode: "contain" }}></Image>
				</View>
				<Text style={styles.uuid}>{props.uuid}</Text>
				<View style={styles.titleWrapper}>
					<Text style={styles.title}>{props.title}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#F8F9FD",
		borderRadius: 20,
		borderWidth: 0.2,
		borderColor: "#DDD",
		alignItems: "center",
		flexDirection: "row",
	},
	leftSquare: {
		backgroundColor: "#fff",
		borderRadius: 18,
		borderWidth: 1,
		borderColor: "#DDD",
		justifyContent: "center",
		alignItems: "center",
	},
	uuid: {
		position: "absolute",
		right: 12,
		bottom: 10,
		color: "#DDD",
		fontFamily: "Nunito",
	},
	titleWrapper: {
		flex: 1,
		justifyContent: "center",
		alignSelf: "flex-start",
		marginTop: 20,
	},
	title: {
		fontFamily: "Nunito",
		fontSize: 24,
		textAlign: "center",
	},
});

export default ServiceCard;
