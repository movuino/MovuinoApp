import { Characteristic, Service } from "react-native-ble-plx";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState, FunctionComponent, useRef, useLayoutEffect, useContext } from "react";
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, Button } from "react-native";

import { RootStackParamList } from "./types";
import ServiceCard from "./ServiceCard";

import LinearGradient from "react-native-linear-gradient";
import MaskedView from "@react-native-community/masked-view";
import AppContext from "./Context";
import { DISCOVERING_PAGE } from "./constants";

const ACCEL_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const GYRO_SERVICE_UUID = "4fafc202-1fb5-459e-8fcc-c5c9c331914b";
const MAGNETO_SERVICE_UUID = "4fafc203-1fb5-459e-8fcc-c5c9c331914b";
// const PPG_SERVICE_UUID = ""

type DummySpacerProps = {
	height: string | number | undefined;
};

const DummySpacer: FunctionComponent<DummySpacerProps> = (props) => {
	return <View style={{ height: props.height }}></View>;
};

type SensorSelectionScreenProps = NativeStackScreenProps<RootStackParamList, "SensorHome">;

const ACC_CHAR_UUID = "00001102-0000-1000-8000-00805f9b34fb";
const GYR_CHAR_UUID = "00001103-0000-1000-8000-00805f9b34fb";
const MAG_CHAR_UUID = "00001104-0000-1000-8000-00805f9b34fb";
const PPG_SERVICE_UUID = "00001300-0000-1000-8000-00805f9b34fb";

const START_CHAR_UUID = "00001401-0000-1000-8000-00805f9b34fb";

const SensorSelectionScreen: FunctionComponent<SensorSelectionScreenProps> = (props) => {
	const { deviceConnected } = useContext(AppContext);
	const [services, setServices] = useState<Service[]>([]);
	const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);

	useEffect(() => {
		(async () => {
			await deviceConnected?.discoverAllServicesAndCharacteristics();
			if (!deviceConnected) return;
			const servicesFound = await deviceConnected.services();
			let characteristicsFound: Characteristic[] = [];
			for (const service of servicesFound) {
				characteristicsFound = [...characteristicsFound, ...(await service.characteristics())];
				console.log(await service.characteristics());
			}
			setServices(servicesFound);
			setCharacteristics(characteristicsFound);
		})();
	}, []);

	return (
		<View style={styles.container}>
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
					{characteristics.map((characteristic) => {
						switch (characteristic.uuid) {
							case ACC_CHAR_UUID:
								return (
									<ServiceCard
										key={characteristic.uuid}
										uuid={characteristic.uuid}
										title={"3 Axis Accelerometer"}
										style={styles.sensorCard}
										height={100}
										image={"accel"}
										onPress={() => {
											props.navigation.navigate("SensorScreen3Axis", {
												title: "Accelerometer",
												serviceUUID: characteristic.serviceUUID,
												characteristicUUID: characteristic.uuid,
											});
										}}
									></ServiceCard>
								);
							case GYR_CHAR_UUID:
								return (
									<ServiceCard
										key={characteristic.uuid}
										uuid={characteristic.uuid}
										title={"Gyroscope"}
										style={styles.sensorCard}
										height={100}
										image={"gyro"}
										onPress={() => {
											props.navigation.navigate("SensorScreen3Axis", {
												title: "Gyroscope",
												serviceUUID: characteristic.serviceUUID,
												characteristicUUID: characteristic.uuid,
											});
										}}
									></ServiceCard>
								);
							case MAG_CHAR_UUID:
								return (
									<ServiceCard
										key={characteristic.uuid}
										uuid={characteristic.uuid}
										title={"Magnetometer"}
										style={styles.sensorCard}
										height={100}
										image={"magneto"}
										onPress={() => {
											props.navigation.navigate("SensorScreen3Axis", {
												title: "Magnetometer",
												serviceUUID: characteristic.serviceUUID,
												characteristicUUID: characteristic.uuid,
											});
										}}
									></ServiceCard>
								);
							default:
								break;
						}
					})}
					{services.length && services.find((s) => s.uuid === PPG_SERVICE_UUID) !== undefined ? (
						<ServiceCard
							key={"zfsdf"}
							uuid={PPG_SERVICE_UUID}
							title={"Heart Rate"}
							style={styles.sensorCard}
							height={100}
							image={"heart"}
							onPress={() => {
								props.navigation.navigate("HeartRateScreen", { serviceUUID: PPG_SERVICE_UUID });
							}}
						></ServiceCard>
					) : (
						<></>
					)}
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
