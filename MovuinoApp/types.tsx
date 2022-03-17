type RootStackParamList = {
	Discovering: undefined;
	Connecting: undefined;
	Home: undefined;
	ConnectionError: undefined;
	SensorHome: undefined;
	SensorScreen3Axis: {
		title: string;
		serviceUUID: string;
		characteristicUUID: string;
	};
	HeartRateScreen: {
		serviceUUID: string;
	};
	Test: undefined,
};

export type { RootStackParamList };
