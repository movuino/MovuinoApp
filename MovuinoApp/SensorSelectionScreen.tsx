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

import ScreenHeader from "./ScreenHeader";

const ACCEL_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const GYRO_SERVICE_UUID = "4fafc202-1fb5-459e-8fcc-c5c9c331914b";
const MAGNETO_SERVICE_UUID = "4fafc203-1fb5-459e-8fcc-c5c9c331914b";

type DummySpacerProps = {
	height: string | number | undefined;
};

const DummySpacer: FunctionComponent<DummySpacerProps> = (props) => {
	return <View style={{ height: props.height }}></View>;
};

type SensorSelectionScreenProps = NativeStackScreenProps<SensorsStackParamList, "SensorHome">;

const SensorSelectionScreen: FunctionComponent<SensorSelectionScreenProps> = (props) => {
	const { stackNavigation, deviceConnected } = useContext(AppContext);
	const [services, setServices] = useState<Service[]>([]);

	const onBack = () => {
		stackNavigation?.navigate("Discovering" as never);
	};

	useEffect(() => {
		(async () => {
			await deviceConnected?.discoverAllServicesAndCharacteristics();
			if (!deviceConnected) return;
			setServices(await deviceConnected.services());
		})();
		// await device.discoverAllServicesAndCharacteristics()
		// const services = await device.services()
		// let characteristics;
		// if (services.length)
		//     characteristics = await device.characteristicsForService(services[0].uuid)

		// console.log('device', device, isConnected)
		// console.log("services", services)
		// console.log("characteristics", characteristics)
	}, []);

	return (
		<View style={styles.container}>
			<ScreenHeader title='Sensors' onBack={onBack}></ScreenHeader>
			<MaskedView
				maskElement={
					<LinearGradient
						colors={["#FFFFFF00", "#FFFFFF", "#FFFFFF", "#FFFFFF00"]}
						locations={[0, 0.1, 0.9, 1]}
						style={styles.linearGradient}
					></LinearGradient>
				}
			>
				<ScrollView>
					<DummySpacer height={50}></DummySpacer>
					<Text style={styles.subtitle}>Available</Text>
					{!services.length && <ActivityIndicator style={{ marginBottom: 30 }} />}
					{services.map((service) => {
						switch (service.uuid) {
							case ACCEL_SERVICE_UUID:
								return (
									<ServiceCard
										key={service.uuid}
										uuid={service.uuid}
										title={"3 Axis Accelerometer"}
										style={styles.sensorCard}
										height={100}
										image={"accel"}
										onPress={() => {
											props.navigation.navigate("SensorScreen3Axis", { title: "Accelerometer", serviceUUID: service.uuid });
										}}
									></ServiceCard>
								);
							case GYRO_SERVICE_UUID:
								return (
									<ServiceCard
										key={service.uuid}
										uuid={service.uuid}
										title={"Gyroscope"}
										style={styles.sensorCard}
										height={100}
										image={"gyro"}
										onPress={() => {
											props.navigation.navigate("SensorScreen3Axis", { title: "Gyroscope", serviceUUID: service.uuid });
										}}
									></ServiceCard>
								);
							case MAGNETO_SERVICE_UUID:
								return (
									<ServiceCard
										key={service.uuid}
										uuid={service.uuid}
										title={"Magnetometer"}
										style={styles.sensorCard}
										height={100}
										image={"magneto"}
										onPress={() => {
											props.navigation.navigate("SensorScreen3Axis", { title: "Magnetometer", serviceUUID: service.uuid });
										}}
									></ServiceCard>
								);
							default:
								break;
						}
					})}
					<Text style={styles.subtitle}>Unavailable</Text>
					<ServiceCard
						uuid={"unavailable"}
						title={"GPS Shield"}
						style={styles.sensorCard}
						height={100}
						image={"shield"}
						onPress={() => {}}
					></ServiceCard>
					<ServiceCard
						uuid={"unavailable"}
						title={"Temperature Shield"}
						style={styles.sensorCard}
						height={100}
						image={"shield"}
						onPress={() => {}}
					></ServiceCard>
					<DummySpacer height={150}></DummySpacer>
				</ScrollView>
			</MaskedView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	sensorCard: {
		marginHorizontal: 10,
		marginVertical: 10,
	},
	subtitle: {
		fontFamily: "Nunito",
		fontSize: 30,
		marginLeft: 30,
	},
	linearGradient: {
		flex: 1,
		width: "100%",
	},
});

export default SensorSelectionScreen;
