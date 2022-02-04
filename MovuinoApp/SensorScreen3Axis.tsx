import {NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState, FunctionComponent, useContext, useRef, useLayoutEffect } from "react";
import {
	View,
	StyleSheet,
	Text,
    Dimensions
} from "react-native";

import { SensorsStackParamList } from "./types";

import AppContext from "./Context";
import ScreenHeader from "./ScreenHeader";
import {Buffer} from 'buffer';
import * as shape from 'd3-shape'

import { LineChart } from 'react-native-svg-charts'
import Divider from "./Divider";
import ChartCard from "./ChartCard";
import { Characteristic, BleError, Subscription } from "react-native-ble-plx";
import Orientation from 'react-native-orientation-locker';


/**
 * Returns true if the screen is in portrait mode
 */
 const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
};
 
/**
 * Returns true of the screen is in landscape mode
 */
const isLandscape = () => {
    const dim = Dimensions.get('screen');
    return dim.width >= dim.height;
};

function useInterval(callback: () => void, delay: number | null) {
	const savedCallback = useRef(callback);

	useLayoutEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		if (!delay && delay !== 0) {
			return;
		}

		const id = setInterval(() => savedCallback.current(), delay);
		return () => clearInterval(id);
	}, [delay]);
}




let interval: NodeJS.Timeout | null = null;
type SensorScreenProps = NativeStackScreenProps<SensorsStackParamList, "SensorScreen3Axis">;

const SensorScreen: FunctionComponent<SensorScreenProps> = (props) => {
    const {deviceConnected} = useContext(AppContext);
    const [data, setData] = useState<{x: number[], y: number[], z: number[]}>({x: [], y: [], z: []});

    const onUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
        const buff = Buffer.from(characteristic?.value as string, "base64")
            setData(curr => {
                curr.x.push(buff.readFloatLE(0));
                curr.y.push(buff.readFloatLE(4));
                curr.z.push(buff.readFloatLE(8));
                if (curr.x.length > 50) {
                    curr.x.shift()
                    curr.y.shift()
                    curr.z.shift()
                }
                const n = {...curr}
                return n;
            })
    }
    useEffect(() => {
        let subscription: Subscription;
        deviceConnected?.characteristicsForService(props.route.params.serviceUUID).then(chars => {subscription = chars[0].monitor(onUpdate)})
        Orientation.unlockAllOrientations();
        return (() => {
            Orientation.lockToPortrait();
            subscription.remove();
        })
        
        }, [])

	return (
		<View style={styles.container}>
            {isPortrait() && 
            <View>
                <ScreenHeader title={props.route.params.title} showSettings={false} onBack={props.navigation.goBack}></ScreenHeader>
            <Text style={styles.cardTitle}>X Axis</Text>
            <ChartCard data={data.x.length ? data.x : [0]} lineColor={"#4A52D1"}></ChartCard>
            <Divider style={{marginHorizontal: 30, marginVertical: 10}} color={"#F8F9FD"}/>
            <Text style={styles.cardTitle}>Y Axis</Text>
            <ChartCard data={data.y.length ? data.y : [0]} lineColor={"#F55A55"}></ChartCard>
            <Divider style={{marginHorizontal: 30, marginVertical: 10}} color={"#F8F9FD"}/>
            <Text style={styles.cardTitle}>Z Axis</Text>
            <ChartCard data={data.z.length ? data.z : [0]} lineColor={"#7DDDE1"}></ChartCard>
        </View>}
        {isLandscape() &&
        <View style={{flex: 1 ,justifyContent: "center"}}>
        <LineChart
                style={{ height: 300, paddingVertical: 16}}
                data={[{data: data.x, svg: {stroke: "#4A52D1"}}, {data: data.y, svg: {stroke: "#F55A55"}}, {data: data.z, svg: {stroke: "#7DDDE1"}}]}
                curve={shape.curveNatural}
                contentInset={{ top: 20, left: 10, right: 10, bottom: 20 }}
            />
            </View>
            }
            
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
    }
});

export default SensorScreen;
