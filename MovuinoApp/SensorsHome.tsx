import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { FunctionComponent } from "react";

import { SensorsStackParamList } from "./types";

import SensorSelectionScreen from "./SensorSelectionScreen";
import SensorScreen3Axis from "./SensorScreen3Axis"

const ACCEL_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const GYRO_SERVICE_UUID = "4fafc202-1fb5-459e-8fcc-c5c9c331914b";
const MAGNETO_SERVICE_UUID = "4fafc203-1fb5-459e-8fcc-c5c9c331914b";

const NavStack = createNativeStackNavigator<SensorsStackParamList>();

type SensorHomeProps = {};

const SensorHome: FunctionComponent<SensorHomeProps> = (props) => {
	return (
		<NavStack.Navigator screenOptions={{ headerShown: false }}>
			<NavStack.Screen name='SensorHome' component={SensorSelectionScreen} />
            <NavStack.Screen name='SensorScreen3Axis' component={SensorScreen3Axis} />
		</NavStack.Navigator>
	);
};

export default SensorHome;
