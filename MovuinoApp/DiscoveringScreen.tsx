import React, { useEffect, useState, FunctionComponent, useRef, useLayoutEffect, useContext } from "react";

import { Device } from "react-native-ble-plx";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { View, FlatList, StyleSheet, TouchableHighlight, Image, Text, RefreshControl, Platform, PermissionsAndroid } from "react-native";

import AppContext from "./Context";
import LinearGradient from "react-native-linear-gradient";
import MaskedView from "@react-native-community/masked-view";

import { CONNECTIN_PAGE } from "./constants";

import { RootStackParamList } from "./types";
import Orientation from 'react-native-orientation-locker';
import useInterval from './useInterval'

type ListItemProps = {
	title: String | null;
	device: Device;
	onDeviceSelected: (device: Device) => void;
};

const ListItem: FunctionComponent<ListItemProps> = ({ title, device, onDeviceSelected }) => (
	<View style={{ marginHorizontal: 20, marginVertical: 8 }}>
		<TouchableHighlight
			onPress={() => {
				onDeviceSelected(device);
			}}
			activeOpacity={0.8}
			underlayColor='#DDDDDD'
			style={{ borderRadius: 15 }}
		>
			<View
				style={{
					backgroundColor: "#F8F9FD",
					padding: 20,
					borderRadius: 15,
				}}
			>
				<Text style={styles.deviceName}>{device.name}</Text>
			</View>
		</TouchableHighlight>
	</View>
);

type DummySpacerProps = {
	height: string | number | undefined;
};

const DummySpacer: FunctionComponent<DummySpacerProps> = (props) => {
	return <View style={{ height: props.height }}></View>;
};

async function requestLocationPermission() {
	if (Platform.OS != 'android') return;
	try {
	  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
		title: 'Location permission for bluetooth scanning',
		message: 'Location permission must be granted to use Bluetooth LE',
		buttonNeutral: 'Ask Me Later',
		buttonNegative: 'Cancel',
		buttonPositive: 'OK',
	  });
	  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
		console.log('Location permission for bluetooth scanning granted');
		return true;
	  } else {
		console.log('Location permission for bluetooth scanning revoked');
		return false;
	  }
	} catch (err) {
	  console.warn(err);
	  return false;
	}
  }

type DiscoveringDeviceScreenProps = NativeStackScreenProps<RootStackParamList, "Discovering">;

const BleDiscoveringScreen: FunctionComponent<DiscoveringDeviceScreenProps> = (props) => {
	const { bleManager, setDeviceSelected, deviceConnected } = useContext(AppContext); // Retrieve BleManager from Context
	const [loadingDots, setLoadingDots] = useState(1); // Define State used to show then ... animation
	const [devicesDiscovered, setDevicesDiscovered] = useState<Device[]>([]); // Array containing the devices discovered (used to render the list)
	const [refreshing, setRefreshing] = useState<boolean>(false);

	useInterval(() => setLoadingDots((curr) => (curr < 3 ? loadingDots + 1 : 1)), 1000); // Interval used for the ... animation

	const scan = async () => {
		const perm = await requestLocationPermission();
		if (deviceConnected && await deviceConnected.isConnected()) await deviceConnected.cancelConnection();
		bleManager?.startDeviceScan(null, null, (error, device) => {
			if (error) {
				console.error(error);
				return;
			}
			if (device === null || device.name === null) return;

			setDevicesDiscovered((curr) => {
				// Update the State array with the newly discovered device
				if (curr.find((d) => d.id === device.id) === undefined) return [...curr, device];
				return curr;
			});
		});
	};
	useEffect(() => {
    	Orientation.lockToPortrait();
		const subscription = bleManager?.onStateChange((state) => {
			if (state === "PoweredOn") {
				scan();
				subscription?.remove();
			}
		}, true);
	}, []);

	const renderItem = ({ item }: { item: Device }, onDeviceSelected: (device: Device) => void) => (
		<ListItem device={item} title={item.name} onDeviceSelected={onDeviceSelected}></ListItem>
	);

	const onDeviceSelected = (device: Device) => {
		// Function called when a list item is pressed
		bleManager?.stopDeviceScan(); //  Stop the scan and set deviceSelected in the context
		setDeviceSelected(device);
		props.navigation.navigate(CONNECTIN_PAGE as never, {} as never); // TS typing bug => hacky patch :D
	};

	const onRefresh = () => {
		setRefreshing(true);
		bleManager?.stopDeviceScan();
		setDevicesDiscovered([]);
		setTimeout(() => {
			setRefreshing(false);
			scan();
		}, 500);
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Image source={require("./assets/images/bluetoothConnectingScreen.png")} />
				<Text style={styles.title}>Please select your Movuino</Text>
				<Text style={styles.subtitle}>Discovering {".".repeat(loadingDots)}</Text>
			</View>
			<View style={styles.list}>
				<MaskedView
					maskElement={
						<LinearGradient
							colors={["#FFFFFF00", "#FFFFFF", "#FFFFFF", "#FFFFFF00"]}
							locations={[0, 0.1, 0.9, 1]}
							style={styles.linearGradient}
						></LinearGradient>
					}
				>
					<FlatList
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}
						data={devicesDiscovered}
						ListHeaderComponent={<DummySpacer height={30} />}
						ListFooterComponent={<DummySpacer height={30} />}
						renderItem={({ item }) =>
							renderItem(
								{
									item,
								},
								onDeviceSelected
							)
						}
					/>
				</MaskedView>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	list: {
		flex: 1,
	},
	item: {
		backgroundColor: "#F8F9FD",
		padding: 20,
		marginVertical: 8,
		borderRadius: 15,
		marginHorizontal: 20,
	},
	header: {
		flex: 0.7,
		fontSize: 32,
		backgroundColor: "#fff",
		alignItems: "center",
		paddingTop: 60,
	},
	deviceName: {
		fontSize: 14,
		fontWeight: "800",
		fontFamily: "Nunito",
	},
	linearGradient: {
		flex: 1,
		width: "100%",
	},
	title: {
		marginTop: 40,
		fontSize: 20,
		fontWeight: "800",
		fontFamily: "Nunito",
	},
	subtitle: {
		marginTop: 20,
		fontSize: 14,
		fontWeight: "400",
		fontFamily: "Nunito",
	},
	info: {
		fontWeight: "600",
		marginTop: 5,
		fontSize: 14,
		fontFamily: "Nunito",
		color: "#4A78FF",
		textDecorationLine: "underline",
	},
});

export default BleDiscoveringScreen;
