import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState, FunctionComponent, useContext, useRef, useLayoutEffect, useCallback } from "react";
import {
	View,
	StyleSheet,
	Text,
	Dimensions,
	Image,
	Animated,
	Easing,
	ScrollView,
	Vibration,
	TouchableOpacity,
} from "react-native";

import { RootStackParamList } from "./types";

import AppContext from "./Context";
import ScreenHeader from "./ScreenHeader";
import { Buffer } from "buffer";
import * as shape from "d3-shape";

import { LineChart } from "react-native-svg-charts";
import { Line } from "react-native-svg";

import Divider from "./Divider";
import ChartCard from "./ChartCard";
import { Characteristic, BleError, Subscription } from "react-native-ble-plx";
import Orientation, { OrientationType } from "react-native-orientation-locker";
import useInterval from "./useInterval";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

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

const PPG_SERVICE_UUID = "00001300-0000-1000-8000-00805f9b34fb";

const PPG_LED1_CHAR_UUID = "00001305-0000-1000-8000-00805f9b34fb";
const PPG_LED2_CHAR_UUID = "00001307-0000-1000-8000-00805f9b34fb";

const PPG_SNR1_CHAR_UUID = "00001313-0000-1000-8000-00805f9b34fb";
const PPG_SNR2_CHAR_UUID = "00001314-0000-1000-8000-00805f9b34fb";

const START_CHAR_UUID = "00001401-0000-1000-8000-00805f9b34fb";
const START_STOP_SERIVCE_UUID = "00001400-0000-1000-8000-00805f9b34fb";

const PPG_LED_INTENSITY_CHAR_UUID = "00001402-0000-1000-8000-00805f9b34fb";
const PPG_LED_CALLIBRATION_CHAR_UUID = "00001405-0000-1000-8000-00805f9b34fb";

const OVERDRIVE_VIBRATION_PATTERN = [1000, 2000, 3000];

type HeartRateScreenProps = NativeStackScreenProps<RootStackParamList, "HeartRateScreen">;

const HeartRateScreen: FunctionComponent<HeartRateScreenProps> = (props) => {
	const { deviceConnected } = useContext(AppContext);
	const [data, setData] = useState<{ x: number[]; y: number[]; z: number[] }>({ x: [], y: [], z: [] });
	const led1Subscription = useRef<Subscription>();
	const [led1Data, setLed1Data] = useState<{ value: number; timestamp: number }[]>([]);
	const [led1Tresh, setLed1Tresh] = useState(0);
	const [led1Pics, setLed1Pics] = useState<number[]>([]);
	const led2Subscription = useRef<Subscription>();
	const [led2Data, setLed2Data] = useState<{ value: number; timestamp: number }[]>([]);
	const [isBeating, setIsBeating] = useState(false);
	const [pulseValue, setPulseValue] = useState(0);
	const snr1Subscription = useRef<Subscription>();
	const snr2Subscription = useRef<Subscription>();
	const [snr1, setSnr1] = useState(0);
	const [snr2, setSnr2] = useState(0);
	const [ledIntensity, setLedIntensity] = useState(0);

	const heartAnimScale = useRef(new Animated.Value(1)).current;

	const onLedCharacteristicUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
		const buff = Buffer.from(characteristic?.value as string, "base64");
		const timestamp =
			(buff.readUInt8(0) << 24) | (buff.readUInt8(1) << 16) | (buff.readUInt8(2) << 8) | buff.readUInt8(3);
		const val1 = buff.readUInt32BE(4);
		const val2 = buff.readUInt32BE(8);
		const avg = (val1 + val2) / 2;

		if (characteristic?.uuid === PPG_LED1_CHAR_UUID) {
			setLed1Data((curr) => {
				curr = [...curr, { value: avg, timestamp: timestamp }];
				if (curr.length > 50) {
					curr.shift();
				}
				return [...curr];
			});
		} else if (characteristic?.uuid === PPG_LED2_CHAR_UUID) {
			setLed2Data((curr) => {
				curr = [...curr, { value: avg, timestamp: timestamp }];
				if (curr.length > 50) {
					curr.shift();
				}
				return [...curr];
			});
		}
	};

	const animateHeart = () => {
		console.log("animate");
		heartAnimScale.setValue(1);
		Animated.sequence([
			Animated.timing(heartAnimScale, {
				toValue: 1.3,
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.timing(heartAnimScale, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}),
		]).start();
	};

	useEffect(() => {
		if (isBeating) {
			if (snr1 > 40 && pulseValue <= 120 && pulseValue >= 60) {
				animateHeart();
			}
		}
	}, [isBeating]);

	const asc = (arr: number[]) => arr.sort((a, b) => a - b);

	const calculatePulse = () => {
		if (!led1Data.length) return;
		const sorted = asc(led1Data.map((e) => e.value));
		const q3 = sorted[Math.floor(sorted.length * 0.75)];
		setLed1Tresh(q3);
		const medianPoint = led1Data[Math.floor(led1Data.length / 2)];
		if (!isBeating && medianPoint.value > q3) {
			setIsBeating(true);
			setLed1Pics((curr) => {
				const arr = [...curr, medianPoint.timestamp];
				const windowStart = medianPoint.timestamp - 10000; // 10 secs
				return arr.filter((p) => p > windowStart);
			});
		} else if (isBeating && medianPoint.value < q3) {
			setIsBeating(false);
		}
	};

	useEffect(calculatePulse, [led1Data]);
	useEffect(() => {
		if (led1Pics.length < 2) return;
		let delays = [];
		for (let i = 1; i < led1Pics.length; i++) {
			delays.push(led1Pics[i] - led1Pics[i - 1]);
		}
		const avg = delays.reduce((prev, curr) => prev + curr) / (led1Pics.length - 1);
		setPulseValue(Math.floor((1 / avg) * 60000));
	}, [led1Pics]);

	const readSNR = async () => {
		const valSnr1 = await deviceConnected?.readCharacteristicForService(PPG_SERVICE_UUID, PPG_SNR1_CHAR_UUID);
		const valSnr2 = await deviceConnected?.readCharacteristicForService(PPG_SERVICE_UUID, PPG_SNR2_CHAR_UUID);
		const buffSnr1 = Buffer.from(valSnr1?.value as string, "base64");
		const buffSnr2 = Buffer.from(valSnr2?.value as string, "base64");
		setSnr1(buffSnr1.readUInt32BE(0) / 100);
		setSnr2(buffSnr2.readUInt32BE(0) / 100);
	};
	useInterval(readSNR, 1000);

	const onOrientationChange = (deviceOrientation: OrientationType) => {
		if (deviceOrientation === "PORTRAIT") {
			props.navigation.setOptions({ headerShown: true });
		} else if (deviceOrientation === "LANDSCAPE-LEFT" || deviceOrientation === "LANDSCAPE-RIGHT") {
			props.navigation.setOptions({ headerShown: false });
		}
	};

	const onOverdrive = (error: BleError | null, characteristic: Characteristic | null) => {
		console.log("overdrive");
		const buff = Buffer.from(characteristic?.value as string, "base64");
		const val = buff[0];
		setLedIntensity((curr) => {
			if (val !== ledIntensity) {
				Vibration.vibrate([500]);
			}
			return val;
		});
	};

	const setup = async () => {
		Orientation.addDeviceOrientationListener(onOrientationChange);
		await deviceConnected?.discoverAllServicesAndCharacteristics();
		led1Subscription.current = deviceConnected?.monitorCharacteristicForService(
			PPG_SERVICE_UUID,
			PPG_LED1_CHAR_UUID,
			onLedCharacteristicUpdate
		);
		led2Subscription.current = deviceConnected?.monitorCharacteristicForService(
			PPG_SERVICE_UUID,
			PPG_LED2_CHAR_UUID,
			onLedCharacteristicUpdate
		);
		deviceConnected?.writeCharacteristicWithoutResponseForService(
			START_STOP_SERIVCE_UUID,
			START_CHAR_UUID,
			Buffer.from([1]).toString("base64")
		);
		deviceConnected?.monitorCharacteristicForService(START_STOP_SERIVCE_UUID, PPG_LED_INTENSITY_CHAR_UUID, onOverdrive);
		Orientation.unlockAllOrientations();
	};

	const cleanup = () => {
		(async () => {
			led1Subscription.current?.remove();
			led2Subscription.current?.remove();
			deviceConnected?.writeCharacteristicWithoutResponseForService(
				START_STOP_SERIVCE_UUID,
				START_CHAR_UUID,
				Buffer.from([2]).toString("base64")
			);
			Orientation.lockToPortrait();
		})();
	};

	useEffect(() => {
		setup();
		return cleanup;
	}, []);

	const onIntensityChange = async (values: number[]) => {
		setLedIntensity(values[0]);
		deviceConnected?.writeCharacteristicWithoutResponseForService(
			START_STOP_SERIVCE_UUID,
			PPG_LED_INTENSITY_CHAR_UUID,
			Buffer.from([values[0]]).toString("base64")
		);
	};

    const onCalibrate = () => {
        deviceConnected?.writeCharacteristicWithoutResponseForService(
			START_STOP_SERIVCE_UUID,
			PPG_LED_CALLIBRATION_CHAR_UUID,
			Buffer.from([1]).toString("base64")
		);
    }

	return (
		<View style={styles.container}>
			{isPortrait() && (
				<View>
					<View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20}}>
                        <Text style={styles.cardTitle}>LED 1</Text>
                        <Text style={styles.snr}>SNR: {snr1.toFixed(1)} db</Text>
                    </View>
                    <LineChart
                        data={[
							{ data: led1Data.length ? led1Data.map(e => e.value) : [0], svg: { stroke: "#4A52D1" } },
                            { data: led1Data.length ? led1Data.map(e => led1Tresh) : [0], svg: { stroke: "#FF0000" }}
						]}
                        width={Dimensions.get("window").width}
                        style={{height: 120, marginHorizontal: 20}}
                        svg={{ stroke: "#4A52D1", strokeWidth: 1 }}
                        curve={shape.curveBasisOpen}
                        contentInset={{ top: 20, left: 10, right: 10, bottom: 20 }}
                    >
                    </LineChart>
					<Divider style={{ marginHorizontal: 30, marginVertical: 10 }} color={"#F8F9FD"} />
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20}}>
                        <Text style={styles.cardTitle}>LED 2</Text>
                        <Text style={styles.snr}>SNR: {snr2.toFixed(1)} db</Text>
                    </View>
					<ChartCard data={led2Data.length ? led2Data.map(e => e.value) : [0]} lineColor={"#4A52D1"}></ChartCard>
					<Divider style={{ marginHorizontal: 30, marginVertical: 10 }} color={"#F8F9FD"} />
					<View style={{ justifyContent: "center", alignContent: 'center', paddingHorizontal: 20}}>
						<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
							<Text>Led Intensity</Text>
							<Text>{ledIntensity}</Text>
						</View>
						<MultiSlider
							onValuesChange={onIntensityChange}
							values={[ledIntensity]}
							min={0}
							max={255}
							containerStyle={{ alignSelf: "center" }}
							selectedStyle={{ backgroundColor: "#F55A55" }}
							markerStyle={{ backgroundColor: "red" }}
						/>

					</View>
                    <View style={{justifyContent: 'center', flexDirection: 'row'}}>
                    <TouchableOpacity style={{ borderColor: '#DDD', borderWidth: 1, borderRadius: 10, width: "40%" }} onPress={onCalibrate}>
						    <Text style={{textAlign: 'center'}}>Calibrate</Text>
					    </TouchableOpacity>
                    </View>
					<View style={{ height: "30%", width: "100%", justifyContent: "center", alignItems: "center" }}>
						<Animated.Image
							source={require("./assets/images/heart-anim.png")}
							style={{ transform: [{ scale: heartAnimScale }] }}
						/>
						<Text style={styles.pulse}>{pulseValue > 60 && pulseValue < 120 ? pulseValue : "..."}</Text>
					</View>
				</View>
			)}
			{isLandscape() && (
				<View style={{ flex: 1, justifyContent: "center" }}>
					<LineChart
						style={{ height: 300, paddingVertical: 16 }}
						data={[
							{ data: led1Data.length ? led1Data.map((e) => e.value) : [0], svg: { stroke: "#4A52D1" } },
							{ data: led2Data.length ? led2Data.map((e) => e.value) : [0], svg: { stroke: "#F55A55" } },
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
	},
	pulse: {
		fontFamily: "Nunito",
		fontSize: 24,
		marginTop: 30,
	},
	snr: {
		fontFamily: "Nunito",
		fontSize: 20,
	},
});

export default HeartRateScreen;
