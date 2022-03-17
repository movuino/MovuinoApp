import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState, FunctionComponent, useContext, useRef, useLayoutEffect, useCallback } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";

import { RootStackParamList } from "./types";

import AppContext from "./Context";
import ScreenHeader from "./ScreenHeader";
import { Buffer } from "buffer";
import * as shape from "d3-shape";

import { LineChart } from "react-native-svg-charts";
import Divider from "./Divider";
import ChartCard from "./ChartCard";
import { Characteristic, BleError, Subscription } from "react-native-ble-plx";
import Orientation, {OrientationType} from "react-native-orientation-locker";

const START_CHAR_UUID =         "00001401-0000-1000-8000-00805f9b34fb"
const START_STOP_SERIVCE_UUID = "00001400-0000-1000-8000-00805f9b34fb"
const MAG_CHAR_UUID =           "00001104-0000-1000-8000-00805f9b34fb"

/**
 * Returns true if the screen is in portrait mode
 */
const isPortrait = () => {
	const dim = Dimensions.get("screen");
	return dim.height >= dim.width;
};

/**
 * Returns true of the screen is in landscape mode
 */
const isLandscape = () => {
	const dim = Dimensions.get("screen");
	return dim.width >= dim.height;
};

type SensorScreenProps = NativeStackScreenProps<RootStackParamList, "SensorScreen3Axis">;

const SensorScreen: FunctionComponent<SensorScreenProps> = (props) => {
	const { deviceConnected } = useContext(AppContext);
	const [data, setData] = useState<{ x: number[]; y: number[]; z: number[] }>({ x: [], y: [], z: [] });
    const subscriptionRef = useRef<Subscription>();

	const onUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
        let x: number, y: number, z: number;

        const buff = Buffer.from(characteristic?.value as string, "base64");
        const timestamp = (buff.readUInt8(0) << 24) | (buff.readUInt8(1) << 16) | (buff.readUInt8(2) << 8) | buff.readUInt8(3);
        
        if (props.route.params.characteristicUUID === MAG_CHAR_UUID) {
            x = (buff.readInt8(4)<<8 | buff.readInt8(5) * (((( 174 - 128) * 0.5) / 128) + 1));
            y = (buff.readInt8(6)<<8 | buff.readInt8(7) * (((( 177 - 128) * 0.5) / 128) + 1));
            z = (buff.readInt8(8)<<8 | buff.readInt8(9) * (((( 164 - 128) * 0.5) / 128) + 1));
        } else {
            x = buff.readInt8(5)<<8 | buff.readUInt8(6);
            y = buff.readInt8(7)<<8 | buff.readUInt8(8);
            z = buff.readInt8(9)<<8 | buff.readUInt8(10);
            x = ((x * -1) * 16) / 0x8000;
            y = ((y * -1) * 16) / 0x8000;
            z = ((z * -1) * 16) / 0x8000;
        }
        setData((curr) => {
            curr.x.push(x);
            curr.y.push(y);
            curr.z.push(z);
            if (curr.x.length > 50) {
                curr.x.shift();
                curr.y.shift();
                curr.z.shift();
            }
            const n = { ...curr };
            return n;
        });
	};

    const setup = async () => {
        props.navigation.setOptions({title: props.route.params.title})
        await deviceConnected?.discoverAllServicesAndCharacteristics();
        const characteristics = await deviceConnected?.characteristicsForService(props.route.params.serviceUUID);
        const targetCharacteristic = characteristics?.find(char => char.uuid === props.route.params.characteristicUUID);
        if (targetCharacteristic === undefined) return;
        subscriptionRef.current = targetCharacteristic.monitor(onUpdate);
        const startStopCharacteristics = await deviceConnected?.characteristicsForService(START_STOP_SERIVCE_UUID);

        if (startStopCharacteristics === undefined) return;
        const startCharacteristic = startStopCharacteristics.find(char => char.uuid === START_CHAR_UUID)
        console.log(startCharacteristic)
        if (startCharacteristic === undefined) return;
        startCharacteristic.writeWithoutResponse(Buffer.from([1]).toString('base64'))
        Orientation.unlockAllOrientations();
    }

    const cleanup = () => {
        subscriptionRef.current?.remove();
        deviceConnected?.writeCharacteristicWithoutResponseForService(START_STOP_SERIVCE_UUID, START_CHAR_UUID, Buffer.from([2]).toString('base64'));
        Orientation.lockToPortrait();
    }

    const onOrientationChange = (deviceOrientation: OrientationType) => {
        if (deviceOrientation === 'PORTRAIT') {
            props.navigation.setOptions({headerShown: true});
        }
        else if (deviceOrientation === 'LANDSCAPE-LEFT' || deviceOrientation === 'LANDSCAPE-RIGHT') {
            props.navigation.setOptions({headerShown: false});
        }
    }

	useEffect(() => {
        Orientation.addDeviceOrientationListener(onOrientationChange);
        setup()
        return cleanup;
	}, []);

	return (
		<View style={styles.container}>
			{isPortrait() && (
				<View>
					<Text style={styles.cardTitle}>X Axis</Text>
					<ChartCard data={data.x.length ? data.x : [0]} lineColor={"#4A52D1"}></ChartCard>
					<Divider style={{ marginHorizontal: 30, marginVertical: 10 }} color={"#F8F9FD"} />
					<Text style={styles.cardTitle}>Y Axis</Text>
					<ChartCard data={data.y.length ? data.y : [0]} lineColor={"#F55A55"}></ChartCard>
					<Divider style={{ marginHorizontal: 30, marginVertical: 10 }} color={"#F8F9FD"} />
					<Text style={styles.cardTitle}>Z Axis</Text>
					<ChartCard data={data.z.length ? data.z : [0]} lineColor={"#7DDDE1"}></ChartCard>
				</View>
			)}
			{isLandscape() && (
				<View style={{ flex: 1, justifyContent: "center" }}>
					<LineChart
						style={{ height: 300, paddingVertical: 16 }}
						data={[
							{ data: data.x, svg: { stroke: "#4A52D1" } },
							{ data: data.y, svg: { stroke: "#F55A55" } },
							{ data: data.z, svg: { stroke: "#7DDDE1" } },
						]}
						curve={shape.curveNatural}
						contentInset={{ top: 20, left: 10, right: 10, bottom: 20 }}
					/>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	cardTitle: {
		fontFamily: "Nunito",
		fontSize: 24,
		fontWeight: "600",
		marginLeft: 20,
	},
});

export default SensorScreen;
